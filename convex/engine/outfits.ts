/**
 * Candidate generation + ranking.
 *
 * Pipeline (deliberately NOT "throw the closet at an LLM"):
 *   1. hard-filter items that are unavailable or plainly wrong for the context
 *   2. rank items within each slot by a cheap pre-score, keep the top few
 *   3. enumerate top x bottom x shoes combinations
 *   4. greedily attach the best layer / accessories for each base
 *   5. fully score every candidate and sort
 *
 * The search space stays in the low thousands, so this runs in milliseconds
 * inside a Convex action and is completely reproducible.
 */

import {
  clamp01,
  REQUIRED_SLOTS,
  type Slot,
  breathability,
} from "./taxonomy";
import {
  type EngineContext,
  type EngineItem,
  type EngineProfile,
  type Outfit,
  type ScoredOutfit,
  prescore,
  scoreItemWeather,
  scoreOutfit,
} from "./score";

/** How many candidates to keep per slot before combining. */
const SLOT_BEAM: Record<Slot, number> = {
  top: 5,
  bottom: 4,
  shoes: 4,
  layer: 3,
  accessory: 4,
};

const MAX_ACCESSORIES = 2;

export function signatureOf(itemIds: string[]): string {
  return [...itemIds].sort().join("|");
}

function makeOutfit(slots: Array<{ slot: Slot; item: EngineItem }>): Outfit {
  return { slots, signature: signatureOf(slots.map((s) => s.item.id)) };
}

/** Hard constraints. An item that fails these is never considered. */
export function isEligible(item: EngineItem, ctx: EngineContext): boolean {
  if (item.availability !== "available") return false;

  // Genuinely wrong fabric for the temperature (parka in Dubai).
  const breath = breathability(item.spec);
  if (ctx.weather.temperatureC >= 29 && breath <= 0.2) return false;
  if (ctx.weather.temperatureC <= 6 && breath >= 0.9) return false;

  // Formality miles away from the brief (gym shorts to a wedding).
  const gap = Math.abs(item.spec.formalityScore - ctx.intent.targetFormality);
  if (gap > 4.5) return false;

  if (scoreItemWeather(item.spec, ctx.weather) < 0.2) return false;

  return true;
}

export type CandidatePool = Record<Slot, EngineItem[]>;

