/**
 * Wardrobe compatibility — "does this make what I already own more useful?"
 *
 * This powers "Should I Buy This?". It is deliberately **not** a taste model:
 * it answers a countable question. How many of your pieces does this genuinely
 * pair with, does it cover occasions you actually dress for, does your climate
 * suit it — and, decisively, do you already own something doing this job?
 *
 * Simplified from an earlier version that re-ran the whole recommendation engine
 * across eight synthetic contexts and performed a substitution search over ~300
 * outfits per context. That was thousands of scoring passes for a number a
 * direct pairwise count gives just as well. Gemini's `rankProducts` handles the
 * qualitative judgement in the primary path; this remains as the deterministic
 * measurement and as the fallback.
 */

import {
  clamp01,
  colorFamily,
  isWardrobeNeutral,
  mean,
  type GarmentSpec,
  type Slot,
  tagOverlap,
  unique,
} from "./taxonomy";
import { itemWeatherFit } from "./measure";

/** What a garment needs to be worn *with*. */
const COMPLEMENTS: Record<string, Slot[]> = {
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
  ["shirt", "button-down", "oxford shirt"],
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
 * Does something in the wardrobe already do this item's job?
 * Same slot + same role + similar formality + compatible colour family.
 *
 * This is the single most important check in the whole feature: it is what makes
 * GRWM say "skip it" instead of cheerfully approving a third pair of white
 * sneakers.
 */
export function isRedundantWith(candidate: GarmentSpec, owned: GarmentSpec): boolean {
  if (candidate.category !== owned.category) return false;
  if (roleOf(candidate.subcategory) !== roleOf(owned.subcategory)) return false;
  if (Math.abs(candidate.formalityScore - owned.formalityScore) > 1.6) return false;
  const sameFamily = colorFamily(candidate.primaryColor) === colorFamily(owned.primaryColor);
  const bothNeutral =
    isWardrobeNeutral(candidate.primaryColor) && isWardrobeNeutral(owned.primaryColor);
  return sameFamily || bothNeutral;
}

/** Pairwise wearability of two garments, 0..1. Occasion-independent. */
export function pairScore(a: GarmentSpec, b: GarmentSpec): number {
  if (a.category === b.category && a.category !== "accessory") return 0;

  const ca = a.primaryColor.toLowerCase();
  const cb = b.primaryColor.toLowerCase();
  let color: number;
  if (isWardrobeNeutral(ca) && isWardrobeNeutral(cb)) color = 0.9;
  else if (isWardrobeNeutral(ca) || isWardrobeNeutral(cb)) color = 0.82;
  else if (colorFamily(ca) === colorFamily(cb)) color = 0.6;
  else color = 0.34;

  const formality = clamp01(1 - Math.abs(a.formalityScore - b.formalityScore) / 4.2);
  const style = Math.max(tagOverlap(a.styleTags, b.styleTags), 0.3);
  const occasion = Math.max(tagOverlap(a.occasionTags, b.occasionTags), 0.2);
  const weather = Math.max(tagOverlap(a.weatherTags, b.weatherTags), 0.2);

  return clamp01(
    0.28 * color + 0.3 * formality + 0.18 * style + 0.14 * occasion + 0.1 * weather,
  );
}

const PAIR_THRESHOLD = 0.68;

/** The occasions GRWM measures coverage against. */
const EVERYDAY_OCCASIONS = [
  "rooftop-date",
  "client-dinner",
  "brunch",
  "office",
  "night-out",
  "casual",
  "airport",
  "gallery",
];

/** Representative temperatures for the user's climate, for the weather term. */
const CLIMATE_SAMPLE = [
  { temperatureC: 31, band: "hot" },
  { temperatureC: 25, band: "warm" },
  { temperatureC: 19, band: "mild" },
];

export type CompatibilityInput = {
  spec: GarmentSpec;
  /** what the user owns */
  wardrobe: Array<{ name: string; spec: GarmentSpec; availability: string }>;
  preferredStyles: string[];
  preferredColors: string[];
  avoidColors: string[];
};

export type CompatibilityResult = {
  /** 0..100 */
  wardrobeCompatibility: number;
  /** genuinely new combinations this piece makes possible */
  newOutfitsUnlocked: number;
  pairsWithCount: number;
  pairsWithTotal: number;
  occasionCoverageGain: string[];
  redundantWith: string[];
  components: {
    pairCoverage: number;
    styleAlignment: number;
    occasionCoverage: number;
    weatherFit: number;
    redundancyMultiplier: number;
  };
};

/**
 * Score a candidate garment against the wardrobe.
 *
 * The four positive terms are averaged, then **divided down by redundancy**.
 * Redundancy is a multiplier rather than a penalty on purpose: owning two things
 * that already do this job means a third adds almost nothing, however lovely it
 * is in isolation.
 */
export function evaluateCandidate(input: CompatibilityInput): CompatibilityResult {
  const { spec, wardrobe } = input;
  const available = wardrobe.filter((item) => item.availability === "available");

  // 1. How many of your pieces does it actually pair with?
  const complementSlots = COMPLEMENTS[spec.category] ?? [];
  const complements = available.filter((item) =>
    complementSlots.includes(item.spec.category as Slot),
  );
  const pairs = complements.filter((item) => pairScore(spec, item.spec) >= PAIR_THRESHOLD);
  const pairCoverage = complements.length === 0 ? 0 : pairs.length / complements.length;

  // 2. Does it speak the user's style?
  const colorTerm = input.preferredColors.map((c) => c.toLowerCase()).includes(
    spec.primaryColor.toLowerCase(),
  )
    ? 1
    : input.avoidColors.map((c) => c.toLowerCase()).includes(spec.primaryColor.toLowerCase())
      ? 0.1
      : isWardrobeNeutral(spec.primaryColor)
        ? 0.85
        : 0.4;
  const styleAlignment = clamp01(
    0.68 * Math.max(tagOverlap(spec.styleTags, input.preferredStyles), 0.25) + 0.32 * colorTerm,
  );

  // 3. Which of the occasions the user dresses for does it cover?
  const covered = EVERYDAY_OCCASIONS.filter((occasion) =>
    spec.occasionTags.map((t) => t.toLowerCase()).includes(occasion),
  );
  const occasionCoverage = covered.length / EVERYDAY_OCCASIONS.length;

  // 4. Does it suit the climate?
  const weatherFit = mean(
    CLIMATE_SAMPLE.map((sample) => itemWeatherFit(spec, sample.temperatureC, sample.band)),
  );

  // 5. Redundancy — the decisive term.
  const redundant = available.filter((item) => isRedundantWith(spec, item.spec));
  const redundancyMultiplier = 1 / (1 + 0.9 * redundant.length);

  const positive =
    0.42 * pairCoverage +
    0.22 * styleAlignment +
    0.18 * Math.max(occasionCoverage, 0.15) +
    0.18 * weatherFit;

  const wardrobeCompatibility = Math.round(clamp01(positive * redundancyMultiplier) * 100);

  // "Outfits unlocked": pairs that become available, discounted by redundancy.
  // A piece whose job is already covered unlocks nothing, by definition.
  const combinations = countCombinations(spec, available);
  const newOutfitsUnlocked = redundant.length > 0 ? 0 : combinations;

  return {
    wardrobeCompatibility,
    newOutfitsUnlocked,
    pairsWithCount: pairs.length,
    pairsWithTotal: complements.length,
    occasionCoverageGain: redundant.length > 0 ? [] : unique(covered),
    redundantWith: redundant.map((item) => item.name),
    components: {
      pairCoverage: Math.round(pairCoverage * 100),
      styleAlignment: Math.round(styleAlignment * 100),
      occasionCoverage: Math.round(occasionCoverage * 100),
      weatherFit: Math.round(weatherFit * 100),
      redundancyMultiplier: Math.round(redundancyMultiplier * 100) / 100,
    },
  };
}

/**
 * Count the outfits this piece could appear in: for a shoe, that is
 * (compatible tops x compatible bottoms). Direct multiplication, no search.
 */
function countCombinations(
  spec: GarmentSpec,
  wardrobe: Array<{ spec: GarmentSpec }>,
): number {
  const compatible = (slot: string) =>
    wardrobe.filter(
      (item) => item.spec.category === slot && pairScore(spec, item.spec) >= PAIR_THRESHOLD,
    ).length;

  switch (spec.category) {
    case "shoes":
      return compatible("top") * compatible("bottom");
    case "top":
      return compatible("bottom") * compatible("shoes");
    case "bottom":
      return compatible("top") * compatible("shoes");
    case "layer":
    case "accessory":
      return compatible("top") * Math.max(1, compatible("bottom"));
    default:
      return 0;
  }
}

export type Verdict = "buy" | "maybe" | "skip";

/**
 * Compatibility leads the verdict. A high raw combination count can never
 * rescue a redundant purchase — that is the point of the redundancy multiplier.
 */
export function verdictFor(result: CompatibilityResult): Verdict {
  if (result.wardrobeCompatibility >= 66 && result.newOutfitsUnlocked >= 3) return "buy";
  if (result.wardrobeCompatibility < 45) return "skip";
  if (result.newOutfitsUnlocked === 0) return "skip";
  return "maybe";
}

/** Human copy for the verdict screen, assembled from the numbers above. */
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
      reasons.push(`It slots into plenty of outfits — but not one you can't already build today.`);
    } else {
      reasons.push(
        `It only works with ${result.pairsWithCount} of the ${result.pairsWithTotal} pieces it would need to pair with.`,
      );
    }
  } else {
    reasons.push(
      `Works with ${result.pairsWithCount} item${result.pairsWithCount === 1 ? "" : "s"} you already own and unlocks about ${result.newOutfitsUnlocked} new outfit${result.newOutfitsUnlocked === 1 ? "" : "s"}.`,
    );
    if (result.occasionCoverageGain.length > 0) {
      reasons.push(
        `It covers ${result.occasionCoverageGain.slice(0, 3).map(readable).join(", ")}.`,
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

function readable(occasion: string): string {
  return occasion.replace(/-/g, " ");
}
