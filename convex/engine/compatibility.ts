/**
 * Wardrobe Compatibility.
 *
 * Answers one question: **does this garment make the clothes you already own
 * more useful?**
 *
 * The model has four positive terms (how many of your pieces it pairs with,
 * whether it matches your style, which occasions it covers, whether it suits
 * your climate) and one hard multiplier: redundancy. Owning two things that do
 * the same job means a third adds almost nothing, so redundancy divides the
 * score rather than nudging it. That is what separates "BUY IT" from "SKIP IT".
 */

import type { Intent } from "./intent";
import {
  clamp01,
  colorFamily,
  isHeroPair,
  isNeutral,
  isWardrobeNeutral,
  mean,
  type GarmentSpec,
  type Slot,
  tagOverlap,
  unique,
} from "./taxonomy";
import {
  type EngineContext,
  type EngineItem,
  type EngineProfile,
  scoreItemWeather,
} from "./score";
import { bestScoreFor, generateOutfits } from "./outfits";
import { parseIntent } from "./intent";
import { scoreOutfit } from "./score";

/** Quality bar below which an outfit is not worth counting at all. */
const GOOD_OUTFIT = 72;

/** How much better the candidate must be than your best owned substitute for
 *  the outfit to count as genuinely *unlocked* rather than merely possible. */
const SUBSTITUTION_MARGIN = 1.5;

/** Cap the substitution search so gap-finding stays fast. */
const MAX_OUTFITS_PER_CONTEXT = 60;

/** Complementary slots — what a garment needs to be worn *with*. */
const COMPLEMENTS: Record<Slot, Slot[]> = {
  top: ["bottom", "shoes", "layer"],
  bottom: ["top", "shoes", "layer"],
  shoes: ["top", "bottom"],
  layer: ["top", "bottom", "shoes"],
  accessory: ["top", "bottom", "shoes"],
};

/** Subcategories that fill the same role in a wardrobe. */
const ROLE_FAMILIES: string[][] = [
  ["sneakers", "trainers", "runners", "tennis shoes"],
  ["loafers", "moccasins", "drivers", "mules"],
  ["derby", "oxford", "brogue", "dress shoes"],
  ["boots", "chelsea boots", "chukka"],
  ["sandals", "slides", "flip flops"],
  ["t-shirt", "tee", "tank"],
  ["shirt", "overshirt shirt", "button-down", "oxford shirt"],
  ["polo", "knit polo"],
  ["jeans", "denim"],
  ["trousers", "chinos", "pants", "slacks"],
  ["shorts"],
  ["blazer", "sport coat", "jacket"],
  ["overshirt", "chore jacket", "shacket"],
  ["knit", "sweater", "jumper", "cardigan"],
  ["watch"],
  ["chain", "necklace", "pendant"],
  ["ring", "signet"],
  ["belt"],
  ["sunglasses"],
];

function roleOf(subcategory: string): string {
  const s = subcategory.toLowerCase();
  const family = ROLE_FAMILIES.find((f) => f.some((name) => s.includes(name)));
  return family ? family[0] : s;
}

/**
 * Does an owned item already do this candidate's job?
 * Same slot + same role + similar formality + same colour family.
 */
export function isRedundantWith(candidate: GarmentSpec, owned: GarmentSpec): boolean {
  if (candidate.category !== owned.category) return false;
  if (roleOf(candidate.subcategory) !== roleOf(owned.subcategory)) return false;
  if (Math.abs(candidate.formalityScore - owned.formalityScore) > 1.6) return false;
  const sameFamily = colorFamily(candidate.primaryColor) === colorFamily(owned.primaryColor);
  const bothNeutral = isNeutral(candidate.primaryColor) && isNeutral(owned.primaryColor);
  return sameFamily || bothNeutral;
}

/**
 * Pairwise wearability of two garments, 0..1. Used for "works with N items you
 * already own" — deliberately independent of any single occasion.
 */
