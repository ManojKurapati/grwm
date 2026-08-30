/**
 * Deterministic explanation generation.
 *
 * GRWM never shows chain-of-thought. It shows the decision factors that
 * actually drove the score, phrased like a stylist. Because the copy is
 * assembled from the same numbers the engine computed, the explanation can
 * never contradict the score — and it works with zero LLM calls.
 */

import type { Dimension, EngineContext, EngineProfile, ScoredOutfit } from "./score";
import { isNewCombination, outfitFormality } from "./score";
import { breathability, mean, pct, type Slot, ZODIAC } from "./taxonomy";

export type Reason = { label: string; score: number; text: string };

const DIMENSION_LABELS: Record<Dimension, string> = {
  occasion: "Occasion",
  weather: "Weather",
  personalStyle: "Your Style",
  colorHarmony: "Color Harmony",
  comfort: "Comfort",
  novelty: "Novelty",
  personality: "Mood",
};

function itemBySlot(outfit: ScoredOutfit, slot: Slot) {
  return outfit.slots.find((s) => s.slot === slot)?.item;
}

function lower(s: string) {
  return s.toLowerCase();
}

/** The single most weather-relevant garment, for name-dropping in copy. */
function breathableHero(outfit: ScoredOutfit) {
  return [...outfit.slots]
    .filter((s) => s.slot === "top" || s.slot === "layer")
    .sort((a, b) => breathability(b.item.spec) - breathability(a.item.spec))[0]?.item;
}

function occasionText(outfit: ScoredOutfit, ctx: EngineContext, score: number): string {
  const label = lower(ctx.intent.occasionLabel);
  const formality = outfitFormality(outfit);
  const target = ctx.intent.targetFormality;
  if (score >= 0.9) return `Reads exactly right for ${label} — ${ctx.intent.dressCode.toLowerCase()}, not a costume.`;
  if (formality > target + 0.8) return `Slightly dressier than ${label} needs, but it holds.`;
  if (formality < target - 0.8) return `A touch relaxed for ${label} — the shoes do the lifting.`;
  return `Balanced for ${label} without trying too hard.`;
}

function weatherText(outfit: ScoredOutfit, ctx: EngineContext, score: number): string {
  const hero = breathableHero(outfit);
  const t = Math.round(ctx.weather.temperatureC);
  const material = hero?.spec.material;
  if (score >= 0.85 && material) {
    return `${capitalize(material)} keeps this breathable at ${t}°C.`;
  }
  if (score >= 0.85) return `Built for ${t}°C — nothing heavier than it needs to be.`;
  if (score >= 0.65) return `Workable at ${t}°C, though it runs a little warm.`;
  return `${t}°C is pushing it for these fabrics.`;
}

function styleText(ctx: EngineContext, profile: EngineProfile, score: number): string {
  const styles = profile.preferredStyles.slice(0, 2).join(" ");
  if (score >= 0.85) return `Matches your preference for ${styles || "clean neutrals"}.`;
  if (score >= 0.65) return `Close to your usual ${styles || "palette"}, with one new note.`;
  return `A step outside your usual ${styles || "palette"}.`;
}

function colorText(outfit: ScoredOutfit, score: number): string {
  const colors = outfit.slots
    .filter((s) => s.slot !== "accessory")
    .map((s) => lower(s.item.spec.primaryColor));
  const distinct = Array.from(new Set(colors));
  if (score >= 0.9 && distinct.length <= 3) {
    return `${distinct.map(capitalize).join(", ")} — a tight, deliberate palette.`;
  }
  if (score >= 0.75) return `The palette stays controlled across ${distinct.length} tones.`;
  return `The colours compete a little.`;
}

function comfortText(outfit: ScoredOutfit, ctx: EngineContext, score: number): string {
  if (score >= 0.85) return `Nothing here you'll want to take off after an hour.`;
  if (score >= 0.65) return `Comfortable enough for a full evening.`;
  return `Style is ahead of comfort on this one.`;
}

