/**
 * The scoring half of the Wardrobe Intelligence Engine.
 *
 * Seven independent, explainable dimensions, each returning 0..1, combined with
 * a fixed weight hierarchy. Weather, occasion, wardrobe fit and personal style
 * dominate; mood/zodiac can only ever nudge.
 */

import type { Intent } from "./intent";
import {
  bandDistance,
  bandFromTemperature,
  breathability,
  clamp01,
  colorFamily,
  colorInfo,
  ENERGIES,
  type GarmentSpec,
  isHeroPair,
  isNeutral,
  mean,
  OCCASIONS,
  type Slot,
  tagOverlap,
  unique,
  ZODIAC,
} from "./taxonomy";

export const WEIGHTS = {
  occasion: 0.25,
  weather: 0.2,
  personalStyle: 0.2,
  colorHarmony: 0.15,
  comfort: 0.1,
  novelty: 0.05,
  personality: 0.05,
} as const;

export type Dimension = keyof typeof WEIGHTS;

export type EngineItem = {
  id: string;
  name: string;
  spec: GarmentSpec;
  wearCount: number;
  lastWornAt?: number;
  availability: string;
};

export type EngineProfile = {
  preferredStyles: string[];
  preferredColors: string[];
  avoidColors: string[];
  baseFormality: number;
  styleAffinity: Record<string, number>;
  colorAffinity: Record<string, number>;
  categoryAffinity: Record<string, number>;
  zodiacSign?: string;
};

export type EngineWeather = {
  temperatureC: number;
  band: string;
  condition: string;
  humidity?: number;
  city?: string;
};

export type EngineContext = {
  intent: Intent;
  weather: EngineWeather;
  energy?: string;
  now: number;
  /** signatures already shown to the user, for novelty */
  seenSignatures: Set<string>;
};

export type Outfit = {
  /** slot -> items (accessory may hold up to 2) */
  slots: Array<{ slot: Slot; item: EngineItem }>;
  signature: string;
};

export type ScoredOutfit = Outfit & {
  overallScore: number;
  breakdown: Record<Dimension, number>;
};

/** How much each slot contributes to the outfit's perceived formality. */
const SLOT_FORMALITY_WEIGHT: Record<Slot, number> = {
  top: 0.3,
  bottom: 0.28,
  shoes: 0.26,
  layer: 0.11,
  accessory: 0.05,
};

/** Occasions that read similarly, used for partial credit. */
const OCCASION_FAMILIES: string[][] = [
  ["date", "rooftop-date", "dinner", "night-out", "gallery"],
  ["office", "client-dinner", "wedding"],
  ["brunch", "casual", "airport"],
];

function occasionSiblings(occasionId: string): string[] {
  const family = OCCASION_FAMILIES.find((f) => f.includes(occasionId));
  return family ? family.filter((o) => o !== occasionId) : [];
}

// ---------------------------------------------------------------------------
// 1. Occasion / dress code — 25%
// ---------------------------------------------------------------------------

export function outfitFormality(outfit: Outfit): number {
  let total = 0;
  let weight = 0;
  for (const { slot, item } of outfit.slots) {
    const w = SLOT_FORMALITY_WEIGHT[slot];
    total += item.spec.formalityScore * w;
    weight += w;
  }
  return weight === 0 ? 5 : total / weight;
}

export function scoreOccasion(outfit: Outfit, ctx: EngineContext): number {
  const { occasion, targetFormality } = ctx.intent;
  const siblings = occasionSiblings(occasion);
  const occDef = OCCASIONS[occasion];
  const tolerance = occDef?.tolerance ?? 2;

  // (a) does each garment actually belong at this kind of thing?
  const tagScores = outfit.slots.map(({ item }) => {
    const tags = item.spec.occasionTags.map((t) => t.toLowerCase());
    if (tags.includes(occasion)) return 1;
    if (tags.some((t) => siblings.includes(t))) return 0.72;
    if (tags.includes("any")) return 0.7;
    return 0.3;
  });
  const tagScore = mean(tagScores);

  // (b) is the overall formality right for the brief?
  const formality = outfitFormality(outfit);
  const deviation = Math.abs(formality - targetFormality);
  const formalityFit = clamp01(1 - deviation / (tolerance + 1.6));

  // (c) is the outfit internally coherent, or is it a tuxedo with gym shorts?
  const formalities = outfit.slots
    .filter((s) => s.slot !== "accessory")
    .map((s) => s.item.spec.formalityScore);
  const spread = formalities.length
    ? Math.max(...formalities) - Math.min(...formalities)
    : 0;
  const coherence = clamp01(1 - Math.max(0, spread - 2.5) / 5);

  // (d) explicit avoidances from the prompt ("nothing too formal")
  let penalty = 0;
  if (ctx.intent.avoidStyles.length) {
    for (const { item } of outfit.slots) {
      if (tagOverlap(item.spec.styleTags, ctx.intent.avoidStyles) > 0) penalty += 0.06;
    }
  }

  // (e) styling completeness — a finished look reads more intentional than a
  // bare top/bottom/shoes, and matters more the dressier the occasion gets.
  const accessories = outfit.slots.filter((s) => s.slot === "accessory").length;
  const finishWeight = ctx.intent.targetFormality >= 5.5 ? 0.05 : 0.03;
  const finish = Math.min(2, accessories) * finishWeight;

  return clamp01(
    0.44 * tagScore + 0.41 * formalityFit + 0.15 * coherence + finish - penalty,
  );
}

