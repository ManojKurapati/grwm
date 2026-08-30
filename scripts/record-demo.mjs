#!/usr/bin/env node
/**
 * Records the product demo.
 *
 * Drives the real app in a real browser, overlays captions, and writes a video.
 * Nothing is faked: the outfit, the missing piece and the verdict all come from
 * live Convex / Gemini / Context.dev calls, so the runtime varies with latency.
 *
 *   node scripts/record-demo.mjs                 # record + encode mp4
 *   TARGET_SECONDS=85 node scripts/record-demo.mjs
 *
 * Requires a dev server on BASE_URL and Google Chrome installed.
 */

import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, renameSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, ".demo", "raw");
const OUT = join(ROOT, ".demo");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SIZE = { width: 1440, height: 900 };
const TARGET_SECONDS = Number(process.env.TARGET_SECONDS ?? 82);

/* ------------------------------------------------------------------ overlay */
/**
 * Injected before every document so captions survive client-side navigation.
 * Kept in one string because it runs in the page, not here.
 */
const OVERLAY = () => {
  const style = document.createElement("style");
  style.textContent = `
    #grwm-cap {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483646;
      display: flex; justify-content: center; padding: 0 0 34px;
      pointer-events: none; opacity: 0;
      transition: opacity .45s cubic-bezier(.16,1,.3,1);
      font-family: var(--font-inter), system-ui, sans-serif;
    }
    #grwm-cap.on { opacity: 1; }
    #grwm-cap > div {
      max-width: 62ch; padding: 16px 26px 18px;
      background: rgba(22,20,15,.94); color: #f6f4ef;
      backdrop-filter: blur(6px);
    }
    #grwm-cap .k {
      display: block; font-size: 10.5px; font-weight: 500;
      letter-spacing: .18em; text-transform: uppercase;
      color: #b4aa9b; margin-bottom: 7px;
    }
    #grwm-cap .t { font-size: 19px; line-height: 1.4; letter-spacing: -.005em; }

    #grwm-card {
      position: fixed; inset: 0; z-index: 2147483647;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 22px; background: #f6f4ef; color: #16140f;
      opacity: 0; pointer-events: none;
      transition: opacity .6s cubic-bezier(.16,1,.3,1);
      font-family: var(--font-inter), system-ui, sans-serif;
    }
    #grwm-card.on { opacity: 1; }
    #grwm-card .k {
      font-size: 11px; font-weight: 500; letter-spacing: .2em;
      text-transform: uppercase; color: #8a8377;
    }
    #grwm-card .t {
      font-family: var(--font-instrument), ui-serif, Georgia, serif;
      font-size: 72px; line-height: .95; letter-spacing: -.02em;
      text-align: center; max-width: 22ch;
    }
    #grwm-card .s {
      font-size: 17px; color: #55504a; text-align: center; max-width: 46ch;
      line-height: 1.5;
    }
    /* the cursor is a distraction in a recording */
    * { cursor: none !important; }
  `;
  const mount = () => {
    if (document.getElementById("grwm-cap")) return;
    document.head.appendChild(style);
    const cap = document.createElement("div");
    cap.id = "grwm-cap";
    cap.innerHTML = `<div><span class="k"></span><span class="t"></span></div>`;
    const card = document.createElement("div");
    card.id = "grwm-card";
    card.innerHTML = `<span class="k"></span><span class="t"></span><span class="s"></span>`;
    document.body.append(cap, card);
  };
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  window.__cap = (kicker, text) => {
    const el = document.getElementById("grwm-cap");
    if (!el) return;
    if (text === null) {
      el.classList.remove("on");
      return;
    }
    el.querySelector(".k").textContent = kicker ?? "";
    el.querySelector(".t").textContent = text ?? "";
    el.classList.add("on");
  };

  window.__card = (kicker, title, sub) => {
    const el = document.getElementById("grwm-card");
    if (!el) return;
    if (title === null) {
      el.classList.remove("on");
      return;
    }
    el.querySelector(".k").textContent = kicker ?? "";
    el.querySelector(".t").textContent = title ?? "";
    el.querySelector(".s").textContent = sub ?? "";
    el.classList.add("on");
  };

  /** Eased scroll — `window.scrollTo({behavior:"smooth"})` is too abrupt. */
  window.__glide = (to, ms) =>
    new Promise((resolve) => {
      const from = window.scrollY;
      const target = to === "bottom" ? document.body.scrollHeight : to;
      const distance = Math.min(target, document.body.scrollHeight) - from;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / ms);
        const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
        window.scrollTo(0, from + distance * eased);
        p < 1 ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });
};