export function pairScore(a: GarmentSpec, b: GarmentSpec): number {
  if (a.category === b.category && a.category !== "accessory") return 0;

  // Colour
  let color: number;
  const ca = a.primaryColor.toLowerCase();
  const cb = b.primaryColor.toLowerCase();
  if (isHeroPair(ca, cb)) color = 1;
  else if (isWardrobeNeutral(ca) && isWardrobeNeutral(cb)) color = 0.88;
  else if (isWardrobeNeutral(ca) || isWardrobeNeutral(cb)) color = 0.82;
  else if (colorFamily(ca) === colorFamily(cb)) color = 0.6;
  else color = 0.34;
  if (ca === cb && a.category !== b.category) color = Math.min(color, 0.78);

  // Formality — you cannot wear a 9 with a 3.
  const formality = clamp01(1 - Math.abs(a.formalityScore - b.formalityScore) / 4.2);

  // Style language
  const style = Math.max(tagOverlap(a.styleTags, b.styleTags), 0.3);

  // Do they get worn to the same kinds of things?
  const occasion = Math.max(tagOverlap(a.occasionTags, b.occasionTags), 0.2);

  // Do they belong in the same weather?
  const weather = Math.max(tagOverlap(a.weatherTags, b.weatherTags), 0.2);

  return clamp01(
    0.28 * color + 0.3 * formality + 0.18 * style + 0.14 * occasion + 0.1 * weather,
  );
}

const PAIR_THRESHOLD = 0.68;

/** The spread of situations GRWM measures wardrobe coverage against. */
export const LIFE_CONTEXTS: Array<{ prompt: string; temperatureC: number; band: string; condition: string }> = [
  { prompt: "Rooftop date tonight, smart casual", temperatureC: 31, band: "hot", condition: "clear" },
  { prompt: "Client dinner", temperatureC: 24, band: "warm", condition: "clear" },
  { prompt: "Sunday brunch", temperatureC: 27, band: "warm", condition: "clear" },
  { prompt: "Office day", temperatureC: 22, band: "warm", condition: "cloudy" },
  { prompt: "Night out", temperatureC: 25, band: "warm", condition: "clear" },
  { prompt: "Casual day running errands", temperatureC: 29, band: "warm", condition: "clear" },
  { prompt: "Airport fit, long haul", temperatureC: 20, band: "mild", condition: "cloudy" },
  { prompt: "Gallery opening", temperatureC: 18, band: "mild", condition: "clear" },
];

export function lifeContexts(
  profile: EngineProfile,
  city: string,
  now: number,
): EngineContext[] {
  return LIFE_CONTEXTS.map((c) => ({
    intent: parseIntent(c.prompt, {
      fallbackCity: city,
      baseFormality: profile.baseFormality,
    }),
    weather: {
      temperatureC: c.temperatureC,
      band: c.band,
      condition: c.condition,
      city,
    },
    now,
    seenSignatures: new Set<string>(),
  }));
}

export type CompatibilityResult = {
  /** 0..100 */
  wardrobeCompatibility: number;
  newOutfitsUnlocked: number;
  pairsWithCount: number;
  pairsWithTotal: number;
  occasionCoverageGain: string[];
  redundantWith: string[];
  averageScoreGain: number;
  /** the strongest outfit the candidate makes possible */
  bestOutfit: { itemIds: string[]; score: number; occasionLabel: string } | null;
  components: {
    pairCoverage: number;
    styleAlignment: number;
    occasionCoverage: number;
    weatherFit: number;
    redundancyMultiplier: number;
  };
};

/**
 * Evaluate a candidate garment (an archetype gap, or a real product extracted
 * by Context.dev) against the entire wardrobe.
 */