// ---------------------------------------------------------------------------
// 2. Weather — 20%
// ---------------------------------------------------------------------------

const SEASON_BY_BAND: Record<string, string[]> = {
  hot: ["summer"],
  warm: ["summer", "spring"],
  mild: ["spring", "autumn"],
  cool: ["autumn", "spring"],
  cold: ["winter"],
};

export function scoreItemWeather(spec: GarmentSpec, weather: EngineWeather): number {
  const band = weather.band;
  const distances = spec.weatherTags.length
    ? spec.weatherTags.map((t) => bandDistance(t.toLowerCase(), band))
    : [2];
  const best = Math.min(...distances);
  let score = clamp01(1 - best * 0.34);

  const seasons = SEASON_BY_BAND[band] ?? [];
  if (spec.seasonTags.some((s) => seasons.includes(s.toLowerCase()))) score += 0.08;
  if (spec.seasonTags.map((s) => s.toLowerCase()).includes("all-season")) score += 0.05;

  // Fabric sanity check against the actual temperature.
  const breath = breathability(spec);
  if (weather.temperatureC >= 28 && breath < 0.35) score -= 0.28;
  if (weather.temperatureC <= 10 && breath > 0.85) score -= 0.2;

  if (weather.condition === "rain" && /suede/i.test(spec.material ?? "")) score -= 0.25;

  return clamp01(score);
}

export function scoreWeather(outfit: Outfit, ctx: EngineContext): number {
  const w = ctx.weather;
  const perItem = outfit.slots.map(({ item }) => scoreItemWeather(item.spec, w));
  let score = mean(perItem);

  const layers = outfit.slots.filter((s) => s.slot === "layer");
  if (layers.length > 0) {
    if (w.temperatureC >= 30) {
      // A jacket at 31°C is only forgivable if it is genuinely light.
      const lightest = Math.max(...layers.map((l) => breathability(l.item.spec)));
      score -= lightest > 0.75 ? 0.06 : 0.22;
    } else if (w.temperatureC <= 14) {
      score += 0.1;
    }
  } else if (w.temperatureC <= 12) {
    score -= 0.18; // no layer when it is genuinely cold
  }

  if ((w.humidity ?? 0) >= 60 && w.temperatureC >= 27) {
    const breath = mean(outfit.slots.map((s) => breathability(s.item.spec)));
    score += (breath - 0.6) * 0.25;
  }

  return clamp01(score);
}

// ---------------------------------------------------------------------------
// 3. Personal style — 20%
// ---------------------------------------------------------------------------

function affinityFor(map: Record<string, number>, keys: string[]): number {
  if (keys.length === 0) return 0;
  let sum = 0;
  for (const key of keys) sum += map[key.toLowerCase()] ?? 0;
  // affinities live roughly in -3..+3; squash into -1..1
  return Math.tanh(sum / (keys.length * 2));
}