/* -------------------------------------------------------------------- helpers */
const mkHelpers = (page) => ({
  cap: (kicker, text) => page.evaluate(([k, t]) => window.__cap(k, t), [kicker, text]),
  hideCap: () => page.evaluate(() => window.__cap(null, null)),
  card: (kicker, title, sub) =>
    page.evaluate(([k, t, s]) => window.__card(k, t, s), [kicker, title, sub]),
  hideCard: () => page.evaluate(() => window.__card(null, null, null)),
  glide: (to, ms) => page.evaluate(([t, m]) => window.__glide(t, m), [to, ms]),
  beat: (ms) => page.waitForTimeout(ms),
});

async function main() {
  rmSync(RAW, { recursive: true, force: true });
  mkdirSync(RAW, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: RAW, size: SIZE },
    colorScheme: "light",
  });
  await context.addInitScript(OVERLAY);
  const page = await context.newPage();
  const { cap, hideCap, card, hideCard, glide, beat } = mkHelpers(page);

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  const t0 = Date.now();
  const mark = (label) =>
    console.log(`  ${String(((Date.now() - t0) / 1000).toFixed(1)).padStart(5)}s  ${label}`);

  /* ---------------------------------------------------------------- 1. title */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=93%", { timeout: 30000 });
  await card(
    "GRWM AI",
    "Stop wondering what to wear.",
    "Shop your wardrobe before shopping the internet.",
  );
  await beat(3600);
  await hideCard();
  await beat(900);
  mark("title");

  /* -------------------------------------------------------------- 2. landing */
  await cap("The idea", "You already own enough clothes. GRWM styles what is in your wardrobe — before it ever suggests buying anything.");
  await beat(4200);
  await cap("How it thinks", "It reads the occasion, shops your wardrobe, and only then looks for the one real gap.");
  await glide(760, 2600);
  await beat(3200);
  await hideCap();
  await glide(0, 900);
  mark("landing");

  /* ------------------------------------------------------------- 3. wardrobe */
  await page.goto(`${BASE}/wardrobe`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Cream linen shirt", { timeout: 30000 });
  await beat(1200);
  await cap("Wardrobe memory", "Sixteen real pieces, stored in Convex. Every garment is structured data — colour, fabric, formality, the weather it suits.");
  await beat(3800);
  await glide(560, 2400);
  await beat(1600);
  await glide(0, 1000);

  await cap("Filters", "Filtered by category, straight out of the database.");
  await page.getByRole("button", { name: /^Shoes/ }).click();
  await beat(2600);
  await page.getByRole("button", { name: /^All/ }).click();
  await beat(1200);

  await cap("What GRWM knows", "Tap a piece to see the attributes the stylist actually reasons over.");
  await page.getByText("Cream linen shirt").first().click();
  await page.waitForSelector("text=Formality", { timeout: 15000 });
  await beat(4200);
  await page.keyboard.press("Escape");
  await beat(700);
  await hideCap();
  mark("wardrobe");

  /* ------------------------------------------------------------------ 4. ask */
  await page.goto(`${BASE}/ask`, { waitUntil: "networkidle" });
  await beat(900);
  await cap("Ask GRWM", "One sentence. Where you are going, and how you want to look.");
  const query =
    "Rooftop date in Dubai tonight. Smart casual. Make me look effortless, not overdressed.";
  await page.locator("textarea").click();
  await page.locator("textarea").pressSequentially(query, { delay: 26 });
  await beat(1100);
  await cap("Energy", "A style dial, not a filter — it shifts how the fit is built.");
  await page.getByRole("button", { name: "Clean" }).click();
  await beat(1600);

  await cap("Live reasoning", "Gemini reads the occasion, pulls the real Dubai weather, then builds the fit from wardrobe items that actually exist.");
  await page.getByRole("button", { name: "Build the fit" }).click();
  await page.waitForSelector("text=Why this works", { timeout: 120000 });
  mark("outfit rendered");
  await beat(2600);

  await cap("Context", "Dubai, live temperature, read as an evening rooftop date with a smart-casual dress code.");
  await beat(3000);
  await cap("The fit", "Built from clothes already owned, with a match score — and an explanation, not a vibe.");
  await glide(620, 2400);
  await beat(3400);
  await cap("Why this works", "Weather, occasion, style and colour scored separately. Deterministic code does the facts; the model does the judgement.");
  await glide(1500, 2600);
  await beat(3600);

  /* Missing Piece runs after the outfit; it may still be resolving. */
  await cap("The Missing Piece Engine", "Only now does GRWM look outward — Context.dev extracts a real product from a real retailer.");
  await page
    .waitForSelector("text=/Unlocks \\d+ outfit|Nothing to buy/", { timeout: 150000 })
    .catch(() => mark("missing piece slow — continuing"));
  await glide("bottom", 3000);
  await beat(4200);
  await hideCap();
  mark("ask");

  /* ------------------------------------------------------------------ 5. buy */
  await page.goto(`${BASE}/buy`, { waitUntil: "networkidle" });
  await page.waitForSelector("button:has-text('sneakers')", { timeout: 30000 });
  await beat(1000);
  await cap("Should I buy this?", "Paste any product URL. It is extracted live, then judged against everything you already own.");
  await beat(3200);
  await page.locator("button:has-text('sneakers')").first().click();
  await page.waitForSelector("text=/BUY IT|MAYBE|SKIP IT/", { timeout: 150000 });
  await beat(2400);
  const verdict = await page
    .locator("h2")
    .filter({ hasText: /BUY IT|MAYBE|SKIP IT/ })
    .first()
    .textContent();
  await cap(
    "The verdict",
    verdict?.includes("SKIP")
      ? "Redundancy divides the score — so GRWM tells you to skip it. That is the point."
      : "Wardrobe compatibility and outfits unlocked, scored against the pieces you own.",
  );
  await beat(3600);
  await glide(700, 2600);
  await beat(3400);
  await hideCap();
  mark(`buy (${verdict?.trim()})`);

  /* -------------------------------------------------------------------- 6. end */
  await card(
    "GRWM AI",
    "Shop your wardrobe first.",
    "Convex · Gemini · Context.dev — built with Devin.",
  );
  await beat(3800);

  const raw = await page.video().path();
  await context.close();
  await browser.close();

  const seconds = (Date.now() - t0) / 1000;
  console.log(`\nrecorded ${seconds.toFixed(1)}s of walkthrough`);
  if (errors.length) console.log(`page errors: ${errors.length} — ${errors[0]}`);

  encode(raw);
}

/** Encode to mp4, gently compressing time so the result lands near TARGET_SECONDS. */
function encode(raw) {
  const duration = Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1", raw,
    ]).toString().trim(),
  );
  const speed = Math.max(1, duration / TARGET_SECONDS);
  const mp4 = join(OUT, "grwm-demo.mp4");
  console.log(`raw ${duration.toFixed(1)}s -> ${(duration / speed).toFixed(1)}s (${speed.toFixed(2)}x)`);

  execFileSync("ffmpeg", [
    "-y", "-i", raw,
    "-vf", `setpts=PTS/${speed},fps=30,scale=1440:900:flags=lanczos`,
    "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    mp4,
  ], { stdio: ["ignore", "ignore", "inherit"] });

  console.log(`\n-> ${mp4}`);
}

main().catch((error) => {
  console.error(`\nrecording failed: ${error.message.split("\n")[0]}`);
  const [file] = readdirSync(RAW).filter((f) => f.endsWith(".webm"));
  if (file) {
    renameSync(join(RAW, file), join(OUT, "grwm-demo-FAILED.webm"));
    console.error(`partial video -> .demo/grwm-demo-FAILED.webm`);
  }
  process.exit(1);
});
