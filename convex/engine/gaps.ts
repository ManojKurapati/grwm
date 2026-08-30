/**
 * Fallback missing-piece suggestion.
 *
 * Gemini identifies wardrobe gaps in the primary path — it reads the whole
 * wardrobe and says what is missing and why, which is a taste call. This module
 * is only the parachute for that decision.
 *
 * It used to be a simulation engine: it inserted each of a dozen archetypes into
 * the wardrobe, re-ran the full recommendation across eight synthetic "life
 * contexts", and counted outfits unlocked with a substitution test. That was
 * thousands of scoring passes to answer a question Gemini answers in one call,
 * so it is gone.
 *
 * What is left is a small, honest heuristic: find the first archetype whose role
 * nothing in the wardrobe fills, preferring ones that suit today's occasion.
 */

import { ARCHETYPES, type Archetype } from "./archetypes";
import { isRedundantWith } from "./compatibility";
import type { MeasureContext } from "./measure";
import type { GarmentSpec } from "./taxonomy";
import type { MissingPiece } from "../recommendation";

export type GapCandidate = { spec: GarmentSpec; availability?: string };

/** Sensible price ceilings by role, used when we have to name a budget. */
const CEILING: Record<string, number> = {
  shoes: 400,
  layer: 500,
  top: 200,
  bottom: 250,
  accessory: 200,
};

/**
 * The single most useful thing the wardrobe is missing, or `null` if nothing
 * obvious is absent.
 *
 * Deliberately simple — one pass over a static library, no scoring loops.
 */
export function fallbackMissingPiece(
  wardrobe: GapCandidate[],
  ctx: MeasureContext & { currency: string },
): MissingPiece | null {
  const missing = ARCHETYPES.filter(
    (archetype) => !wardrobe.some((item) => isRedundantWith(archetype.spec, item.spec)),
  );
  if (missing.length === 0) return null;

  // Prefer a gap that would actually matter for what the user asked about today.
  const relevant = missing.filter((archetype) =>
    archetype.spec.occasionTags.includes(ctx.occasion),
  );
  const chosen = (relevant.length > 0 ? relevant : missing)[0];

  return toMissingPiece(chosen, ctx.currency);
}

/** Look up a specific archetype as a missing piece, e.g. for a SKIP alternative. */
export function archetypeAsMissingPiece(
  archetype: Archetype,
  currency: string,
): MissingPiece {
  return toMissingPiece(archetype, currency);
}

function toMissingPiece(archetype: Archetype, currency: string): MissingPiece {
  return {
    productType: archetype.label.toLowerCase(),
    reason: archetype.rationale.slice(0, 240),
    attributes: attributesFor(archetype.spec),
    maxPrice: CEILING[archetype.spec.category] ?? 250,
    currency: currency.length === 3 ? currency.toUpperCase() : "USD",
  };
}

function attributesFor(spec: GarmentSpec): string[] {
  return [spec.primaryColor, spec.material, spec.subcategory, ...spec.styleTags.slice(0, 2)]
    .filter((value): value is string => Boolean(value))
    .slice(0, 6);
}

/**
 * The best unfilled archetype in a given category — used by "Should I Buy This?"
 * to answer "then what should I buy instead?".
 */
export function suggestInsteadOf(
  wardrobe: GapCandidate[],
  category?: string,
): Archetype | null {
  const missing = ARCHETYPES.filter(
    (archetype) => !wardrobe.some((item) => isRedundantWith(archetype.spec, item.spec)),
  );
  if (missing.length === 0) return null;
  // If they're shopping for shoes, the useful answer is other shoes.
  return missing.find((a) => a.spec.category === category) ?? missing[0];
}
