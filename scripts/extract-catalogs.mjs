#!/usr/bin/env node
/**
 * One-time / occasional Context.dev catalog harvest.
 *
 * Calls the real Context.dev Extract Products API against curated fashion
 * retailer category pages and writes the raw responses to
 * `data/context-dev-extractions/`.
 *
 * Those raw responses serve two purposes:
 *   1. source real garment photography + product data for the seeded wardrobe
 *   2. become the demo-safety cache for the Missing Piece Engine, so a flaky
 *      conference network can never break the live demo
 *
 * Usage:
 *   node scripts/extract-catalogs.mjs                 # only missing targets
 *   node scripts/extract-catalogs.mjs --force         # re-extract everything
 *   node scripts/extract-catalogs.mjs loafers shirts  # specific targets
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "data", "context-dev-extractions");
const API = "https://api.context.dev/v1/brand/ai/products";

/** Load CONTEXT_DEV_API_KEY from .env / .env.local without extra deps. */
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!match) continue;
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (value && !process.env[match[1]]) process.env[match[1]] = value;
    }
  }
}

/**
 * Curated targets. `slot` tells the seeding step which wardrobe/archetype role
 * the products belong to. `archetypeId` links a target to a Missing Piece gap.
 */
const TARGETS = [
  { slug: "loafers-brown", archetypeId: "brown-suede-loafers", url: "https://www.charleskeith.com/us/shoes/loafers", maxProducts: 10 },
  { slug: "sneakers-white", archetypeId: "white-leather-sneakers", url: "https://www.allbirds.com/collections/mens-sneakers", maxProducts: 10 },
  { slug: "shirts", archetypeId: "cream-linen-shirt", url: "https://www.uniqlo.com/us/en/men/tops/shirts-and-polo-shirts", maxProducts: 12 },
  { slug: "trousers", archetypeId: "beige-pleated-trousers", url: "https://www.uniqlo.com/us/en/men/bottoms/pants", maxProducts: 12 },
  { slug: "overshirts", archetypeId: "olive-overshirt", url: "https://www.cos.com/en-us/men/menswear/jackets", maxProducts: 10 },
  { slug: "tshirts", archetypeId: "white-tshirt-heavyweight", url: "https://www.uniqlo.com/us/en/men/tops/t-shirts", maxProducts: 12 },
  { slug: "jeans", url: "https://www.uniqlo.com/us/en/men/bottoms/jeans", maxProducts: 8 },
  { slug: "outerwear", archetypeId: "navy-unstructured-blazer", url: "https://www.uniqlo.com/us/en/men/outerwear/blazers-and-jackets", maxProducts: 12 },
  { slug: "knitwear", archetypeId: "black-knit-polo", url: "https://www.uniqlo.com/us/en/men/tops/sweaters-and-cardigans", maxProducts: 10 },
  { slug: "jewellery", archetypeId: "gold-signet-ring", url: "https://www.monicavinader.com/us/shop/rings", maxProducts: 10 },
  { slug: "watches", url: "https://www.danielwellington.com/us/watches/mens", maxProducts: 8 },
  { slug: "sunglasses", url: "https://www.persol.com/usa/sunglasses", maxProducts: 8 },
  { slug: "belts", archetypeId: "black-leather-belt", url: "https://www.cos.com/en-us/men/menswear/accessories", maxProducts: 10 },
  // second pass — alternate retailers for archetypes the first pass missed
  { slug: "shirts-linen", archetypeId: "cream-linen-shirt", url: "https://www.uniqlo.com/us/en/men/tops/casual-shirts", maxProducts: 12 },
  { slug: "trousers-chino", archetypeId: "beige-pleated-trousers", url: "https://www.uniqlo.com/us/en/men/bottoms/chinos-and-shorts", maxProducts: 12 },
  { slug: "derby-shoes", archetypeId: "black-leather-derby", url: "https://www.charleskeith.com/us/shoes/flats", maxProducts: 10 },
  { slug: "rings", archetypeId: "gold-signet-ring", url: "https://www.pandora.net/en-us/jewelry/rings", maxProducts: 10 },
  { slug: "belts-2", archetypeId: "black-leather-belt", url: "https://www.charleskeith.com/us/accessories/belts", maxProducts: 8 },
];

async function extract(target) {
  const body = {
    directUrl: target.url,
    maxProducts: target.maxProducts ?? 10,
    timeoutMS: 240000,
  };
  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CONTEXT_DEV_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${json.error_code ?? ""} ${json.message ?? ""}`.trim());
  }
  return json;
}

async function main() {
  loadEnv();
  if (!process.env.CONTEXT_DEV_API_KEY) {
    console.error("CONTEXT_DEV_API_KEY is not set. Add it to .env.local and retry.");
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));

  let credits = null;
  for (const target of TARGETS) {
    if (only.length > 0 && !only.includes(target.slug)) continue;
    const out = join(OUT_DIR, `${target.slug}.json`);
    if (!force && existsSync(out)) {
      console.log(`· ${target.slug.padEnd(18)} cached, skipping`);
      continue;
    }
    process.stdout.write(`→ ${target.slug.padEnd(18)} extracting… `);
    try {
      const json = await extract(target);
      const products = json.products ?? [];
      credits = json.key_metadata?.credits_remaining ?? credits;
      writeFileSync(
        out,
        JSON.stringify(
          {
            slug: target.slug,
            archetypeId: target.archetypeId ?? null,
            sourceUrl: target.url,
            extractedAt: new Date().toISOString(),
            provider: "context.dev",
            endpoint: "POST /brand/ai/products",
            products,
          },
          null,
          2,
        ),
      );
      console.log(`${products.length} products`);
    } catch (error) {
      console.log(`FAILED — ${error.message}`);
    }
  }
  if (credits !== null) console.log(`\nContext.dev credits remaining: ${credits}`);
}

main();
