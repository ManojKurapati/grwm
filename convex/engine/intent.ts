/**
 * Deterministic intent parsing.
 *
 * Turns "Rooftop date in Dubai tonight. Smart casual. I want to look
 * effortless, not overdressed." into hard constraints the scoring engine can
 * act on. No LLM required — which means the demo cannot fail here.
 */

import {
  clamp,
  DEFAULT_OCCASION,
  DRESS_CODES,
  ENERGIES,
  OCCASIONS,
  unique,
} from "./taxonomy";

export type Intent = {
  occasion: string;
  occasionLabel: string;
  dressCode: string;
  targetFormality: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  city: string;
  keywords: string[];
  styleBias: string[];
  avoidStyles: string[];
};

/** Cities GRWM can resolve without a geocoding round-trip. */
export const KNOWN_CITIES: Record<string, { name: string; country: string; lat: number; lon: number }> = {
  dubai: { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  "abu dhabi": { name: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lon: 54.3773 },
  london: { name: "London", country: "United Kingdom", lat: 51.5072, lon: -0.1276 },
  paris: { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  milan: { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.19 },
  "new york": { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  nyc: { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  "los angeles": { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  tokyo: { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  singapore: { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  mumbai: { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  bengaluru: { name: "Bengaluru", country: "India", lat: 12.9716, lon: 77.5946 },
  bangalore: { name: "Bengaluru", country: "India", lat: 12.9716, lon: 77.5946 },
  delhi: { name: "Delhi", country: "India", lat: 28.6139, lon: 77.209 },
  berlin: { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  barcelona: { name: "Barcelona", country: "Spain", lat: 41.3874, lon: 2.1686 },
  lisbon: { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393 },
  amsterdam: { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  istanbul: { name: "Istanbul", country: "Türkiye", lat: 41.0082, lon: 28.9784 },
  riyadh: { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
  doha: { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.531 },
  "san francisco": { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 },
  sydney: { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
};

/** Occasion detectors, ordered most-specific first. */
const OCCASION_RULES: Array<{ occasion: string; patterns: RegExp[] }> = [
  { occasion: "rooftop-date", patterns: [/rooftop\s+(date|dinner|drinks|bar)/, /rooftop/] },
  { occasion: "client-dinner", patterns: [/client\s+(dinner|lunch|meeting)/, /business\s+dinner/, /investor/, /pitch/] },
  { occasion: "wedding", patterns: [/wedding/, /nikah/, /reception/, /engagement\s+party/] },
  { occasion: "date", patterns: [/\bdate\b/, /first\s+date/, /dinner\s+date/, /\bdrinks\s+with\b/] },
  { occasion: "brunch", patterns: [/brunch/, /breakfast/, /coffee\s+run/, /\bsunday\b/] },
  { occasion: "office", patterns: [/office/, /\bwork\b/, /standup/, /meeting/, /interview/, /presentation/] },
  { occasion: "night-out", patterns: [/night\s+out/, /club/, /party/, /\bbar\b/, /\bgoing\s+out\b/] },
  { occasion: "airport", patterns: [/airport/, /\bflight\b/, /\bflying\b/, /travel\s+day/, /long\s+haul/] },
  { occasion: "gallery", patterns: [/gallery/, /exhibition/, /museum/, /launch\s+event/, /gala/, /\bevent\b/] },
  { occasion: "dinner", patterns: [/dinner/, /restaurant/, /supper/] },
  { occasion: "casual", patterns: [/casual/, /errands/, /chill/, /walk/, /\bmall\b/] },
];

const TIME_RULES: Array<{ time: Intent["timeOfDay"]; patterns: RegExp[] }> = [
  { time: "night", patterns: [/\btonight\b/, /\bnight\b/, /late/, /after\s*hours/] },
  { time: "evening", patterns: [/evening/, /sunset/, /golden\s+hour/, /\b[6-9]\s*pm\b/] },
  { time: "morning", patterns: [/morning/, /\bam\b/, /sunrise/, /early/] },
  { time: "afternoon", patterns: [/afternoon/, /midday/, /lunch/, /\b[1-5]\s*pm\b/] },
];

/** Free-text style signals -> style tags to favour. */
const STYLE_SIGNALS: Array<{ patterns: RegExp[]; tags: string[] }> = [
  { patterns: [/effortless/, /easy/, /nonchalant/, /thrown\s+together/], tags: ["relaxed", "minimal"] },
  { patterns: [/minimal/, /clean/, /simple/, /understated/], tags: ["minimal", "monochrome"] },
  { patterns: [/sharp/, /crisp/, /polished/, /put\s+together/], tags: ["tailored", "sharp"] },
  { patterns: [/statement/, /stand\s+out/, /bold/, /loud/], tags: ["statement"] },
  { patterns: [/comfortable/, /comfy/, /cosy|cozy/], tags: ["comfort", "relaxed"] },
  { patterns: [/all\s*black/, /monochrome/, /blacked\s+out/], tags: ["monochrome"] },
  { patterns: [/mediterranean/, /riviera/, /coastal/, /resort/, /beach/], tags: ["mediterranean", "relaxed"] },
  { patterns: [/street/, /baggy/, /oversized/], tags: ["streetwear", "relaxed"] },
  { patterns: [/elevated/, /expensive/, /luxury/, /quiet\s+luxury/], tags: ["elevated", "minimal"] },
];

/**
 * Signals that cap or lift formality.
 *
 * "Not overdressed" is a *ceiling*, not an instruction to dress down — so it
 * caps the target rather than dragging it, which is what keeps a rooftop date
 * on loafers instead of collapsing onto sneakers.
 */
const FORMALITY_SIGNALS: Array<{ patterns: RegExp[]; shift: number; cap?: number; floor?: number }> = [
  { patterns: [/not\s+overdressed/, /don'?t\s+want\s+to\s+overdo/, /nothing\s+too\s+formal/, /no\s+suit/], shift: -0.15, cap: 7.6 },
  { patterns: [/underdressed/, /need\s+to\s+impress/, /dress\s+up/, /make\s+an\s+effort/], shift: 0.9, floor: 6.5 },
  { patterns: [/effortless/, /relaxed/, /chill/], shift: -0.15 },
  { patterns: [/\bformal\b/, /black\s+tie/], shift: 1.2, floor: 7.5 },
  { patterns: [/\bcomfortable\b/, /\bcomfy\b/], shift: -0.5, cap: 6.5 },
];

function detect<T>(
  text: string,
  rules: Array<{ patterns: RegExp[] } & T>,
): (({ patterns: RegExp[] } & T) | undefined) {
  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(text))) return rule;
  }
  return undefined;
}

function timeOfDayFallback(occasionId: string): Intent["timeOfDay"] {
  const occ = OCCASIONS[occasionId] ?? OCCASIONS[DEFAULT_OCCASION];
  if (occ.timeOfDay === "any") return "afternoon";
  return occ.timeOfDay;
}

export function detectCity(prompt: string): string | undefined {
  const text = prompt.toLowerCase();
  // Prefer an explicit "in <city>" phrasing, then any bare mention.
  const entries = Object.keys(KNOWN_CITIES).sort((a, b) => b.length - a.length);
  for (const key of entries) {
    if (new RegExp(`\\b(?:in|at|to)\\s+${key}\\b`).test(text)) return KNOWN_CITIES[key].name;
  }
  for (const key of entries) {
    if (new RegExp(`\\b${key}\\b`).test(text)) return KNOWN_CITIES[key].name;
  }
  return undefined;
}

export function parseIntent(
  prompt: string,
  options: {
    fallbackCity: string;
    baseFormality: number;
    energy?: string;
  },
): Intent {
  const text = prompt.toLowerCase();

  const occasionRule = detect(text, OCCASION_RULES);
  const occasionId = occasionRule?.occasion ?? DEFAULT_OCCASION;
  const occasion = OCCASIONS[occasionId] ?? OCCASIONS[DEFAULT_OCCASION];

  // Dress code: explicit mention wins, otherwise infer from the occasion.
  let dressCode = "";
  for (const name of Object.keys(DRESS_CODES).sort((a, b) => b.length - a.length)) {
    if (text.includes(name)) {
      dressCode = name;
      break;
    }
  }

  let targetFormality = dressCode
    ? DRESS_CODES[dressCode].formality
    : occasion.formality;

  // Nudge toward the user's resting formality preference (weak pull).
  targetFormality = targetFormality * 0.82 + options.baseFormality * 0.18;

  let cap = 10;
  let floor = 1;
  for (const signal of FORMALITY_SIGNALS) {
    if (signal.patterns.some((p) => p.test(text))) {
      targetFormality += signal.shift;
      if (signal.cap !== undefined) cap = Math.min(cap, signal.cap);
      if (signal.floor !== undefined) floor = Math.max(floor, signal.floor);
    }
  }

  const energy = options.energy ? ENERGIES[options.energy] : undefined;
  if (energy) targetFormality += energy.formalityShift;

  const timeRule = detect(text, TIME_RULES);
  const timeOfDay = timeRule?.time ?? timeOfDayFallback(occasionId);

  // The same event reads dressier after dark.
  if (timeOfDay === "evening" || timeOfDay === "night") targetFormality += 0.35;
  if (timeOfDay === "morning") targetFormality -= 0.2;

  targetFormality = clamp(clamp(targetFormality, floor, cap), 1, 10);

  const styleBias: string[] = [...occasion.styleBias];
  const keywords: string[] = [];
  for (const signal of STYLE_SIGNALS) {
    if (signal.patterns.some((p) => p.test(text))) {
      styleBias.push(...signal.tags);
      keywords.push(...signal.tags);
    }
  }
  // Evening events lean a touch darker/sharper; mornings lean lighter.
  if (timeOfDay === "night" || timeOfDay === "evening") styleBias.push("elevated");
  if (timeOfDay === "morning") styleBias.push("relaxed");

  const avoidStyles: string[] = [];
  if (/not\s+overdressed|nothing\s+too\s+formal/.test(text)) avoidStyles.push("formal");
  if (/no\s+(sneakers|trainers)/.test(text)) avoidStyles.push("athleisure");

  return {
    occasion: occasionId,
    occasionLabel: occasion.label,
    dressCode: dressCode ? DRESS_CODES[dressCode].label : inferDressCodeLabel(targetFormality),
    targetFormality: Math.round(targetFormality * 10) / 10,
    timeOfDay,
    city: detectCity(prompt) ?? options.fallbackCity,
    keywords: unique(keywords),
    styleBias: unique(styleBias),
    avoidStyles: unique(avoidStyles),
  };
}

/**
 * Local currency for a city, used for missing-piece price ceilings.
 * A small lookup rather than a service: the demo cities are known, and getting
 * "AED 299" instead of "$299" in Dubai matters more than exhaustive coverage.
 */
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  Qatar: "QAR",
  "United Kingdom": "GBP",
  France: "EUR",
  Italy: "EUR",
  Germany: "EUR",
  Spain: "EUR",
  Portugal: "EUR",
  Netherlands: "EUR",
  "United States": "USD",
  Japan: "JPY",
  Singapore: "SGD",
  India: "INR",
  "Türkiye": "TRY",
  Australia: "AUD",
};

export function currencyForCity(city: string): string {
  const key = city.trim().toLowerCase();
  const entry =
    KNOWN_CITIES[key] ??
    Object.values(KNOWN_CITIES).find((c) => c.name.toLowerCase() === key);
  if (!entry) return "USD";
  return CURRENCY_BY_COUNTRY[entry.country] ?? "USD";
}

export function inferDressCodeLabel(formality: number): string {
  if (formality >= 9) return "Formal";
  if (formality >= 7.5) return "Business casual";
  if (formality >= 5.5) return "Smart casual";
  if (formality >= 3.5) return "Casual";
  return "Relaxed";
}
