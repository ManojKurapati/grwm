/**
 * Deterministic measurement.
 *
 * This module answers "how well does this outfit serve this situation?" for an
 * outfit that has *already been chosen* — by Gemini or by the fallback picker.
 * It never chooses anything itself.
 *
 * Five dimensions, all cheap, all explainable, no network, no model. Kept
 * deliberately small: these are the checks that are genuinely objective
 * (is linen sensible at 38°C, do these colours fight, is this formal enough for
 * a client dinner). Taste beyond that is Gemini's job, not a rule table's.
 */

import {
  breathability,
  clamp01,
  colorFamily,
  isWardrobeNeutral,
  mean,
  OCCASIONS,
  type GarmentSpec,
  type Slot,
  tagOverlap,
  unique,
} from "./taxonomy";
import type { Reason, ScoreBreakdown } from "../recommendation";

export type MeasurableItem = {
  id: string;
  name: string;
  spec: GarmentSpec;
};

export type MeasureContext = {
  occasion: string;
  occasionLabel: string;
  dressCode: string;
  targetFormality: number;
  timeOfDay: string;
  temperatureC: number;
  band: string;
  condition: string;
  humidity?: number;
  city?: string;
  preferredStyles: string[];
  preferredColors: string[];
  avoidColors: string[];
};

/** How much each slot contributes to how formal an outfit reads. */
const SLOT_WEIGHT: Record<string, number> = {
  top: 0.3,
  bottom: 0.28,
  shoes: 0.26,
  layer: 0.11,
  accessory: 0.05,
};

/** Occasions that read similarly, for partial credit. */
const OCCASION_FAMILIES: string[][] = [
  ["date", "rooftop-date", "dinner", "night-out", "gallery"],
  ["office", "client-dinner", "wedding"],
  ["brunch", "casual", "airport"],
];

function siblings(occasion: string): string[] {
  const family = OCCASION_FAMILIES.find((f) => f.includes(occasion));
  return family ? family.filter((o) => o !== occasion) : [];
}

export function outfitFormality(items: MeasurableItem[]): number {
  let total = 0;
  let weight = 0;
  for (const item of items) {
    const w = SLOT_WEIGHT[item.spec.category] ?? 0.1;
    total += item.spec.formalityScore * w;
    weight += w;
  }
  return weight === 0 ? 5 : total / weight;
}

// --- 1. occasion -----------------------------------------------------------

function measureOccasion(items: MeasurableItem[], ctx: MeasureContext): number {
  const family = siblings(ctx.occasion);
  const tagScore = mean(
    items.map((item) => {
      const tags = item.spec.occasionTags.map((t) => t.toLowerCase());
      if (tags.includes(ctx.occasion)) return 1;
      if (tags.some((t) => family.includes(t))) return 0.72;
      return 0.32;
    }),
  );

  const tolerance = OCCASIONS[ctx.occasion]?.tolerance ?? 2;
  const deviation = Math.abs(outfitFormality(items) - ctx.targetFormality);
  const formalityFit = clamp01(1 - deviation / (tolerance + 1.6));

  return clamp01(0.5 * tagScore + 0.5 * formalityFit);
}

// --- 2. weather ------------------------------------------------------------

const SEASON_BY_BAND: Record<string, string[]> = {
  hot: ["summer"],
  warm: ["summer", "spring"],
  mild: ["spring", "autumn"],
  cool: ["autumn", "spring"],
  cold: ["winter"],
};

const BANDS = ["cold", "cool", "mild", "warm", "hot"];

/** Single-garment weather suitability. Also used as a hard-constraint input. */
export function itemWeatherFit(spec: GarmentSpec, temperatureC: number, band: string): number {
  const target = BANDS.indexOf(band);
  const distances = spec.weatherTags.length
    ? spec.weatherTags.map((t) => {
        const i = BANDS.indexOf(t.toLowerCase());
        return i < 0 || target < 0 ? 2 : Math.abs(i - target);
      })
    : [2];
  let score = clamp01(1 - Math.min(...distances) * 0.34);

  const seasons = SEASON_BY_BAND[band] ?? [];
  if (spec.seasonTags.some((s) => seasons.includes(s.toLowerCase()))) score += 0.08;
  if (spec.seasonTags.map((s) => s.toLowerCase()).includes("all-season")) score += 0.05;

  // Fabric against the actual thermometer.
  const breath = breathability(spec);
  if (temperatureC >= 28 && breath < 0.35) score -= 0.28;
  if (temperatureC <= 10 && breath > 0.85) score -= 0.2;

  return clamp01(score);
}

