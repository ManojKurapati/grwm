/**
 * Engine smoke test — runs the whole Wardrobe Intelligence Engine outside
 * Convex so scoring changes can be verified in a second.
 *
 *   node --experimental-strip-types scripts/engine-smoke.ts
 */

import { SEED_PROFILE, SEED_WARDROBE } from "../convex/data/seedWardrobe";
import { parseIntent } from "../convex/engine/intent";
import { generateOutfits } from "../convex/engine/outfits";
import { buildExplanation, buildReasons } from "../convex/engine/explain";
import { evaluateCandidate, lifeContexts, verdictCopy, verdictFor } from "../convex/engine/compatibility";
import { findGaps, archetypeAsItem } from "../convex/engine/gaps";
import { classifyProduct, describeSpec } from "../convex/engine/classify";
import type { EngineContext, EngineItem, EngineProfile } from "../convex/engine/score";

const NOW = Date.now();
const DAY = 86_400_000;

const wardrobe: EngineItem[] = SEED_WARDROBE.map((item) => ({
  id: item.key,
  name: item.name,
  spec: item.spec,
  wearCount: item.wearCount,
  lastWornAt: item.wearCountDaysAgo ? NOW - item.wearCountDaysAgo * DAY : undefined,
  availability: "available",
}));

const profile: EngineProfile = {
  ...SEED_PROFILE,
  styleAffinity: {},
  colorAffinity: {},
  categoryAffinity: {},
};

function contextFor(prompt: string, temperatureC: number, energy?: string): EngineContext {
  const intent = parseIntent(prompt, {
    fallbackCity: "Dubai",
    baseFormality: profile.baseFormality,
    energy,
  });
  return {
    intent,
    weather: {
      temperatureC,
      band: temperatureC >= 30 ? "hot" : temperatureC >= 23 ? "warm" : "mild",
      condition: "clear",
      humidity: 62,
      city: intent.city,
    },
    energy,
    now: NOW,
    seenSignatures: new Set<string>(),
  };
}

const PROMPTS: Array<[string, number]> = [
  ["Rooftop date in Dubai tonight. Smart casual. I want to look effortless, not overdressed.", 31],
  ["Client dinner", 24],
  ["Sunday brunch", 28],
  ["Airport fit, long haul", 19],
  ["Night out", 26],
];

console.log("=".repeat(78));
console.log("OUTFIT RECOMMENDATION");
console.log("=".repeat(78));

for (const [prompt, temp] of PROMPTS) {
  const ctx = contextFor(prompt, temp);
  const t0 = performance.now();
  const { outfits, consideredCount } = generateOutfits(wardrobe, ctx, profile, { limit: 3 });
  const ms = performance.now() - t0;
  const best = outfits[0];

  console.log(`\n▌ "${prompt}"  (${temp}°C)`);
  console.log(
    `  intent: ${ctx.intent.occasion} · ${ctx.intent.dressCode} · target formality ${ctx.intent.targetFormality} · ${ctx.intent.timeOfDay}`,
  );
  if (!best) {
    console.log("  !! NO OUTFIT GENERATED");
    continue;
  }
  console.log(`  ${best.overallScore}% match   (${consideredCount} combos in ${ms.toFixed(0)}ms)`);
  for (const { slot, item } of best.slots) {
    console.log(`    ${slot.padEnd(10)} ${item.name}`);
  }
  console.log(`  "${buildExplanation(best, ctx)}"`);
  for (const r of buildReasons(best, ctx, profile)) {
    console.log(`    ${String(r.score).padStart(3)}%  ${r.label.padEnd(14)} ${r.text}`);
  }
  console.log(`  alternates: ${outfits.slice(1).map((o) => o.overallScore + "%").join(", ")}`);
}

console.log("\n" + "=".repeat(78));
console.log("MISSING PIECE ENGINE");
console.log("=".repeat(78));

const todayCtx = contextFor(PROMPTS[0][0], PROMPTS[0][1]);
const life = lifeContexts(profile, "Dubai", NOW);
const t1 = performance.now();
const { gaps, baselineScore } = findGaps(wardrobe, profile, todayCtx, life, { limit: 3 });
console.log(`baseline tonight: ${baselineScore}%   (gap search ${(performance.now() - t1).toFixed(0)}ms)`);
for (const gap of gaps) {
  const c = gap.compatibility;
  console.log(
    `\n  ${gap.archetype.label}\n    today ${baselineScore}% → ${gap.improvedScore}% (+${gap.todayGain})` +
      `\n    wardrobe compatibility ${c.wardrobeCompatibility}%  ·  unlocks ${c.newOutfitsUnlocked} outfits` +
      `\n    pairs with ${c.pairsWithCount}/${c.pairsWithTotal}  ·  improves: ${c.occasionCoverageGain.join(", ") || "—"}` +
      `\n    components ${JSON.stringify(c.components)}`,
  );
}

console.log("\n" + "=".repeat(78));
console.log("SHOULD I BUY THIS?");
console.log("=".repeat(78));

const TEST_PRODUCTS = [
  {
    name: "Griselda Faux Suede Loafers",
    description:
      "These Griselda loafers in dark brown are made with faux suede and feature almond toes, classic penny tabs, shiny lock charms, and very low block heels. They complement work staples with stylish tactility and functional details.",
    category: "Shoes",
    features: ["Made with faux suede material", "Almond toe design", "Classic penny tabs"],
    tags: ["loafers", "faux suede", "dark brown", "shoes"],
  },
  {
    name: "Men's Tree Runner NZ",
    description:
      "A lightweight everyday sneaker made from breathable eucalyptus tree fibre with a merino wool lining. Machine washable, casual, comfortable for all-day wear.",
    category: "Footwear",
    features: ["Breathable tree fibre upper", "Machine washable", "Lightweight"],
    tags: ["sneaker", "casual", "white", "men's shoes"],
  },
  {
    name: "Unstructured Linen Blazer — Navy",
    description:
      "An unlined tailored blazer in a lightweight navy linen blend. Soft shoulders, patch pockets, refined and breathable for warm-weather smart dressing.",
    category: "Clothing",
    features: ["Unlined construction", "Linen blend", "Patch pockets"],
    tags: ["blazer", "navy", "linen", "tailoring"],
  },
];

for (const product of TEST_PRODUCTS) {
  const spec = classifyProduct(product);
  const candidate: EngineItem = {
    id: `product:${product.name}`,
    name: product.name,
    spec,
    wearCount: 0,
    availability: "available",
  };
  const result = evaluateCandidate(wardrobe, candidate, profile, life);
  const verdict = verdictFor(result);
  const copy = verdictCopy(product.name, result);
  console.log(`\n▌ ${product.name}`);
  console.log(`  classified: ${describeSpec(spec)}`);
  console.log(`  ${verdict.toUpperCase()}  ·  ${result.wardrobeCompatibility}% compatibility  ·  ${result.newOutfitsUnlocked} outfits unlocked`);
  console.log(`  redundant with: ${result.redundantWith.join(", ") || "nothing"}`);
  console.log(`  ${copy.headline}`);
  for (const r of copy.reasons) console.log(`    - ${r}`);
}
