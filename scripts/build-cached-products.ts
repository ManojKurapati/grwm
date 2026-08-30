/**
 * Turn the raw Context.dev extractions in `data/context-dev-extractions/` into
 * `convex/data/cachedProducts.ts`.
 *
 * This is the demo-safety layer. Every record here came out of a real
 * Context.dev API call — nothing is invented — but baking them into the repo
 * means the Missing Piece Engine still has grounded product data to show if the
 * venue wifi dies mid-presentation. Records are tagged
 * `provenance: "cached-context.dev"` so the UI can be honest about it.
 *
 *   npx tsx scripts/build-cached-products.ts
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyProduct, retailerFromUrl } from "../convex/engine/classify";
import { ARCHETYPES } from "../convex/engine/archetypes";
import type { GarmentSpec } from "../convex/engine/taxonomy";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IN_DIR = join(ROOT, "data", "context-dev-extractions");
const OUT = join(ROOT, "convex", "data", "cachedProducts.ts");

type RawProduct = {
  name: string;
  description: string;
  price: number | null;
  currency: string | null;
  url: string | null;
  category: string | null;
  features?: string[];
  tags?: string[];
  target_audience?: string[];
  image_url: string | null;
  images?: string[];
  sku: string | null;
};

type Cached = {
  url: string;
  name: string;
  description: string;
  retailer: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  images: string[];
  sku: string | null;
  productCategory: string | null;
  features: string[];
  tags: string[];
  spec: GarmentSpec;
  provenance: string;
  archetypeId?: string;
};

/** Reject pages that clearly aren't garments (FAQ pages, socks, tote bags). */
const REJECT = /faq|frequently asked|gift card|sock|shoe care|insole|lace|cleaning|shipping/i;

/**
 * Score how well an extracted product embodies an archetype, so each wardrobe
 * gap is backed by the most on-brief real product we actually extracted.
 */
function archetypeFit(spec: GarmentSpec, archetypeId: string): number {
  const archetype = ARCHETYPES.find((a) => a.id === archetypeId);
  if (!archetype) return 0;
  const target = archetype.spec;

  // The role must match exactly — a jacket cannot stand in for loafers.
  if (spec.category !== target.category) return 0;
  if (spec.subcategory !== target.subcategory) return 0;

  let score = 0.45;
  if (spec.primaryColor === target.primaryColor) score += 0.3;
  else if (spec.primaryColor === "neutral") score += 0.02;
  else score += 0.08;
  if (spec.material && target.material && spec.material.includes(target.material)) score += 0.12;
  score += 0.13 * (1 - Math.min(1, Math.abs(spec.formalityScore - target.formalityScore) / 4));
  return score;
}

function main() {
  const files = readdirSync(IN_DIR).filter((f) => f.endsWith(".json"));
  const byUrl = new Map<string, Cached>();

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(IN_DIR, file), "utf8")) as {
      slug: string;
      archetypeId: string | null;
      products: RawProduct[];
    };

    for (const product of raw.products) {
      if (!product.url || !product.name) continue;
      if (REJECT.test(product.name)) continue;
      if (!product.image_url) continue;

      const { confidence, ...spec } = classifyProduct({
        name: product.name,
        description: product.description ?? "",
        category: product.category,
        features: product.features,
        tags: product.tags,
      });

      // Curated data must be trustworthy: if we couldn't identify the garment
      // from its name or copy, leave it out rather than guess.
      if (confidence === "low") continue;

      const cached: Cached = {
        url: product.url,
        name: product.name,
        description: (product.description ?? "").slice(0, 700),
        retailer: retailerFromUrl(product.url),
        price: product.price ?? null,
        currency: product.currency ?? null,
        imageUrl: product.image_url,
        images: (product.images ?? []).slice(0, 4),
        sku: product.sku ?? null,
        productCategory: product.category ?? null,
        features: (product.features ?? []).slice(0, 6),
        tags: (product.tags ?? []).slice(0, 8),
        spec,
        provenance: "cached-context.dev",
      };
      byUrl.set(product.url, cached);
    }
  }

  // Attach the best real product to each archetype gap.
  const assignments = new Map<string, { url: string; fit: number }>();
  for (const archetype of ARCHETYPES) {
    for (const [url, product] of byUrl) {
      const fit = archetypeFit(product.spec, archetype.id);
      if (fit < 0.45) continue;
      const current = assignments.get(archetype.id);
      if (!current || fit > current.fit) assignments.set(archetype.id, { url, fit });
    }
  }
  for (const [archetypeId, { url }] of assignments) {
    const product = byUrl.get(url);
    if (product) product.archetypeId = archetypeId;
  }

  const products = [...byUrl.values()].sort((a, b) => a.name.localeCompare(b.name));

  const header = `/**
 * AUTO-GENERATED — do not edit by hand.
 *   regenerate with: npx tsx scripts/build-cached-products.ts
 *
 * Demo-safety cache of REAL Context.dev extractions.
 *
 * Every record below was returned by a live call to
 *   POST https://api.context.dev/v1/brand/ai/products
 * against a curated fashion retailer. Nothing here is fabricated. They are
 * committed to the repo so the Missing Piece Engine and "Should I Buy This?"
 * still have grounded product data when the network is unreliable during a
 * live demo. \`provenance: "cached-context.dev"\` marks them as cached, so the
 * UI can label them honestly; live extractions are tagged \`"context.dev"\`.
 *
 * ${products.length} products · generated ${new Date().toISOString().slice(0, 10)}
 */

import type { GarmentSpec } from "../engine/taxonomy";

export type CachedProduct = {
  url: string;
  name: string;
  description: string;
  retailer: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  images: string[];
  sku: string | null;
  productCategory: string | null;
  features: string[];
  tags: string[];
  spec: GarmentSpec;
  provenance: string;
  archetypeId?: string;
};

export const CACHED_PRODUCTS: CachedProduct[] = ${JSON.stringify(products, null, 2)};

/** Look up the cached product chosen to represent a wardrobe gap. */
export function cachedProductForArchetype(archetypeId: string): CachedProduct | undefined {
  return CACHED_PRODUCTS.find((p) => p.archetypeId === archetypeId);
}
`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, header);

  console.log(`wrote ${products.length} cached products -> convex/data/cachedProducts.ts`);
  console.log("\narchetype coverage:");
  for (const archetype of ARCHETYPES) {
    const match = products.find((p) => p.archetypeId === archetype.id);
    console.log(
      `  ${archetype.id.padEnd(28)} ${match ? `${match.name} (${match.retailer})` : "— none"}`,
    );
  }
}

main();
