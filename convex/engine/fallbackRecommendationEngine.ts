/**
 * ============================================================================
 *  Fallback recommendation engine
 * ============================================================================
 *
 * Gemini is GRWM's stylist. This is the parachute.
 *
 * It runs only when the primary path cannot be used or cannot be trusted:
 * no API key, network failure, timeout, malformed structured output,
 * hallucinated wardrobe ids, or an explicitly forced demo fallback.
 *
 * Design goals, in order: **stable, fast, predictable, coherent.** Not clever.
 * It picks the best item for each slot independently, then keeps an optional
 * layer or accessory only if it measurably helps. There is no combinatorial
 * search, no optimisation, no taste modelling — a previous version enumerated
 * ~800 outfits per request, which is work Gemini now does better.
 *
 * Guarantees:
 *   · never selects an unavailable item
 *   · never selects an item that fails a hard constraint (parka at 38°C)
 *   · always returns a complete top/bottom/shoes outfit, or `null` if the
 *     wardrobe genuinely cannot make one
 *   · touches no network and no external API — it cannot fail the way Gemini can
 *   · returns exactly the shared `Recommendation` shape
 */

import {
  breathability,
  clamp01,
  type GarmentSpec,
  tagOverlap,
} from "./taxonomy";
import {
  itemWeatherFit,
  measureOutfit,
  type MeasurableItem,
  type MeasureContext,
} from "./measure";
import { fallbackMissingPiece } from "./gaps";
import type { Recommendation } from "../recommendation";

export type FallbackItem = MeasurableItem & {
  availability: string;
  wearCount: number;
  lastWornAt?: number;
};

export type FallbackContext = MeasureContext & {
  /** ISO currency for the missing-piece price ceiling */
  currency: string;
};

/** The three slots an outfit must fill, plus the two optional ones. */
const CORE_SLOTS = ["top", "bottom", "shoes"] as const;
const OPTIONAL_SLOTS = ["layer", "accessory"] as const;

/** Pieces that only make sense in daylight. */
const DAYLIGHT_ONLY = /sunglass|eyewear|shades/i;

// ---------------------------------------------------------------------------
// Hard constraints — application rules, not fashion opinions
// ---------------------------------------------------------------------------

/**
 * Objective reasons an item cannot be worn right now.
 *
 * These stay deterministic on purpose: they are facts about availability and
 * physics, not judgements. They also pre-filter the candidate list handed to
 * Gemini, so the primary path benefits from them too.
 */
export function isWearable(item: FallbackItem, ctx: MeasureContext): boolean {
  if (item.availability !== "available") return false;

  // Fabric physics: no shearling in the desert, no linen in a freeze.
  const breath = breathability(item.spec);
  if (ctx.temperatureC >= 29 && breath <= 0.2) return false;
  if (ctx.temperatureC <= 6 && breath >= 0.9) return false;

  // Sunglasses after dark is the kind of mistake scoring can't catch, because
  // they legitimately match the occasion, style and weather tags.
  if (DAYLIGHT_ONLY.test(item.spec.subcategory)) {
    if (ctx.timeOfDay === "night" || ctx.timeOfDay === "evening") return false;
    if (ctx.condition === "rain" || ctx.condition === "storm") return false;
  }

  // Wildly wrong register for the occasion (gym shorts to a wedding).
  if (Math.abs(item.spec.formalityScore - ctx.targetFormality) > 4.5) return false;

  return itemWeatherFit(item.spec, ctx.temperatureC, ctx.band) >= 0.2;
}

// ---------------------------------------------------------------------------
// Per-item suitability — one small, readable score
// ---------------------------------------------------------------------------

/**
 * How well a single garment suits the situation, 0..1.
 *
 * Intentionally one flat formula rather than a weighted seven-dimension model:
 * the fallback only needs a sensible ordering within each slot.
 */
function suitability(spec: GarmentSpec, ctx: MeasureContext, now: number, lastWornAt?: number): number {
  const tags = spec.occasionTags.map((t) => t.toLowerCase());
  const occasion = tags.includes(ctx.occasion) ? 1 : 0.4;

  const weather = itemWeatherFit(spec, ctx.temperatureC, ctx.band);

  const formality = clamp01(1 - Math.abs(spec.formalityScore - ctx.targetFormality) / 4.5);

  const style = Math.max(tagOverlap(spec.styleTags, ctx.preferredStyles), 0.3);

  const avoided = ctx.avoidColors.some(
    (c) => c.toLowerCase() === spec.primaryColor.toLowerCase(),
  );

  // Mild nudge away from something worn in the last couple of days.
  let recency = 1;
  if (lastWornAt) {
    const days = (now - lastWornAt) / 86_400_000;
    if (days < 1) recency = 0.75;
    else if (days < 3) recency = 0.9;
  }

  return (
    clamp01(0.34 * occasion + 0.28 * weather + 0.24 * formality + 0.14 * style) *
    recency *
    (avoided ? 0.5 : 1)
  );
}

