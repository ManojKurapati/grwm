#!/usr/bin/env node
/**
 * Source real garment photography for the seeded wardrobe.
 *
 * Runs the existing Context.dev discovery action once per seeded piece, picks
 * the best-matching product photo, and writes it to `public/wardrobe/`. The
 * seed already points at those paths, so once the files exist the wardrobe
 * renders as photography instead of illustration.
 *
 * Images are committed to the repo on purpose: the demo must not depend on a
 * conference network, and Context.dev credits are finite.
 *
 *   node scripts/harvest-wardrobe-photos.mjs                    # missing only
 *   node scripts/harvest-wardrobe-photos.mjs --force             # re-harvest
 *   node scripts/harvest-wardrobe-photos.mjs black-loafers ...   # specific keys
 */

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "wardrobe");

/**
 * One target per seeded piece. `key` matches `SEED_WARDROBE[].key` and the
 * filename the seed's `imageUrl` points at. Attributes are tuned to bias the
 * search toward the right colour and cut, since that is what makes the photo
 * read as *this* garment rather than merely the right category.
 */
const TARGETS = [
  { key: "cream-linen-shirt", type: "cream linen shirt", attrs: ["mens", "relaxed", "button-up", "ecru"] },
  { key: "black-fitted-shirt", type: "black shirt", attrs: ["mens", "slim fit", "cotton", "button-up"] },
  { key: "white-oxford-shirt", type: "white oxford shirt", attrs: ["mens", "button-down collar", "cotton"] },
  { key: "black-tshirt", type: "black t-shirt", attrs: ["mens", "crew neck", "cotton", "plain"] },
  { key: "white-tshirt", type: "white t-shirt", attrs: ["mens", "crew neck", "cotton", "plain"] },
  { key: "black-relaxed-trousers", type: "black relaxed trousers", attrs: ["mens", "straight leg", "tailored"] },
  { key: "beige-trousers", type: "beige chino trousers", attrs: ["mens", "tapered", "cotton twill"] },
  { key: "blue-jeans", type: "mid wash blue jeans", attrs: ["mens", "straight leg", "denim"] },
  { key: "white-sneakers", type: "white leather sneakers", attrs: ["mens", "minimal", "low top"] },
  { key: "grey-runners", type: "grey knit running shoes", attrs: ["mens", "wool", "comfort"] },
  { key: "black-loafers", type: "black leather loafers", attrs: ["mens", "penny loafer", "polished"] },
  { key: "stone-overshirt", type: "stone overshirt jacket", attrs: ["mens", "unstructured", "cotton", "taupe"] },
  { key: "charcoal-knit", type: "charcoal merino sweater", attrs: ["mens", "fine gauge", "crew neck"] },
  { key: "silver-watch", type: "silver steel watch", attrs: ["mens", "minimal", "bracelet"] },
  { key: "silver-chain", type: "sterling silver chain necklace", attrs: ["mens", "thin", "minimal"] },
  { key: "black-sunglasses", type: "black acetate sunglasses", attrs: ["angular", "unisex"] },
];

/**
 * Every candidate image across every returned product, best-first.
 *
 * Retailers sometimes hand back a logo or a tracking pixel as the primary
 * image, so a single "first product with an imageUrl" pick is not reliable —
 * we walk the whole list until one download actually looks like a photograph.
 */
function candidateImages(products) {
  const urls = [];
  for (const product of products) {
    for (const url of [product.imageUrl, ...(product.images ?? [])]) {
      if (url && !urls.some((c) => c.url === url)) urls.push({ url, product });
    }
  }
  return urls;
}