export function evaluateCandidate(
  wardrobe: EngineItem[],
  candidate: EngineItem,
  profile: EngineProfile,
  contexts: EngineContext[],
): CompatibilityResult {
  const spec = candidate.spec;
  const slot = spec.category as Slot;
  const complementSlots = COMPLEMENTS[slot] ?? [];

  // --- 1. How many of your pieces does it actually pair with? --------------
  const complements = wardrobe.filter(
    (i) => complementSlots.includes(i.spec.category as Slot) && i.availability === "available",
  );
  const pairs = complements.filter((i) => pairScore(spec, i.spec) >= PAIR_THRESHOLD);
  const pairCoverage = complements.length === 0 ? 0 : pairs.length / complements.length;

  // --- 2. Does it speak your style? ---------------------------------------
  const styleAlignment = clamp01(
    0.68 * Math.max(tagOverlap(spec.styleTags, profile.preferredStyles), 0.25) +
      0.32 *
        (profile.preferredColors.map((c) => c.toLowerCase()).includes(spec.primaryColor.toLowerCase())
          ? 1
          : isNeutral(spec.primaryColor)
            ? 0.9
            : isWardrobeNeutral(spec.primaryColor)
              ? 0.82
              : profile.avoidColors.map((c) => c.toLowerCase()).includes(spec.primaryColor.toLowerCase())
                ? 0.1
                : 0.4),
  );

  // --- 3. Which of your real situations does it cover? --------------------
  const covered = contexts.filter((ctx) =>
    spec.occasionTags.map((t) => t.toLowerCase()).includes(ctx.intent.occasion),
  );
  const occasionCoverage = contexts.length === 0 ? 0 : covered.length / contexts.length;

  // --- 4. Does it suit your actual climate? -------------------------------
  const weatherFit = mean(contexts.map((ctx) => scoreItemWeather(spec, ctx.weather)));

  // --- 5. Redundancy: the hard multiplier ---------------------------------
  const redundant = wardrobe.filter((i) => isRedundantWith(spec, i.spec));
  const redundancyMultiplier = 1 / (1 + 0.9 * redundant.length);

  // --- Marginal value: measure, don't guess -------------------------------
  const withCandidate = [...wardrobe, candidate];
  const deltas: number[] = [];
  const occasionCoverageGain: string[] = [];
  const unlockedSignatures = new Set<string>();
  let bestOutfit: CompatibilityResult["bestOutfit"] = null;

  for (const ctx of contexts) {
    const before = bestScoreFor(wardrobe, ctx, profile);
    const { outfits } = generateOutfits(withCandidate, ctx, profile, {
      limit: 300,
      diversify: false,
    });
    const after = outfits[0]?.overallScore ?? 0;
    deltas.push(after - before);

    if (after > before) occasionCoverageGain.push(ctx.intent.occasionLabel);

    // An outfit counts as *unlocked* only if it is genuinely good AND nothing
    // already in the wardrobe could fill the same slot equally well. Without
    // that second test a third pair of sneakers looks productive simply
    // because it slots into dozens of combinations you can already build.
    const owned = wardrobe.filter(
      (i) => i.spec.category === spec.category && i.availability === "available",
    );

    const containing = outfits
      .filter((o) => o.overallScore >= GOOD_OUTFIT)
      .filter((o) => o.slots.some((s) => s.item.id === candidate.id))
      .slice(0, MAX_OUTFITS_PER_CONTEXT);

    for (const outfit of containing) {
      let bestSubstitute = 0;
      for (const alternative of owned) {
        if (outfit.slots.some((s) => s.item.id === alternative.id)) continue;

        // If you already own something that fills this exact role, it is a
        // perfect substitute by definition — no score comparison needed. This
        // is what stops a third pair of white sneakers from claiming to
        // "unlock" outfits your existing sneakers already cover.
        if (isRedundantWith(spec, alternative.spec)) {
          bestSubstitute = outfit.overallScore;
          break;
        }

        const swapped = {
          slots: outfit.slots.map((s) =>
            s.item.id === candidate.id ? { slot: s.slot, item: alternative } : s,
          ),
          signature: outfit.signature,
        };
        const score = scoreOutfit(swapped, ctx, profile).overallScore;
        if (score > bestSubstitute) bestSubstitute = score;
      }

      if (outfit.overallScore - bestSubstitute < SUBSTITUTION_MARGIN) continue;

      unlockedSignatures.add(outfit.signature);
      if (!bestOutfit || outfit.overallScore > bestOutfit.score) {
        bestOutfit = {
          itemIds: outfit.slots.map((s) => s.item.id),
          score: outfit.overallScore,
          occasionLabel: ctx.intent.occasionLabel,
        };
      }
    }
  }

  const averageScoreGain = mean(deltas);
  const improvementBonus = 0.07 * clamp01(averageScoreGain / 3);

  const positive =
    0.42 * pairCoverage +
    0.22 * styleAlignment +
    0.18 * Math.max(occasionCoverage, 0.15) +
    0.18 * weatherFit;

  const wardrobeCompatibility = Math.round(
    clamp01(positive * redundancyMultiplier + improvementBonus * redundancyMultiplier) * 100,
  );

  return {
    wardrobeCompatibility,
    newOutfitsUnlocked: unlockedSignatures.size,
    pairsWithCount: pairs.length,
    pairsWithTotal: complements.length,
    occasionCoverageGain: unique(occasionCoverageGain),
    redundantWith: redundant.map((i) => i.name),
    averageScoreGain: Math.round(averageScoreGain * 10) / 10,
    bestOutfit,
    components: {
      pairCoverage: Math.round(pairCoverage * 100),
      styleAlignment: Math.round(styleAlignment * 100),
      occasionCoverage: Math.round(occasionCoverage * 100),
      weatherFit: Math.round(weatherFit * 100),
      redundancyMultiplier: Math.round(redundancyMultiplier * 100) / 100,
    },
  };
}