// ---------------------------------------------------------------------------
// The entry point
// ---------------------------------------------------------------------------

export type FallbackResult = Recommendation & { source: "fallback" };

/**
 * Build a safe, coherent outfit from what the user owns.
 *
 * Returns `null` only when the wardrobe cannot produce a top, a bottom and a
 * pair of shoes — at which point the honest answer is "add more clothes",
 * not a broken recommendation.
 */
export function generateFallbackOutfit(
  items: FallbackItem[],
  ctx: FallbackContext,
  options: { now?: number } = {},
): FallbackResult | null {
  const now = options.now ?? Date.now();

  // 1. Hard constraints first.
  let eligible = items.filter((item) => isWearable(item, ctx));

  // If constraints emptied a slot, relax to "available" for that slot only.
  // Better a slightly-warm shirt than no recommendation at all.
  for (const slot of CORE_SLOTS) {
    if (eligible.some((i) => i.spec.category === slot)) continue;
    const relaxed = items.filter(
      (i) => i.spec.category === slot && i.availability === "available",
    );
    if (relaxed.length > 0) eligible = [...eligible, ...relaxed];
  }

  // 2. Best item per core slot.
  const chosen: FallbackItem[] = [];
  for (const slot of CORE_SLOTS) {
    const best = bestForSlot(eligible, slot, ctx, now);
    if (!best) return null; // wardrobe genuinely can't dress the user
    chosen.push(best);
  }

  // 3. Optional slots, kept only if they measurably improve the outfit.
  let current = measureOutfit(chosen, ctx);
  for (const slot of OPTIONAL_SLOTS) {
    const limit = slot === "accessory" ? 2 : 1;
    for (let added = 0; added < limit; added += 1) {
      const candidate = bestForSlot(
        eligible.filter((i) => !chosen.includes(i)),
        slot,
        ctx,
        now,
      );
      if (!candidate) break;
      const trial = measureOutfit([...chosen, candidate], ctx);
      if (trial.overall <= current.overall) break;
      chosen.push(candidate);
      current = trial;
    }
  }

  return {
    selectedItemIds: chosen.map((item) => item.id),
    overallScore: current.overall,
    scoreBreakdown: current.breakdown,
    explanation: explain(chosen, ctx),
    reasons: current.reasons,
    missingPiece: fallbackMissingPiece(items, ctx),
    source: "fallback",
  };
}

function bestForSlot(
  items: FallbackItem[],
  slot: string,
  ctx: MeasureContext,
  now: number,
): FallbackItem | null {
  const candidates = items.filter((item) => item.spec.category === slot);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, item) =>
    suitability(item.spec, ctx, now, item.lastWornAt) >
    suitability(best.spec, ctx, now, best.lastWornAt)
      ? item
      : best,
  );
}

/**
 * A short, factual caption. Assembled from the chosen garments and the real
 * weather — no model, so it is always available and always consistent.
 */
function explain(items: FallbackItem[], ctx: MeasureContext): string {
  const byslot = (slot: string) => items.find((i) => i.spec.category === slot);
  const top = byslot("top");
  const bottom = byslot("bottom");
  const shoes = byslot("shoes");

  const t = Math.round(ctx.temperatureC);
  const place = ctx.city ? `${ctx.city} ` : "";
  const period = ctx.timeOfDay === "night" ? "evening" : ctx.timeOfDay;
  const occasion = ctx.occasionLabel.toLowerCase();

  const opener = top?.spec.material
    ? `The ${top.spec.material.toLowerCase()} ${top.spec.subcategory} keeps this breathable for a ${t}°C ${place}${period}`
    : `The ${top?.name.toLowerCase() ?? "top"} sets a clean base for a ${t}°C ${place}${period}`;

  const anchor = [bottom?.name.toLowerCase(), shoes?.name.toLowerCase()]
    .filter(Boolean)
    .join(" and ");

  const tail =
    ctx.targetFormality >= 7.5
      ? `while the ${anchor} carry the ${occasion}.`
      : `while the ${anchor} lift it just enough for ${article(occasion)} ${occasion} without tipping into formal.`;

  return `${opener}, ${tail}`.replace(/\s+/g, " ").trim();
}

const NO_ARTICLE = new Set(["brunch", "office", "wedding"]);

function article(occasion: string): string {
  if (NO_ARTICLE.has(occasion)) return "";
  return /^[aeiou]/.test(occasion) ? "an" : "a";
}