export function buildPool(
  items: EngineItem[],
  ctx: EngineContext,
  profile: EngineProfile,
): { pool: CandidatePool; filteredOut: number } {
  const pool: CandidatePool = { top: [], bottom: [], shoes: [], layer: [], accessory: [] };
  let filteredOut = 0;

  for (const item of items) {
    const slot = item.spec.category as Slot;
    if (!pool[slot]) continue;
    if (!isEligible(item, ctx)) {
      filteredOut += 1;
      continue;
    }
    pool[slot].push(item);
  }

  for (const slot of Object.keys(pool) as Slot[]) {
    pool[slot] = pool[slot]
      .map((item) => ({ item, s: prescore([item], ctx, profile) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, SLOT_BEAM[slot])
      .map((x) => x.item);
  }

  return { pool, filteredOut };
}

/** Relax the hard filter when the wardrobe is too thin to fill every slot. */
function buildRelaxedPool(items: EngineItem[]): CandidatePool {
  const pool: CandidatePool = { top: [], bottom: [], shoes: [], layer: [], accessory: [] };
  for (const item of items) {
    const slot = item.spec.category as Slot;
    if (pool[slot] && item.availability === "available") pool[slot].push(item);
  }
  return pool;
}

export function hasViableBase(pool: CandidatePool): boolean {
  return REQUIRED_SLOTS.every((slot) => pool[slot].length > 0);
}

export function generateOutfits(
  items: EngineItem[],
  ctx: EngineContext,
  profile: EngineProfile,
  options: { limit?: number; diversify?: boolean } = {},
): { outfits: ScoredOutfit[]; consideredCount: number; poolSize: number } {
  let { pool } = buildPool(items, ctx, profile);

  // Demo safety: never return "no outfit". If filtering was too aggressive for
  // this wardrobe, fall back to the unfiltered pool and let scoring decide.
  if (!hasViableBase(pool)) {
    const relaxed = buildRelaxedPool(items);
    for (const slot of REQUIRED_SLOTS) {
      if (pool[slot].length === 0) {
        pool[slot] = relaxed[slot]
          .map((item) => ({ item, s: prescore([item], ctx, profile) }))
          .sort((a, b) => b.s - a.s)
          .slice(0, SLOT_BEAM[slot])
          .map((x) => x.item);
      }
    }
  }

  const results: ScoredOutfit[] = [];
  let considered = 0;

  for (const top of pool.top) {
    for (const bottom of pool.bottom) {
      for (const shoes of pool.shoes) {
        const base: Array<{ slot: Slot; item: EngineItem }> = [
          { slot: "top", item: top },
          { slot: "bottom", item: bottom },
          { slot: "shoes", item: shoes },
        ];

        // Variant A: no layer. Variant B..: each plausible layer.
        const layerOptions: Array<EngineItem | null> = [null, ...pool.layer];

        for (const layer of layerOptions) {
          const withLayer = layer ? [...base, { slot: "layer" as Slot, item: layer }] : base;

          // Greedily attach accessories that improve the score.
          let current = makeOutfit(withLayer);
          let best = scoreOutfit(current, ctx, profile);
          considered += 1;

          const usedAccessories: EngineItem[] = [];
          for (let i = 0; i < MAX_ACCESSORIES; i += 1) {
            let improved: ScoredOutfit | null = null;
            let improvedWith: EngineItem | null = null;

            for (const accessory of pool.accessory) {
              if (usedAccessories.includes(accessory)) continue;
              const trial = makeOutfit([
                ...current.slots,
                { slot: "accessory", item: accessory },
              ]);
              const scored = scoreOutfit(trial, ctx, profile);
              considered += 1;
              if (scored.overallScore > (improved?.overallScore ?? best.overallScore)) {
                improved = scored;
                improvedWith = accessory;
              }
            }

            if (!improved || !improvedWith) break;
            usedAccessories.push(improvedWith);
            current = { slots: improved.slots, signature: improved.signature };
            best = improved;
          }

          results.push(best);
        }
      }
    }
  }

  results.sort((a, b) => b.overallScore - a.overallScore);

  // Diversify when presenting to a human ("Try another" must feel different).
  // Skip it when *counting* coverage, where every distinct combination counts.
  const limit = options.limit ?? 6;
  const shortlist =
    options.diversify === false ? results.slice(0, limit) : diversify(results, limit);

  return {
    outfits: shortlist,
    consideredCount: considered,
    poolSize: (Object.keys(pool) as Slot[]).reduce((n, s) => n + pool[s].length, 0),
  };
}

/** Keep the best outfit, then prefer alternatives that swap at least 2 pieces. */
function diversify(sorted: ScoredOutfit[], limit: number): ScoredOutfit[] {
  const picked: ScoredOutfit[] = [];
  for (const candidate of sorted) {
    if (picked.length >= limit) break;
    const ids = new Set(candidate.slots.map((s) => s.item.id));
    const tooSimilar = picked.some((p) => {
      const overlap = p.slots.filter((s) => ids.has(s.item.id)).length;
      return overlap >= Math.max(p.slots.length, ids.size) - 1;
    });
    if (!tooSimilar) picked.push(candidate);
  }
  // If the wardrobe is small, similarity filtering may starve the list.
  for (const candidate of sorted) {
    if (picked.length >= limit) break;
    if (!picked.includes(candidate)) picked.push(candidate);
  }
  return picked;
}

/**
 * Score the wardrobe's ceiling for an arbitrary occasion/weather context.
 * Used by the Missing Piece Engine and the shopping evaluator to measure how
 * much a candidate garment would actually move the needle.
 */
export function bestScoreFor(
  items: EngineItem[],
  ctx: EngineContext,
  profile: EngineProfile,
): number {
  const { outfits } = generateOutfits(items, ctx, profile, { limit: 1 });
  return outfits[0]?.overallScore ?? 0;
}

/** How many distinct outfits clear a quality bar. */
export function countStrongOutfits(
  items: EngineItem[],
  ctx: EngineContext,
  profile: EngineProfile,
  threshold: number,
): number {
  const { outfits } = generateOutfits(items, ctx, profile, { limit: 400 });
  return outfits.filter((o) => o.overallScore >= threshold).length;
}

export function normalizeBreakdown(breakdown: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(breakdown)) {
    out[key] = Math.round(clamp01(value) * 100);
  }
  return out;
}
