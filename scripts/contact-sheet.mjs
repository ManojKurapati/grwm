#!/usr/bin/env node
/**
 * Contact sheet for the harvested wardrobe photography.
 *
 * Renders every image in `public/wardrobe/` into one labelled grid and
 * screenshots it, so a whole harvest can be eyeballed in a single glance
 * instead of opening sixteen files. Wrong-garment matches (insoles instead of
 * runners) are obvious here and invisible in a filename.
 *
 *   node scripts/contact-sheet.mjs
 */

import { chromium } from "playwright-core";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "wardrobe");
const OUT = join(ROOT, ".screenshots", "wardrobe-contact-sheet.png");

const credits = existsSync(join(DIR, "credits.json"))
  ? JSON.parse(readFileSync(join(DIR, "credits.json"), "utf8"))
  : {};

const files = readdirSync(DIR).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();

const cells = files
  .map((file) => {
    const key = file.replace(/\.\w+$/, "");
    const credit = credits[key];
    const data = readFileSync(join(DIR, file)).toString("base64");
    return `
      <figure>
        <img src="data:image/jpeg;base64,${data}" alt="${key}" />
        <figcaption>
          <strong>${key}</strong>
          <span>${credit ? `${credit.retailer} · ${credit.name}` : "no credit"}</span>
        </figcaption>
      </figure>`;
  })
  .join("");

const html = `<!doctype html><meta charset="utf-8" />
<style>
  body { margin:0; padding:28px; background:#f6f4ef; font:13px/1.4 -apple-system,system-ui,sans-serif; color:#16140f; }
  h1 { font-size:15px; letter-spacing:.14em; text-transform:uppercase; color:#8a8377; font-weight:500; margin:0 0 22px; }
  .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  figure { margin:0; }
  img { width:100%; aspect-ratio:4/5; object-fit:cover; background:#efece5; display:block; }
  figcaption { padding-top:8px; display:flex; flex-direction:column; gap:2px; }
  strong { font-weight:500; }
  span { color:#8a8377; font-size:11px; }
</style>
<h1>${files.length} harvested · public/wardrobe</h1>
<div class="grid">${cells}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log(`${files.length} images -> ${OUT}`);