function measureWeather(items: MeasurableItem[], ctx: MeasureContext): number {
  let score = mean(items.map((i) => itemWeatherFit(i.spec, ctx.temperatureC, ctx.band)));

  const layers = items.filter((i) => i.spec.category === "layer");
  if (layers.length > 0 && ctx.temperatureC >= 30) {
    const lightest = Math.max(...layers.map((l) => breathability(l.spec)));
    score -= lightest > 0.75 ? 0.06 : 0.22;
  }
  if (layers.length === 0 && ctx.temperatureC <= 12) score -= 0.18;

  if (ctx.condition === "rain" && items.some((i) => /suede/i.test(i.spec.material ?? ""))) {
    score -= 0.15;
  }

  return clamp01(score);
}

// --- 3. personal style -----------------------------------------------------

function measurePersonalStyle(items: MeasurableItem[], ctx: MeasureContext): number {
  const styleMatch = mean(
    items.map((item) => Math.max(tagOverlap(item.spec.styleTags, ctx.preferredStyles), 0.35)),
  );

  const colors = items.flatMap((i) => [i.spec.primaryColor, ...i.spec.secondaryColors]);
  const preferred = ctx.preferredColors.map((c) => c.toLowerCase());
  const avoided = ctx.avoidColors.map((c) => c.toLowerCase());

  let colorPref = 0.45;
  colorPref += Math.min(0.55, colors.filter((c) => preferred.includes(c.toLowerCase())).length * 0.18);
  colorPref -= colors.filter((c) => avoided.includes(c.toLowerCase())).length * 0.3;

  return clamp01(0.66 * styleMatch + 0.34 * clamp01(colorPref));
}

// --- 4. colour harmony ----------------------------------------------------

/**
 * Compact palette check. The previous version carried a hand-written table of
 * "hero pairings"; that is taste, and taste is Gemini's. What remains is the
 * objective part: how many non-neutral colours are competing, and whether more
 * than one pattern is fighting for attention.
 */
function measureColorHarmony(items: MeasurableItem[]): number {
  const garments = items.filter((i) => i.spec.category !== "accessory");
  const colors = garments.map((i) => i.spec.primaryColor.toLowerCase());
  if (colors.length === 0) return 0.7;

  const accents = colors.filter((c) => !isWardrobeNeutral(c));
  const distinct = unique(colors);

  let score: number;
  if (accents.length === 0) score = distinct.length === 1 ? 0.9 : 0.93;
  else if (accents.length === 1) score = 0.95;
  else if (accents.length === 2) {
    score = colorFamily(accents[0]) === colorFamily(accents[1]) ? 0.78 : 0.58;
  } else score = 0.45;

  const patterned = garments.filter(
    (i) => i.spec.pattern && !["solid", "textured"].includes(i.spec.pattern.toLowerCase()),
  ).length;
  if (patterned >= 2) score -= 0.18;

  // Mixed metals read as unconsidered.
  const metals = unique(
    items
      .filter((i) => i.spec.category === "accessory")
      .map((i) => i.spec.primaryColor.toLowerCase())
      .filter((c) => c === "silver" || c === "gold"),
  );
  if (metals.length > 1) score -= 0.07;

  return clamp01(score);
}

// --- 5. comfort -----------------------------------------------------------

function desiredBreathability(temperatureC: number): number {
  if (temperatureC >= 32) return 0.92;
  if (temperatureC >= 27) return 0.82;
  if (temperatureC >= 20) return 0.68;
  if (temperatureC >= 12) return 0.5;
  return 0.3;
}

