/**
 * Shared fashion taxonomy for the Wardrobe Intelligence Engine.
 *
 * Everything here is deterministic, dependency-free and unit-testable. The
 * engine never asks a language model what a colour is or whether linen is
 * breathable — those are facts, so we encode them.
 */

export type Slot = "top" | "bottom" | "shoes" | "layer" | "accessory";

export const SLOTS: Slot[] = ["top", "bottom", "shoes", "layer", "accessory"];

/** Slots an outfit must fill to be valid. */
export const REQUIRED_SLOTS: Slot[] = ["top", "bottom", "shoes"];

export type GarmentSpec = {
  category: string;
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  material?: string;
  pattern?: string;
  styleTags: string[];
  formalityScore: number;
  seasonTags: string[];
  weatherTags: string[];
  occasionTags: string[];
};

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

export type ColorFamily = "neutral" | "warm" | "cool" | "statement";

/** Colour -> family + a hex swatch used by the UI. */
export const COLORS: Record<
  string,
  { family: ColorFamily; hex: string; darkness: number }
> = {
  black: { family: "neutral", hex: "#141414", darkness: 0.96 },
  charcoal: { family: "neutral", hex: "#33363a", darkness: 0.82 },
  grey: { family: "neutral", hex: "#8d8f92", darkness: 0.48 },
  "light grey": { family: "neutral", hex: "#c9cacb", darkness: 0.22 },
  white: { family: "neutral", hex: "#fbfbf9", darkness: 0.03 },
  "off-white": { family: "neutral", hex: "#f2efe7", darkness: 0.07 },
  cream: { family: "neutral", hex: "#ece3d2", darkness: 0.12 },
  ecru: { family: "neutral", hex: "#e4dac6", darkness: 0.16 },
  beige: { family: "neutral", hex: "#d9c9ae", darkness: 0.24 },
  sand: { family: "neutral", hex: "#d5c3a1", darkness: 0.26 },
  taupe: { family: "neutral", hex: "#b5a48f", darkness: 0.36 },
  camel: { family: "warm", hex: "#b98d5a", darkness: 0.44 },
  tan: { family: "warm", hex: "#c39a6b", darkness: 0.4 },
  brown: { family: "warm", hex: "#6b4a31", darkness: 0.7 },
  chocolate: { family: "warm", hex: "#4a3324", darkness: 0.8 },
  navy: { family: "neutral", hex: "#1f2a3c", darkness: 0.86 },
  denim: { family: "cool", hex: "#4a6785", darkness: 0.6 },
  "light blue": { family: "cool", hex: "#a9c1d6", darkness: 0.28 },
  blue: { family: "cool", hex: "#3a5f92", darkness: 0.64 },
  olive: { family: "warm", hex: "#6b6b45", darkness: 0.62 },
  green: { family: "cool", hex: "#3f5f47", darkness: 0.68 },
  teal: { family: "cool", hex: "#2f6f6b", darkness: 0.64 },
  burgundy: { family: "warm", hex: "#5c2230", darkness: 0.78 },
  rust: { family: "warm", hex: "#9c5230", darkness: 0.6 },
  red: { family: "statement", hex: "#a02c2c", darkness: 0.62 },
  orange: { family: "statement", hex: "#c96a2b", darkness: 0.52 },
  yellow: { family: "statement", hex: "#d8b44a", darkness: 0.3 },
  pink: { family: "statement", hex: "#d99aa6", darkness: 0.32 },
  purple: { family: "statement", hex: "#5f4472", darkness: 0.7 },
  silver: { family: "neutral", hex: "#c4c6c9", darkness: 0.24 },
  gold: { family: "warm", hex: "#c2a24d", darkness: 0.4 },
  multicolour: { family: "statement", hex: "#9a8f84", darkness: 0.45 },
};

export function colorInfo(color: string) {
  const key = color.trim().toLowerCase();
  return (
    COLORS[key] ?? { family: "neutral" as ColorFamily, hex: "#a8a29a", darkness: 0.4 }
  );
}

export function colorFamily(color: string): ColorFamily {
  return colorInfo(color).family;
}

export function isNeutral(color: string): boolean {
  return colorFamily(color) === "neutral";
}

/**
 * Earth tones behave like neutrals in a wardrobe even though they sit in the
 * "warm" family for clash detection. Brown loafers go with everything; that is
 * the entire reason they are a wardrobe staple. Harmony scoring still needs
 * them classed as warm, so this is a deliberately separate predicate.
 */
const EARTH_NEUTRALS = new Set(["brown", "chocolate", "camel", "tan", "olive"]);

export function isWardrobeNeutral(color: string): boolean {
  const key = color.trim().toLowerCase();
  return isNeutral(key) || EARTH_NEUTRALS.has(key);
}