async function discover(target) {
  const payload = JSON.stringify({
    productType: target.type,
    attributes: target.attrs,
    maxPrice: 400,
    currency: "USD",
    audience: "mens",
    maxPages: 2,
  });
  const { stdout } = await run(
    "npx",
    ["convex", "run", "contextDev:discover", payload],
    { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 },
  );
  // `convex run` prints deployment logs before the JSON result; the result is
  // the last top-level object in the stream.
  const start = stdout.indexOf("{\n  \"pagesExtracted\"");
  const json = start >= 0 ? stdout.slice(start) : stdout.slice(stdout.indexOf("{"));
  return JSON.parse(json);
}

/** Smallest edge we will accept — below this it is an icon, not a product shot. */
const MIN_EDGE = 500;

/**
 * Fetch, verify it is a real photograph, and normalise to a web-sized JPEG.
 *
 * `sips` ships with macOS, which is where this is run; it also gives us a free
 * dimension check. Source images are routinely 2400px PNGs, far too heavy to
 * commit sixteen of.
 */
async function fetchPhoto(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 8192) throw new Error(`too small (${buffer.length}b)`);

  const temp = `${dest}.download`;
  writeFileSync(temp, buffer);
  try {
    const { stdout } = await run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", temp]);
    const width = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
    const height = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
    if (Math.min(width, height) < MIN_EDGE) {
      throw new Error(`too low-res (${width}x${height})`);
    }
    await run("sips", [
      "-s", "format", "jpeg",
      "-s", "formatOptions", "82",
      "-Z", "1200",
      temp, "--out", dest,
    ]);
  } finally {
    await import("node:fs").then((fs) => fs.existsSync(temp) && fs.unlinkSync(temp));
  }
  return (await import("node:fs")).statSync(dest).size;
}

async function harvest(target, force) {
  const dest = join(OUT_DIR, `${target.key}.jpg`);
  if (!force && existsSync(dest)) return { key: target.key, status: "skipped" };

  const { products } = await discover(target);
  const candidates = candidateImages(products);
  if (candidates.length === 0) return { key: target.key, status: "no-product" };

  const problems = [];
  for (const { url, product } of candidates) {
    try {
      const bytes = await fetchPhoto(url, dest);
      return {
        key: target.key,
        status: "ok",
        bytes,
        name: product.name,
        retailer: product.retailer,
        url: product.url,
        imageUrl: url,
      };
    } catch (error) {
      problems.push(`${url.slice(-16)}: ${error.message}`);
    }
  }
  return { key: target.key, status: "no-usable-image", problems };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));
  const targets = only.length
    ? TARGETS.filter((t) => only.includes(t.key))
    : TARGETS;

  console.log(`harvesting ${targets.length} garment photo(s) -> public/wardrobe/\n`);

  // Discovery is ~60-80s of mostly-waiting per target, so run a few at a time.
  const CONCURRENCY = 4;
  const results = [];
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((t) => harvest(t, force)),
    );
    settled.forEach((outcome, index) => {
      const key = batch[index].key;
      if (outcome.status === "fulfilled") {
        const r = outcome.value;
        results.push(r);
        if (r.status === "ok") {
          console.log(`  ok       ${key.padEnd(24)} ${r.retailer} · ${r.name.slice(0, 44)}`);
        } else {
          console.log(`  ${r.status.padEnd(8)} ${key}`);
        }
      } else {
        results.push({ key, status: "failed", error: String(outcome.reason) });
        console.log(`  failed   ${key.padEnd(24)} ${String(outcome.reason).slice(0, 70)}`);
      }
    });
  }

  const ok = results.filter((r) => r.status === "ok");
  console.log(`\n${ok.length}/${targets.length} harvested`);

  // A provenance record, so the demo can honestly say where each photo is from.
  if (ok.length > 0) {
    const manifest = join(OUT_DIR, "credits.json");
    const existing = existsSync(manifest)
      ? JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(manifest, "utf8")))
      : {};
    for (const r of ok) {
      existing[r.key] = { name: r.name, retailer: r.retailer, url: r.url };
    }
    writeFileSync(manifest, `${JSON.stringify(existing, null, 2)}\n`);
    console.log(`credits -> public/wardrobe/credits.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