export function scorePersonalStyle(outfit: Outfit, ctx: EngineContext, profile: EngineProfile): number {
  const preferred = unique([...profile.preferredStyles, ...ctx.intent.styleBias]);

  const styleMatch = mean(
    outfit.slots.map(({ item }) => {
      const direct = tagOverlap(item.spec.styleTags, preferred);
      // never zero out an item just because it is a plain basic
      return Math.max(direct, 0.35);
    }),
  );

  const allStyleTags = outfit.slots.flatMap((s) => s.item.spec.styleTags);
  const allColors = outfit.slots.flatMap((s) => [
    s.item.spec.primaryColor,
    ...s.item.spec.secondaryColors,
  ]);
  const allCategories = outfit.slots.map((s) => s.item.spec.category);

  const learned =
    0.5 * affinityFor(profile.styleAffinity, allStyleTags) +
    0.3 * affinityFor(profile.colorAffinity, allColors) +
    0.2 * affinityFor(profile.categoryAffinity, allCategories);

  let colorPref = 0.45;
  const preferredHits = allColors.filter((c) =>
    profile.preferredColors.map((p) => p.toLowerCase()).includes(c.toLowerCase()),
  ).length;
  const avoidHits = allColors.filter((c) =>
    profile.avoidColors.map((p) => p.toLowerCase()).includes(c.toLowerCase()),
  ).length;
  colorPref += Math.min(0.55, preferredHits * 0.18) - avoidHits * 0.3;

  // Learned affinity is a *modifier*, not an additive term — otherwise a
  // perfect outfit could never score above its weight, capping the dimension.
  const base = 0.66 * styleMatch + 0.34 * clamp01(colorPref);
  return clamp01(base * (1 + 0.22 * learned));
}

// ---------------------------------------------------------------------------
// 4. Colour harmony — 15%
// ---------------------------------------------------------------------------

export function scoreColorHarmony(outfit: Outfit, ctx: EngineContext): number {
  const garments = outfit.slots.filter((s) => s.slot !== "accessory");
  const colors = garments.map((s) => s.item.spec.primaryColor.toLowerCase());
  const accents = colors.filter((c) => !isNeutral(c));

  let score: number;
  const distinct = unique(colors);
  if (distinct.length === 1) {
    score = 0.9; // full monochrome: intentional, slightly flat
  } else if (accents.length === 0) {
    score = 0.87; // all neutrals: safe and clean
  } else if (accents.length === 1) {
    score = 0.95; // neutral base + one accent: the classic win
  } else if (accents.length === 2) {
    score = colorFamily(accents[0]) === colorFamily(accents[1]) ? 0.79 : 0.58;
  } else {
    score = 0.44;
  }

  // Deliberate, well-known pairings.
  let heroBonus = 0;
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      if (isHeroPair(colors[i], colors[j])) heroBonus += 0.035;
    }
  }
  score += Math.min(0.09, heroBonus);

  // Pattern discipline: one pattern is a focal point, two is noise.
  const patterned = garments.filter(
    (s) => s.item.spec.pattern && s.item.spec.pattern.toLowerCase() !== "solid",
  ).length;
  if (patterned >= 2) score -= 0.18;

  // Warm/cool tension.
  const families = unique(accents.map((c) => colorFamily(c)));
  if (families.includes("warm") && families.includes("cool")) score -= 0.09;

  // Tonal contrast: some light/dark separation makes an outfit read.
  const darknesses = colors.map((c) => colorInfo(c).darkness);
  const contrast = darknesses.length > 1 ? Math.max(...darknesses) - Math.min(...darknesses) : 0;
  if (distinct.length > 1) {
    if (contrast < 0.12) score -= 0.06;
    else if (contrast > 0.45) score += 0.04;
  }

  // Metals shouldn't fight each other.
  const metals = outfit.slots
    .filter((s) => s.slot === "accessory")
    .map((s) => s.item.spec.primaryColor.toLowerCase())
    .filter((c) => c === "silver" || c === "gold");
  if (unique(metals).length > 1) score -= 0.07;

  // Dark monochrome is a feature, not a bug, for certain energies.
  if (distinct.length <= 2 && ctx.intent.styleBias.includes("monochrome")) score += 0.05;

  return clamp01(score);
}

// ---------------------------------------------------------------------------
// 5. Comfort / season — 10%
// ---------------------------------------------------------------------------

/** The breathability an outfit *should* have at a given temperature. */
function desiredBreathability(temperatureC: number): number {
  if (temperatureC >= 32) return 0.92;
  if (temperatureC >= 27) return 0.82;
  if (temperatureC >= 20) return 0.68;
  if (temperatureC >= 12) return 0.5;
  return 0.3;
}

export function scoreComfort(outfit: Outfit, ctx: EngineContext): number {
  const target = desiredBreathability(ctx.weather.temperatureC);
  const actual = mean(outfit.slots.map((s) => breathability(s.item.spec)));
  let score = clamp01(1 - Math.abs(target - actual) * 1.35);

  // Very high formality is inherently less comfortable in real heat.
  const formality = outfitFormality(outfit);
  if (ctx.weather.temperatureC >= 30 && formality >= 8) score -= 0.14;

  // Relaxed cuts read as comfortable.
  const relaxed = outfit.slots.filter((s) =>
    s.item.spec.styleTags.some((t) => ["relaxed", "comfort", "oversized"].includes(t.toLowerCase())),
  ).length;
  score += Math.min(0.12, relaxed * 0.05);

  if (ctx.intent.occasion === "airport") {
    score += relaxed >= 2 ? 0.08 : -0.08;
  }

  return clamp01(score);
}