function measureComfort(items: MeasurableItem[], ctx: MeasureContext): number {
  const target = desiredBreathability(ctx.temperatureC);
  const actual = mean(items.map((i) => breathability(i.spec)));
  let score = clamp01(1 - Math.abs(target - actual) * 1.35);

  if (ctx.temperatureC >= 30 && outfitFormality(items) >= 8) score -= 0.14;

  const relaxed = items.filter((i) =>
    i.spec.styleTags.some((t) => ["relaxed", "comfort", "oversized"].includes(t.toLowerCase())),
  ).length;
  score += Math.min(0.12, relaxed * 0.05);

  return clamp01(score);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

const pct = (n: number) => Math.round(clamp01(n) * 100);

/** Weights used to roll the five dimensions into the fallback's overall score. */
export const WEIGHTS = {
  occasion: 0.3,
  weather: 0.25,
  personalStyle: 0.2,
  colorHarmony: 0.15,
  comfort: 0.1,
} as const;

export type Measurement = {
  breakdown: ScoreBreakdown;
  reasons: Reason[];
  /** 0-100, the weighted roll-up. The fallback uses this as `overallScore`. */
  overall: number;
};

export function measureOutfit(items: MeasurableItem[], ctx: MeasureContext): Measurement {
  const raw = {
    occasion: measureOccasion(items, ctx),
    weather: measureWeather(items, ctx),
    personalStyle: measurePersonalStyle(items, ctx),
    colorHarmony: measureColorHarmony(items),
    comfort: measureComfort(items, ctx),
  };

  const breakdown: ScoreBreakdown = {
    occasion: pct(raw.occasion),
    weather: pct(raw.weather),
    personalStyle: pct(raw.personalStyle),
    colorHarmony: pct(raw.colorHarmony),
    comfort: pct(raw.comfort),
  };

  const overall = Math.round(
    clamp01(
      raw.occasion * WEIGHTS.occasion +
        raw.weather * WEIGHTS.weather +
        raw.personalStyle * WEIGHTS.personalStyle +
        raw.colorHarmony * WEIGHTS.colorHarmony +
        raw.comfort * WEIGHTS.comfort,
    ) * 100,
  );

  return { breakdown, reasons: buildReasons(breakdown, items, ctx), overall };
}

/**
 * The "why this works" lines. Short, factual, derived from the same numbers as
 * the bars beside them, so the copy can never contradict the score.
 */
function buildReasons(
  breakdown: ScoreBreakdown,
  items: MeasurableItem[],
  ctx: MeasureContext,
): Reason[] {
  const t = Math.round(ctx.temperatureC);
  const occasion = ctx.occasionLabel.toLowerCase();
  const breathableHero = [...items]
    .filter((i) => i.spec.category === "top" || i.spec.category === "layer")
    .sort((a, b) => breathability(b.spec) - breathability(a.spec))[0];

  const distinct = unique(
    items.filter((i) => i.spec.category !== "accessory").map((i) => i.spec.primaryColor),
  );

  return [
    {
      label: "Occasion",
      score: breakdown.occasion,
      text:
        breakdown.occasion >= 85
          ? `Pitched right for ${occasion} — ${ctx.dressCode.toLowerCase()}, not a costume.`
          : breakdown.occasion >= 65
            ? `Works for ${occasion}, slightly off the ideal register.`
            : `A stretch for ${occasion}.`,
    },
    {
      label: "Weather",
      score: breakdown.weather,
      text:
        breakdown.weather >= 85 && breathableHero?.spec.material
          ? `${capitalise(breathableHero.spec.material)} keeps this breathable at ${t}°C.`
          : breakdown.weather >= 85
            ? `Built for ${t}°C — nothing heavier than it needs to be.`
            : breakdown.weather >= 65
              ? `Workable at ${t}°C, though it runs warm.`
              : `${t}°C is pushing it for these fabrics.`,
    },
    {
      label: "Your Style",
      score: breakdown.personalStyle,
      text:
        breakdown.personalStyle >= 85
          ? `Matches your preference for ${ctx.preferredStyles.slice(0, 2).join(" ") || "clean neutrals"}.`
          : `Close to your usual palette, with one new note.`,
    },
    {
      label: "Color Harmony",
      score: breakdown.colorHarmony,
      text:
        breakdown.colorHarmony >= 85
          ? `${distinct.map(capitalise).join(", ")} — a tight, deliberate palette.`
          : `The colours compete a little.`,
    },
    {
      label: "Comfort",
      score: breakdown.comfort,
      text:
        breakdown.comfort >= 85
          ? `Nothing here you'll want to take off after an hour.`
          : breakdown.comfort >= 65
            ? `Comfortable enough for a full evening.`
            : `Style is ahead of comfort on this one.`,
    },
  ];
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export type { Slot };