/** Pairs that read as deliberately styled rather than accidental. */
const HERO_PAIRS: Array<[string, string]> = [
  ["cream", "black"],
  ["cream", "navy"],
  ["cream", "brown"],
  ["white", "black"],
  ["white", "navy"],
  ["white", "denim"],
  ["beige", "white"],
  ["beige", "black"],
  ["black", "brown"],
  ["navy", "brown"],
  ["olive", "cream"],
  ["grey", "black"],
  ["charcoal", "cream"],
];

export function isHeroPair(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return HERO_PAIRS.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
}

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

export type WeatherBand = "hot" | "warm" | "mild" | "cool" | "cold";

export const WEATHER_BANDS: WeatherBand[] = [
  "cold",
  "cool",
  "mild",
  "warm",
  "hot",
];

export function bandFromTemperature(temperatureC: number): WeatherBand {
  if (temperatureC >= 30) return "hot";
  if (temperatureC >= 23) return "warm";
  if (temperatureC >= 16) return "mild";
  if (temperatureC >= 8) return "cool";
  return "cold";
}

/** Distance between two bands on the 5-point scale, 0 = same. */
export function bandDistance(a: string, b: string): number {
  const i = WEATHER_BANDS.indexOf(a as WeatherBand);
  const j = WEATHER_BANDS.indexOf(b as WeatherBand);
  if (i < 0 || j < 0) return 2;
  return Math.abs(i - j);
}

/** How breathable a fabric is: 1 = linen in the desert, 0 = shearling. */
export const MATERIAL_BREATHABILITY: Record<string, number> = {
  linen: 1,
  "linen blend": 0.92,
  cotton: 0.8,
  poplin: 0.82,
  "cotton twill": 0.66,
  oxford: 0.68,
  chambray: 0.78,
  silk: 0.74,
  viscose: 0.72,
  tencel: 0.76,
  jersey: 0.7,
  denim: 0.45,
  canvas: 0.5,
  leather: 0.3,
  suede: 0.34,
  wool: 0.28,
  "merino wool": 0.42,
  tweed: 0.16,
  cashmere: 0.24,
  fleece: 0.12,
  down: 0.05,
  nylon: 0.4,
  polyester: 0.42,
  metal: 0.6,
};

export function breathability(spec: GarmentSpec): number {
  if (!spec.material) return 0.6;
  const key = spec.material.trim().toLowerCase();
  if (MATERIAL_BREATHABILITY[key] !== undefined) {
    return MATERIAL_BREATHABILITY[key];
  }
  // partial match, e.g. "washed linen"
  for (const [name, value] of Object.entries(MATERIAL_BREATHABILITY)) {
    if (key.includes(name)) return value;
  }
  return 0.6;
}

// ---------------------------------------------------------------------------
// Occasions
// ---------------------------------------------------------------------------

export type OccasionDef = {
  id: string;
  label: string;
  /** ideal formality on the 1..10 scale */
  formality: number;
  /** acceptable spread around `formality` before it feels wrong */
  tolerance: number;
  styleBias: string[];
  timeOfDay: "morning" | "afternoon" | "evening" | "any";
};

export const OCCASIONS: Record<string, OccasionDef> = {
  date: {
    id: "date",
    label: "Date",
    formality: 6,
    tolerance: 2,
    styleBias: ["minimal", "smart casual", "elevated", "tailored"],
    timeOfDay: "evening",
  },
  "rooftop-date": {
    id: "rooftop-date",
    label: "Rooftop date",
    formality: 6.5,
    tolerance: 1.6,
    styleBias: ["minimal", "smart casual", "elevated", "mediterranean"],
    timeOfDay: "evening",
  },
  dinner: {
    id: "dinner",
    label: "Dinner",
    formality: 6.5,
    tolerance: 2,
    styleBias: ["smart casual", "elevated", "minimal"],
    timeOfDay: "evening",
  },
  "client-dinner": {
    id: "client-dinner",
    label: "Client dinner",
    formality: 8,
    tolerance: 1.5,
    styleBias: ["tailored", "sharp", "minimal", "business casual"],
    timeOfDay: "evening",
  },
  brunch: {
    id: "brunch",
    label: "Brunch",
    formality: 4.5,
    tolerance: 2,
    styleBias: ["relaxed", "minimal", "mediterranean", "smart casual"],
    timeOfDay: "morning",
  },
  office: {
    id: "office",
    label: "Office",
    formality: 7,
    tolerance: 2,
    styleBias: ["business casual", "tailored", "minimal"],
    timeOfDay: "morning",
  },
  "night-out": {
    id: "night-out",
    label: "Night out",
    formality: 6,
    tolerance: 2.5,
    styleBias: ["statement", "sharp", "monochrome", "elevated"],
    timeOfDay: "evening",
  },
  airport: {
    id: "airport",
    label: "Airport",
    formality: 3.5,
    tolerance: 2,
    styleBias: ["relaxed", "comfort", "minimal", "athleisure"],
    timeOfDay: "any",
  },
  casual: {
    id: "casual",
    label: "Casual day",
    formality: 3.5,
    tolerance: 2.5,
    styleBias: ["relaxed", "minimal", "streetwear"],
    timeOfDay: "any",
  },
  wedding: {
    id: "wedding",
    label: "Wedding",
    formality: 9,
    tolerance: 1.2,
    styleBias: ["tailored", "formal", "elevated"],
    timeOfDay: "afternoon",
  },
  gallery: {
    id: "gallery",
    label: "Gallery / event",
    formality: 6.5,
    tolerance: 2,
    styleBias: ["minimal", "statement", "monochrome", "elevated"],
    timeOfDay: "evening",
  },
};