// ---------------------------------------------------------------------------
// 6. Wear history / novelty — 5%
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

export function scoreNovelty(outfit: Outfit, ctx: EngineContext): number {
  // Accessories are excluded: a watch you wear every day is not "unoriginal",
  // and penalising it would quietly strip accessories out of every outfit.
  const garments = outfit.slots.filter((s) => s.slot !== "accessory");
  const perItem = garments.map(({ item }) => {
    if (!item.lastWornAt) return 1;
    const days = (ctx.now - item.lastWornAt) / DAY_MS;
    if (days < 1) return 0.15;
    if (days < 3) return 0.45;
    if (days < 7) return 0.75;
    return 1;
  });
  let score = mean(perItem);
  if (ctx.seenSignatures.has(outfit.signature)) score -= 0.45;
  return clamp01(score);
}

/** True when GRWM has genuinely never put this exact combination together. */
export function isNewCombination(outfit: Outfit, ctx: EngineContext): boolean {
  return !ctx.seenSignatures.has(outfit.signature);
}

// ---------------------------------------------------------------------------
// 7. Mood / zodiac — 5%
// ---------------------------------------------------------------------------

export function scorePersonality(outfit: Outfit, ctx: EngineContext, profile: EngineProfile): number {
  const energy = ctx.energy ? ENERGIES[ctx.energy] : undefined;
  const zodiac = profile.zodiacSign ? ZODIAC[profile.zodiacSign.toLowerCase()] : undefined;

  const bias = unique([...(energy?.styleBias ?? []), ...(zodiac?.styleBias ?? [])]);
  if (bias.length === 0) return 0.7; // neutral, not punishing

  const tags = outfit.slots.flatMap((s) => s.item.spec.styleTags);
  let score = 0.45 + 0.55 * tagOverlap(bias, tags);

  if (energy) {
    const colors = outfit.slots
      .filter((s) => s.slot !== "accessory")
      .map((s) => colorInfo(s.item.spec.primaryColor).darkness);
    const contrast = colors.length > 1 ? Math.max(...colors) - Math.min(...colors) : 0;
    score -= Math.abs(energy.contrast - contrast) * 0.18;
  }

  return clamp01(score);
}

// ---------------------------------------------------------------------------
// Combine
// ---------------------------------------------------------------------------

export function scoreOutfit(
  outfit: Outfit,
  ctx: EngineContext,
  profile: EngineProfile,
): ScoredOutfit {
  const breakdown: Record<Dimension, number> = {
    occasion: scoreOccasion(outfit, ctx),
    weather: scoreWeather(outfit, ctx),
    personalStyle: scorePersonalStyle(outfit, ctx, profile),
    colorHarmony: scoreColorHarmony(outfit, ctx),
    comfort: scoreComfort(outfit, ctx),
    novelty: scoreNovelty(outfit, ctx),
    personality: scorePersonality(outfit, ctx, profile),
  };

  let total = 0;
  for (const key of Object.keys(WEIGHTS) as Dimension[]) {
    total += breakdown[key] * WEIGHTS[key];
  }

  return {
    ...outfit,
    overallScore: Math.round(clamp01(total) * 100),
    breakdown,
  };
}

/** Cheap pre-score used to prune the candidate space before full evaluation. */
export function prescore(
  items: EngineItem[],
  ctx: EngineContext,
  profile: EngineProfile,
): number {
  const occasion = ctx.intent.occasion;
  const siblings = occasionSiblings(occasion);
  return mean(
    items.map((item) => {
      const tags = item.spec.occasionTags.map((t) => t.toLowerCase());
      const occ = tags.includes(occasion) ? 1 : tags.some((t) => siblings.includes(t)) ? 0.7 : 0.3;
      const wx = scoreItemWeather(item.spec, ctx.weather);
      const formalityFit = clamp01(
        1 - Math.abs(item.spec.formalityScore - ctx.intent.targetFormality) / 4.5,
      );
      const style = Math.max(
        tagOverlap(item.spec.styleTags, unique([...profile.preferredStyles, ...ctx.intent.styleBias])),
        0.3,
      );
      return occ * 0.35 + wx * 0.28 + formalityFit * 0.22 + style * 0.15;
    }),
  );
}

export function bandFor(temperatureC: number): string {
  return bandFromTemperature(temperatureC);
}