export type Verdict = "buy" | "maybe" | "skip";

/**
 * Compatibility leads the verdict. A high raw outfit count can never rescue a
 * redundant purchase — that is the whole point of the redundancy multiplier.
 */
export function verdictFor(result: CompatibilityResult): Verdict {
  if (result.wardrobeCompatibility >= 66 && result.newOutfitsUnlocked >= 3) return "buy";
  if (result.wardrobeCompatibility < 45) return "skip";
  if (result.newOutfitsUnlocked === 0 && result.averageScoreGain <= 0) return "skip";
  return "maybe";
}

/** Human copy for the verdict screen — assembled from the numbers above. */
export function verdictCopy(
  productName: string,
  result: CompatibilityResult,
): { headline: string; reasons: string[] } {
  const verdict = verdictFor(result);
  const reasons: string[] = [];

  if (verdict === "skip") {
    if (result.redundantWith.length > 0) {
      const list = result.redundantWith.slice(0, 2).join(" and ");
      reasons.push(
        `You already own ${result.redundantWith.length === 1 ? "" : `${result.redundantWith.length} pieces — `}${list} — serving almost the same role.`,
      );
    }
    if (result.newOutfitsUnlocked === 0) {
      reasons.push(
        `It slots into plenty of outfits — but not one you can't already build today.`,
      );
    } else {
      reasons.push(
        `This creates only ${result.newOutfitsUnlocked} meaningful new outfit${result.newOutfitsUnlocked === 1 ? "" : "s"}.`,
      );
    }
    if (result.averageScoreGain <= 0.4) {
      reasons.push(`It doesn't raise the ceiling on any occasion you actually dress for.`);
    }
  } else {
    reasons.push(
      `Works with ${result.pairsWithCount} item${result.pairsWithCount === 1 ? "" : "s"} you already own and unlocks about ${result.newOutfitsUnlocked} strong outfit${result.newOutfitsUnlocked === 1 ? "" : "s"}.`,
    );
    if (result.occasionCoverageGain.length > 0) {
      reasons.push(
        `It raises your best fit for ${result.occasionCoverageGain.slice(0, 3).map((o) => o.toLowerCase()).join(", ")}.`,
      );
    }
    if (result.redundantWith.length === 0) {
      reasons.push(`Nothing in your wardrobe currently fills this role.`);
    } else if (verdict === "maybe") {
      reasons.push(`Your ${result.redundantWith[0]} overlaps with it somewhat.`);
    }
  }

  const headline =
    verdict === "buy"
      ? `${productName} earns its place.`
      : verdict === "maybe"
        ? `${productName} is a nice-to-have, not a gap.`
        : `Your wardrobe doesn't need ${productName}.`;

  return { headline, reasons };
}

/** Suggest what the user should buy instead, when we say SKIP. */
export function betterAlternative(result: CompatibilityResult): string | null {
  if (verdictFor(result) !== "skip") return null;
  return null; // filled in by the caller, which knows the archetype gaps
}

export type { Intent };
