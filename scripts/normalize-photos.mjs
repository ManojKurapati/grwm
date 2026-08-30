#!/usr/bin/env node
/**
 * Normalise harvested product photography to a pure-white background.
 *
 * The wardrobe grid composites photographs onto the paper ground with
 * `mix-blend-multiply`, which only lands seamlessly when the photo's background
 * is actually white: a shot on pale grey multiplies to something darker than
 * the paper and reads as a grey rectangle sitting in the grid.
 *
 * Retailers shoot on white, off-white and pale grey more or less at random, so
 * we measure each image's own background from its border and stretch the white
 * point to match. The scale factor is small (a #eee background is a 1.07x
 * stretch), so the garment itself is essentially untouched.
 *
 * Uses Playwright's canvas rather than a native image library because Playwright
 * is already a dependency and ImageMagick is not.
 *
 *   node scripts/normalize-photos.mjs                  # all photos
 *   node scripts/normalize-photos.mjs black-loafers    # one
 */

import { chromium } from "playwright-core";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "wardrobe");

/** Runs in the browser: measure the border, stretch the white point. */
function normalizeInPage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("decode failed"));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);

      const { width, height } = canvas;
      const buffer = ctx.getImageData(0, 0, width, height);
      const px = buffer.data;

      // Estimate the background from a border band, using the median so a logo
      // or a shadow in one corner cannot drag the estimate.
      const band = Math.max(2, Math.round(Math.min(width, height) * 0.02));
      const samples = [[], [], []];
      const push = (x, y) => {
        const i = (y * width + x) * 4;
        samples[0].push(px[i]);
        samples[1].push(px[i + 1]);
        samples[2].push(px[i + 2]);
      };
      for (let x = 0; x < width; x += 3) {
        for (let d = 0; d < band; d += 1) {
          push(x, d);
          push(x, height - 1 - d);
        }
      }
      for (let y = 0; y < height; y += 3) {
        for (let d = 0; d < band; d += 1) {
          push(d, y);
          push(width - 1 - d, y);
        }
      }
      const median = samples.map((channel) => {
        channel.sort((a, b) => a - b);
        return channel[Math.floor(channel.length / 2)] || 255;
      });

      // A very dark border means the product bleeds to the edge; leave it alone
      // rather than blowing the whole image out.
      const tooDark = Math.min(...median) < 200;
      const scale = median.map((value) => (tooDark ? 1 : 255 / Math.max(value, 1)));

      if (!tooDark) {
        for (let i = 0; i < px.length; i += 4) {
          px[i] = Math.min(255, px[i] * scale[0]);
          px[i + 1] = Math.min(255, px[i + 1] * scale[1]);
          px[i + 2] = Math.min(255, px[i + 2] * scale[2]);
        }
        ctx.putImageData(buffer, 0, 0);
      }

      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", 0.86),
        background: median,
        scale,
        skipped: tooDark,
      });
    };
    image.src = dataUrl;
  });
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const files = readdirSync(DIR)
  .filter((f) => /\.jpe?g$/i.test(f))
  .filter((f) => only.length === 0 || only.includes(f.replace(/\.\w+$/, "")))
  .sort();

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("about:blank");

for (const file of files) {
  const path = join(DIR, file);
  const input = `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
  const result = await page.evaluate(normalizeInPage, input);

  if (result.skipped) {
    console.log(`  skip  ${file.padEnd(30)} border too dark (${result.background.join(",")})`);
    continue;
  }

  const bytes = Buffer.from(result.dataUrl.split(",")[1], "base64");
  writeFileSync(path, bytes);
  const pct = result.scale.map((s) => `${((s - 1) * 100).toFixed(1)}%`).join("/");
  console.log(
    `  ok    ${file.padEnd(30)} bg rgb(${result.background.join(",")}) -> white  (+${pct})`,
  );
}

await browser.close();
console.log(`\n${files.length} photo(s) processed`);
