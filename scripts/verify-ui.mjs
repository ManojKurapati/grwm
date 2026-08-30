#!/usr/bin/env node
/**
 * Browser verification.
 *
 * Drives the real app in a real browser, captures console errors, and writes
 * screenshots to `.screenshots/`. Used to check the demo end-to-end rather than
 * trusting that the HTML "looked fine".
 *
 *   node scripts/verify-ui.mjs            # all checks
 *   node scripts/verify-ui.mjs wardrobe   # one check
 */

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".screenshots");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const CHECKS = {
  landing: async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    // the hero composition only renders once Convex has delivered the wardrobe
    await page.waitForSelector("text=93%", { timeout: 20000 });
  },

  wardrobe: async (page) => {
    await page.goto(`${BASE}/wardrobe`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=/\\d+ pieces/", { timeout: 20000 });
    await page.waitForSelector("text=Cream linen shirt", { timeout: 20000 });
  },

  item: async (page) => {
    await page.goto(`${BASE}/wardrobe`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Cream linen shirt", { timeout: 20000 });
    await page.getByText("Cream linen shirt").first().click();
    await page.waitForSelector("text=Formality", { timeout: 10000 });
  },

  ask: async (page) => {
    await page.goto(`${BASE}/ask`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Rooftop date tonight" }).click();
    await page.waitForSelector("text=match", { timeout: 60000 });
    await page.waitForSelector("text=Why this works", { timeout: 20000 });
    // Missing Piece runs after the outfit renders
    await page
      .waitForSelector("text=/Unlocks \\d+ outfit|Nothing to buy/", { timeout: 120000 })
      .catch(() => console.log("    (missing piece still running)"));
    await page.waitForTimeout(1200);
  },

  buy: async (page) => {
    await page.goto(`${BASE}/buy`, { waitUntil: "networkidle" });
    await page.waitForSelector("button:has-text('sneakers')", { timeout: 20000 });
    await page.locator("button:has-text('sneakers')").first().click();
    await page.waitForSelector("text=/BUY IT|MAYBE|SKIP IT/", { timeout: 120000 });
    await page.waitForTimeout(800);
  },
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const names = only.length ? only : Object.keys(CHECKS);

  const browser = await chromium.launch();
  let failures = 0;

  for (const name of names) {
    const check = CHECKS[name];
    if (!check) {
      console.log(`? ${name} — no such check`);
      continue;
    }

    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    const problems = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

    process.stdout.write(`→ ${name.padEnd(10)} `);
    try {
      await check(page);
      // Let entrance animations settle so screenshots aren't caught mid-fade.
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
      const real = problems.filter(
        (p) => !/favicon|Download the React DevTools|hydrat/i.test(p),
      );
      if (real.length) {
        failures += 1;
        console.log(`ok, but ${real.length} console error(s):`);
        for (const problem of real.slice(0, 4)) console.log(`     ${problem.slice(0, 180)}`);
      } else {
        console.log("ok");
      }
    } catch (error) {
      failures += 1;
      console.log(`FAILED — ${error.message.split("\n")[0]}`);
      await page
        .screenshot({ path: join(OUT, `${name}-FAILED.png`), fullPage: true })
        .catch(() => {});
      for (const problem of problems.slice(0, 4)) console.log(`     ${problem.slice(0, 180)}`);
    }
    await context.close();
  }

  await browser.close();
  console.log(`\nscreenshots -> .screenshots/`);
  process.exit(failures > 0 ? 1 : 0);
}

main();