export const DEFAULT_OCCASION = "casual";

// ---------------------------------------------------------------------------
// Dress codes
// ---------------------------------------------------------------------------

export const DRESS_CODES: Record<string, { formality: number; label: string }> = {
  casual: { formality: 3.5, label: "Casual" },
  "smart casual": { formality: 6.6, label: "Smart casual" },
  "business casual": { formality: 7, label: "Business casual" },
  formal: { formality: 9, label: "Formal" },
  "black tie": { formality: 10, label: "Black tie" },
  athleisure: { formality: 2, label: "Athleisure" },
};

// ---------------------------------------------------------------------------
// Personality / energy
// ---------------------------------------------------------------------------

export const ENERGIES: Record<
  string,
  { label: string; styleBias: string[]; formalityShift: number; contrast: number }
> = {
  "main-character": {
    label: "Main Character",
    styleBias: ["statement", "elevated", "sharp"],
    formalityShift: 0.7,
    contrast: 0.8,
  },
  clean: {
    label: "Clean",
    styleBias: ["minimal", "monochrome", "tailored"],
    formalityShift: 0.3,
    contrast: 0.2,
  },
  dangerous: {
    label: "Dangerous",
    styleBias: ["monochrome", "sharp", "statement"],
    formalityShift: 0.2,
    contrast: 0.9,
  },
  "low-key": {
    label: "Low-key",
    styleBias: ["relaxed", "minimal", "comfort"],
    formalityShift: -0.8,
    contrast: 0.15,
  },
  serious: {
    label: "Serious",
    styleBias: ["tailored", "business casual", "minimal"],
    formalityShift: 1.1,
    contrast: 0.3,
  },
  surprise: {
    label: "Surprise Me",
    styleBias: [],
    formalityShift: 0,
    contrast: 0.5,
  },
};

/**
 * Zodiac as a *lightweight* personality modifier — it can only nudge style tag
 * preference and never overrides weather, occasion or availability. Worth ~5%.
 */
export const ZODIAC: Record<string, { styleBias: string[]; note: string }> = {
  aries: { styleBias: ["statement", "sharp"], note: "bold lines" },
  taurus: { styleBias: ["minimal", "comfort"], note: "tactile neutrals" },
  gemini: { styleBias: ["relaxed", "statement"], note: "playful contrast" },
  cancer: { styleBias: ["comfort", "relaxed"], note: "soft layers" },
  leo: { styleBias: ["statement", "elevated"], note: "a little drama" },
  virgo: { styleBias: ["minimal", "tailored"], note: "precise tailoring" },
  libra: { styleBias: ["elevated", "minimal"], note: "balanced proportions" },
  scorpio: { styleBias: ["monochrome", "sharp"], note: "dark monochrome" },
  sagittarius: { styleBias: ["relaxed", "mediterranean"], note: "easy movement" },
  capricorn: { styleBias: ["tailored", "monochrome"], note: "structured restraint" },
  aquarius: { styleBias: ["statement", "streetwear"], note: "an off-beat detail" },
  pisces: { styleBias: ["relaxed", "comfort"], note: "fluid fabrics" },
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Jaccard-ish overlap that rewards any hit but saturates gracefully. */
export function tagOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b.map((t) => t.toLowerCase()));
  let hits = 0;
  for (const tag of a) if (setB.has(tag.toLowerCase())) hits += 1;
  if (hits === 0) return 0;
  return clamp01(hits / Math.min(a.length, b.length));
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function round(n: number, dp = 0): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function pct(n01: number): number {
  return Math.round(clamp01(n01) * 100);
}