function moodText(ctx: EngineContext, profile: EngineProfile): string {
  const zodiac = profile.zodiacSign ? ZODIAC[lower(profile.zodiacSign)] : undefined;
  if (ctx.energy && zodiac) {
    return `Tuned to your ${ctx.energy.replace("-", " ")} energy and a ${lower(profile.zodiacSign!)} lean toward ${zodiac.note}.`;
  }
  if (ctx.energy) return `Tuned to your ${ctx.energy.replace("-", " ")} energy.`;
  if (zodiac) return `A ${lower(profile.zodiacSign!)} lean toward ${zodiac.note}.`;
  return `A neutral read on your mood today.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * The five factors GRWM surfaces, always ordered by the weight hierarchy so
 * judges see that occasion and weather lead — never zodiac.
 */
export function buildReasons(
  outfit: ScoredOutfit,
  ctx: EngineContext,
  profile: EngineProfile,
): Reason[] {
  const b = outfit.breakdown;
  const reasons: Reason[] = [
    { label: DIMENSION_LABELS.occasion, score: pct(b.occasion), text: occasionText(outfit, ctx, b.occasion) },
    { label: DIMENSION_LABELS.weather, score: pct(b.weather), text: weatherText(outfit, ctx, b.weather) },
    { label: DIMENSION_LABELS.personalStyle, score: pct(b.personalStyle), text: styleText(ctx, profile, b.personalStyle) },
    { label: DIMENSION_LABELS.colorHarmony, score: pct(b.colorHarmony), text: colorText(outfit, b.colorHarmony) },
    { label: DIMENSION_LABELS.comfort, score: pct(b.comfort), text: comfortText(outfit, ctx, b.comfort) },
  ];

  if (isNewCombination(outfit, ctx)) {
    reasons.push({
      label: "New",
      score: pct(b.novelty),
      text: `You haven't worn this combination before.`,
    });
  }

  reasons.push({ label: DIMENSION_LABELS.personality, score: pct(b.personality), text: moodText(ctx, profile) });

  return reasons;
}

/**
 * A single, concise stylist sentence. Two clauses max — the brief explicitly
 * warns against verbose AI text.
 */
export function buildExplanation(
  outfit: ScoredOutfit,
  ctx: EngineContext,
): string {
  const top = itemBySlot(outfit, "top");
  const bottom = itemBySlot(outfit, "bottom");
  const shoes = itemBySlot(outfit, "shoes");
  const layer = itemBySlot(outfit, "layer");

  const t = Math.round(ctx.weather.temperatureC);
  const place = ctx.weather.city ? `${ctx.weather.city} ` : "";
  const period = periodWord(ctx);
  const occasion = occasionPhrase(ctx);

  const fabric = top?.spec.material ? lower(top.spec.material) : undefined;
  const topName = top ? lower(top.name) : "the top";
  const bottomName = bottom ? lower(bottom.name) : "the trousers";
  const shoesName = shoes ? lower(shoes.name) : "the shoes";

  // Clause 1 — why it survives the weather.
  const first = fabric
    ? `The ${fabric} ${top?.spec.subcategory ?? "top"} keeps this breathable for a ${t}°C ${place}${period}`
    : `The ${topName} sets a clean base for a ${t}°C ${place}${period}`;

  // Clause 2 — why it lands the occasion.
  const anchor = layer
    ? `${bottomName}, ${shoesName} and the ${lower(layer.name)}`
    : `${bottomName} and ${shoesName}`;
  const verb = outfit.breakdown.occasion >= 0.85 ? "lift it just enough for" : "keep it grounded for";
  const tail =
    ctx.intent.targetFormality >= 7.5
      ? `${verb} ${occasion}.`
      : `${verb} ${occasion} without tipping into formal.`;

  return tidy(`${first}, while the ${anchor} ${tail}`);
}

/** "evening" / "morning" / "afternoon" / "day" — never hardcoded. */
function periodWord(ctx: EngineContext): string {
  switch (ctx.intent.timeOfDay) {
    case "morning":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "evening":
      return "evening";
    case "night":
      return "evening";
    default:
      return "day";
  }
}

/** Occasion labels need different articles: "brunch" vs "a night out". */
const NO_ARTICLE = new Set(["brunch", "office", "wedding"]);

function occasionPhrase(ctx: EngineContext): string {
  const occasion = lower(ctx.intent.occasionLabel);
  if (NO_ARTICLE.has(occasion)) return occasion;
  if (occasion === "casual day") return "an easy day";
  return `${aOrAn(occasion)} ${occasion}`;
}

function aOrAn(word: string): string {
  return /^[aeiou]/.test(word) ? "an" : "a";
}

function tidy(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
}

export function averageBreathability(outfit: ScoredOutfit): number {
  return mean(outfit.slots.map((s) => breathability(s.item.spec)));
}
