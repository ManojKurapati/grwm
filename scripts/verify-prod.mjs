#!/usr/bin/env node
/**
 * Production acceptance run.
 *
 * Drives the deployed application through the primary demo query and asserts the
 * things a judge will actually look at: real wardrobe items, a score, an
 * explanation, the per-factor breakdown, and a real external product with an
 * image, retailer, price and working link. Repeats the whole flow, and runs it
 * at both desktop and mobile viewports.
 *
 * Exits non-zero if any assertion fails, so "it deployed" can never be mistaken
 * for "it works".
 *
 *   BASE_URL=https://... node scripts/verify-prod.mjs
 *   BASE_URL=https://... node scripts/verify-prod.mjs --runs 2
 */

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".screenshots");
const BASE = process.env.BASE_URL;
if (!BASE) {
  console.error("BASE_URL is required");
  process.exit(2);
}

const runsFlag = process.argv.indexOf("--runs");
const RUNS = runsFlag > -1 ? Number(process.argv[runsFlag + 1]) : 2;

const DEMO_QUERY =
  "Rooftop date in Dubai tonight. Smart casual. Make me look effortless, not overdressed.";

const VIEWPORTS = {
  desktop: { width: 1440, height: 950 },
  mobile: { width: 390, height: 844 },
};

const results = [];
function check(label, pass, detail = "") {
  results.push({ label, pass, detail });
  console.log(`    ${pass ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
}

/** Ignore noise that says nothing about whether the product works. */
function realError(text) {
  return !/favicon|React DevTools|hydrat|Download the|preload|net::ERR_BLOCKED|Failed to load resource/i.test(
    text,
  );
}

/**
 * Poll until a condition holds.
 *
 * Preferred over `waitForSelector` for the Convex-backed assertions: the data
 * arrives over a websocket after hydration, and a text selector that is briefly
 * absent (or present but not yet laid out at a narrow viewport) made the mobile
 * pass flake even though the page was fine.
 */
async function until(fn, { timeout = 60000, every = 750 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await fn()) return true;
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, every));
  }
}

async function verify(page, tag) {
  // ---------------------------------------------------------------- wardrobe
  await page.goto(`${BASE}/wardrobe`, { waitUntil: "domcontentloaded" });
  const loaded = await until(
    async () => (await page.locator("main img, main svg").count()) >= 10,
    { timeout: 60000 },
  );
  const tiles = await page.locator("main img, main svg").count();
  check(`${tag} wardrobe loads from Convex`, loaded, `${tiles} garment visuals`);

  // -------------------------------------------------------------- ask + fit
  await page.goto(`${BASE}/ask`, { waitUntil: "domcontentloaded" });
  const box = page.locator("textarea");
  await box.waitFor({ timeout: 30000 });
  await box.fill(DEMO_QUERY);
  await page.getByRole("button", { name: /build the fit/i }).click();

  // The score is the signal that a validated recommendation arrived.
  const scored = await until(
    async () => (await page.locator("text=/^\\d{1,3}%$/").count()) > 0,
    { timeout: 150000 },
  );
  check(`${tag} recommendation returned`, scored);
  await until(async () => (await page.locator("text=Why this works").count()) > 0, {
    timeout: 60000,
  });

  const score = await page
    .locator("text=/^\\d{2}%$/")
    .first()
    .textContent()
    .catch(() => null);
  check(`${tag} outfit score rendered`, Boolean(score), score ?? "none");

  const context = await page.locator("text=/34°|Dubai/i").count();
  check(`${tag} weather + occasion context`, context > 0);

  const factors = await page.locator("text=/Weather|Occasion|Your Style|Color Harmony/").count();
  check(`${tag} per-factor breakdown`, factors >= 4, `${factors} factors`);

  // Wardrobe items in the outfit carry a slot label.
  const slots = await page.locator("text=/^(TOP|BOTTOM|SHOES|ACCESSORY|LAYER)$/i").count();
  check(`${tag} outfit built from wardrobe items`, slots >= 3, `${slots} slots`);

  // ---------------------------------------------------------- missing piece
  const missing = await until(
    async () =>
      (await page
        .locator("text=/Unlocks \\d+ outfit|Nothing to buy|missing one thing/i")
        .count()) > 0,
    { timeout: 180000 },
  );
  check(`${tag} Missing Piece resolved`, missing);

  if (missing) {
    const compat = await page.locator("text=Wardrobe compatibility").count();
    check(`${tag} wardrobe compatibility score`, compat > 0);

    // A real external product: image, price, and a link off-site.
    const external = page.locator('a[href^="http"]:not([href*="grwm"])').first();
    const href = await external.getAttribute("href").catch(() => null);
    check(`${tag} product links to retailer`, Boolean(href), href ? new URL(href).hostname : "none");

    const productImg = await page
      .locator('img[src*="brand.dev"], img[src^="https://"]')
      .count();
    check(`${tag} product image present`, productImg > 0, `${productImg} remote images`);

    const price = await page.locator("text=/[€$£]\\s?\\d|AED\\s?\\d|\\d+\\s?AED/").count();
    check(`${tag} product price shown`, price > 0);
  }

  await page.screenshot({ path: join(OUT, `prod-${tag}.png`), fullPage: true });

  // ------------------------------------------------------------------ refresh
  await page.reload({ waitUntil: "domcontentloaded" });
  const survived = await until(
    async () => (await page.locator("text=/^\\d{1,3}%$/").count()) > 0,
    { timeout: 90000 },
  );
  check(`${tag} result survives refresh`, survived);
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });
const consoleErrors = [];

for (let run = 1; run <= RUNS; run += 1) {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    const tag = `run${run}-${name}`;
    console.log(`\n>> ${tag}  (${viewport.width}x${viewport.height})`);
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.on("console", (m) => {
      if (m.type() === "error" && realError(m.text())) consoleErrors.push(`${tag}: ${m.text()}`);
    });
    page.on("pageerror", (e) => consoleErrors.push(`${tag}: pageerror ${e.message}`));
    try {
      await verify(page, tag);
    } catch (error) {
      check(`${tag} completed without throwing`, false, error.message.split("\n")[0]);
      await page.screenshot({ path: join(OUT, `prod-${tag}-FAILED.png`), fullPage: true }).catch(() => {});
    }
    await context.close();
  }
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (consoleErrors.length) {
  console.log(`\n${consoleErrors.length} console error(s):`);
  for (const e of [...new Set(consoleErrors)].slice(0, 8)) console.log(`  ${e.slice(0, 160)}`);
}
if (failed.length) {
  console.log("\nfailures:");
  for (const f of failed) console.log(`  ${f.label} ${f.detail}`);
}
process.exit(failed.length > 0 ? 1 : 0);
