/**
 * ============================================================================
 *  Gemini — the stylist
 * ============================================================================
 *
 * This is where taste lives. Gemini makes the aesthetic judgements that we
 * deliberately do NOT try to encode as rules:
 *
 *   1. `chooseOutfit`     — pick the best outfit from what the user owns,
 *                           and decide whether a real wardrobe gap exists
 *   2. `analyzeGarment`   — read an uploaded photo into structured metadata
 *   3. `rankProducts`     — judge which live product best complements the
 *                           wardrobe
 *
 * What deterministic code still owns
 * ----------------------------------
 * Gemini is not trusted with correctness, only with taste. Around every call:
 *
 *   · the candidate set is pre-filtered — unavailable garments never reach it
 *   · every response is validated against a Zod schema before use
 *   · returned item ids are checked against the ids we actually sent, so a
 *     hallucinated garment cannot enter an outfit
 *   · hard constraints (price ceilings, slot completeness) are enforced in code
 *   · every function returns `null` on any failure, and each caller keeps its
 *     deterministic fallback in `engine/`
 *
 * We ask for a short decision summary, never chain-of-thought.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

/**
 * Model choice, learned the hard way:
 *
 *   gemini-2.5-flash    404s for keys created after its cutoff
 *   gemini-3.7-flash    503s under load at time of writing
 *   gemini-3.6-flash    works, but burned through our quota fastest (429) and
 *                       routinely took 15-20s, which read as a hang on stage
 *   gemini-3.5-flash    the default: reliable, ~8s, good judgement
 *   gemini-3.5-flash-lite  ~1.4s if you need speed over nuance
 *
 * Why a chain rather than one model: the free tier meters requests *per model
 * per day* (20 at time of writing), so a busy afternoon of demos exhausts the
 * preferred model and returns 429 for everything after. Falling forward to the
 * next model buys a fresh allowance and keeps Gemini — not the deterministic
 * engine — driving the recommendation. Order is preference, not capability.
 *
 * GEMINI_MODEL, if set, takes priority over the whole chain.
 */
const MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
];
const DEFAULT_TIMEOUT_MS = 20_000;

function models(): string[] {
  const override = process.env.GEMINI_MODEL;
  if (!override) return MODEL_CHAIN;
  // Keep the rest of the chain as backup behind an explicit override.
  return [override, ...MODEL_CHAIN.filter((m) => m !== override)];
}

/**
 * Worth trying the next model, or is this our own fault?
 *
 * Quota (429) and capacity (503) are properties of the model we happened to
 * pick, so another model may well succeed. A malformed prompt or a bad key will
 * fail identically everywhere, so retrying just adds latency before the
 * fallback the caller already has.
 */
function isModelUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|503)\b|RESOURCE_EXHAUSTED|UNAVAILABLE|deadline|abort|timeout/i.test(
    message,
  );
}

/** Is a live stylist configured on this deployment? */
export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

/**
 * One structured Gemini call, validated twice: once by the API against
 * `responseSchema`, then again locally by Zod because `responseSchema` is a
 * strong hint rather than a hard guarantee.
 *
 * Returns `null` on every failure path — no key, network error, timeout,
 * non-JSON body, schema violation. Callers must always have a fallback.
 */
async function structured<T>(
  parts: Part[],
  responseSchema: Record<string, unknown>,
  schema: z.ZodType<T>,
  label: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const chain = models();

  for (const [index, name] of chain.entries()) {
    const last = index === chain.length - 1;
    let text: string | undefined;

    try {
      const response = await ai.models.generateContent({
        model: name,
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.7,
          abortSignal: AbortSignal.timeout(timeoutMs),
        },
      });
      text = response.text;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";
      if (!last && isModelUnavailable(error)) {
        console.warn(`[gemini:${label}] ${name} unavailable — trying ${chain[index + 1]}`);
        continue;
      }
      console.warn(`[gemini:${label}] request failed on ${name} — falling back:`, reason);
      return null;
    }

    if (!text) {
      if (!last) {
        console.warn(`[gemini:${label}] ${name} returned nothing — trying ${chain[index + 1]}`);
        continue;
      }
      console.warn(`[gemini:${label}] empty response — falling back`);
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn(`[gemini:${label}] non-JSON response from ${name} — falling back`);
      return null;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[gemini:${label}] schema violation from ${name} (` +
          `${result.error.issues.map((i) => i.path.join(".") || "root").join(", ")}) — falling back`,
      );
      return null;
    }

    if (index > 0) console.log(`[gemini:${label}] served by ${name}`);
    return result.data;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

/** What the stylist may ask us to go and find on the open web. */
export const MissingPieceSchema = z.object({
  productType: z.string().min(2).max(60),
  reason: z.string().min(10).max(240),
  attributes: z.array(z.string().min(1).max(30)).min(1).max(6),
  maxPrice: z.number().positive().max(100_000),
  currency: z.string().length(3),
});

export type MissingPiece = z.infer<typeof MissingPieceSchema>;

const OutfitChoiceSchema = z.object({
  selectedItemIds: z.array(z.string()).min(2).max(6),
  overallScore: z.number().min(0).max(100),
  reasoningSummary: z.string().min(20).max(400),
  missingPiece: MissingPieceSchema.nullable(),
});

export type OutfitChoice = z.infer<typeof OutfitChoiceSchema>;

const missingPieceResponseSchema = {
  type: Type.OBJECT,
  nullable: true,
  description:
    "A genuine wardrobe gap, or null if the wardrobe already handles this well.",
  properties: {
    productType: {
      type: Type.STRING,
      description: 'Specific searchable garment, e.g. "brown suede loafers".',
    },
    reason: {
      type: Type.STRING,
      description: "One sentence on why this raises the look and what it unlocks.",
    },
    attributes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Search facets, e.g. ["brown", "suede", "minimal"].',
    },
    maxPrice: { type: Type.NUMBER, description: "Sensible ceiling in the given currency." },
    currency: { type: Type.STRING, description: "ISO 4217 code, e.g. AED." },
  },
  required: ["productType", "reason", "attributes", "maxPrice", "currency"],
};

// ---------------------------------------------------------------------------
// 1. Outfit selection — the core judgement
// ---------------------------------------------------------------------------

const STYLIST_PROMPT = `You are a precise, opinionated personal stylist.

Choose the single best outfit for the situation using ONLY the wardrobe items given.

Hard rules:
- Use ONLY ids from the WARDROBE list. Never invent an id or a garment.
- Include exactly one top, one bottom and one pair of shoes.
- Add a layer and/or accessories ONLY if they genuinely improve the look and
  suit the temperature. In real heat, do not add layers.
- Respect the occasion's formality and the weather. Comfort in heat matters more
  than looking dressed up.
- overallScore is 0-100: how well this outfit serves THIS occasion and weather.
  Be honest and discriminating. 90+ means you would struggle to improve it with
  what is available.
- reasoningSummary: 2-3 sentences, confident and concrete, addressed to the
  wearer as "you". Name the actual pieces. No emoji, no exclamation marks, no
  "elevate your look" filler. Do not explain your selection process or list
  alternatives you rejected.

missingPiece:
- Set it to null if the wardrobe genuinely handles this occasion well.
- Otherwise identify ONE piece whose absence is actually limiting this outfit,
  and which would unlock meaningfully more combinations. Be specific and
  searchable. Do not suggest something the user effectively already owns.
- Price the ceiling sensibly for the stated currency and the user's other items.`;

export type StylistItem = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  primaryColor: string;
  material?: string;
  formalityScore: number;
  styleTags: string[];
  weatherTags: string[];
  wearCount: number;
};

export type StylistContext = {
  prompt: string;
  city: string;
  temperatureC: number;
  condition: string;
  weatherSummary: string;
  occasionLabel: string;
  dressCode: string;
  timeOfDay: string;
  energy?: string;
  currency: string;
  preferredStyles: string[];
  avoidColors: string[];
};

/** Compact one-line-per-garment rendering. Cheaper and far more legible to the
 *  model than raw JSON, and it keeps ids visually adjacent to their garment. */
function renderWardrobe(items: StylistItem[]): string {
  return items
    .map((item) => {
      const bits = [
        item.primaryColor,
        item.material,
        `formality ${item.formalityScore}/10`,
        item.styleTags.slice(0, 4).join("/"),
        `good in ${item.weatherTags.join("/") || "any weather"}`,
        item.wearCount === 0 ? "never worn" : `worn ${item.wearCount}x`,
      ].filter(Boolean);
      return `${item.id} | ${item.category} | ${item.name} — ${bits.join(", ")}`;
    })
    .join("\n");
}

/**
 * Ask Gemini to style the user.
 *
 * `items` must already be filtered to what is actually wearable — this function
 * trusts its input and only guards its output. Any id Gemini returns that we
 * did not send is dropped, and if that leaves an incomplete outfit the whole
 * result is rejected so the deterministic engine can take over.
 */
export async function chooseOutfit(
  items: StylistItem[],
  context: StylistContext,
): Promise<OutfitChoice | null> {
  if (!hasGemini() || items.length === 0) return null;

  const situation = [
    `The user said: "${context.prompt}"`,
    `Occasion: ${context.occasionLabel} · ${context.dressCode} · ${context.timeOfDay}`,
    `Where: ${context.city}`,
    `Weather: ${Math.round(context.temperatureC)}°C, ${context.condition} (${context.weatherSummary})`,
    context.energy ? `Energy they asked for: ${context.energy}` : null,
    context.preferredStyles.length > 0
      ? `They usually like: ${context.preferredStyles.join(", ")}`
      : null,
    context.avoidColors.length > 0
      ? `They avoid these colours: ${context.avoidColors.join(", ")}`
      : null,
    `Currency for any price ceiling: ${context.currency}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await structured(
    [
      { text: STYLIST_PROMPT },
      { text: `SITUATION\n${situation}\n\nWARDROBE\n${renderWardrobe(items)}` },
    ],
    {
      type: Type.OBJECT,
      properties: {
        selectedItemIds: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Wardrobe ids for the chosen outfit, in the order worn.",
        },
        overallScore: {
          type: Type.NUMBER,
          description: "0-100 integer. How well this outfit serves the occasion and weather.",
        },
        reasoningSummary: {
          type: Type.STRING,
          description: "2-3 sentences to the wearer. A decision summary, not reasoning steps.",
        },
        missingPiece: missingPieceResponseSchema,
      },
      required: ["selectedItemIds", "overallScore", "reasoningSummary", "missingPiece"],
    },
    OutfitChoiceSchema,
    "chooseOutfit",
    // Generous on purpose. This is the one call the whole demo depends on, and
    // aborting it silently demotes the product's core claim to the fallback.
    45_000,
  );

  if (!result) return null;

  // --- guard the output ---------------------------------------------------
  // A hallucinated id must never reach the database.
  const known = new Map(items.map((item) => [item.id, item]));
  const selected = result.selectedItemIds.filter((id) => known.has(id));

  if (selected.length !== result.selectedItemIds.length) {
    console.warn(
      `[gemini:chooseOutfit] dropped ${result.selectedItemIds.length - selected.length} unknown id(s)`,
    );
  }

  // Deduplicate, and refuse more than one garment per core slot.
  const seen = new Set<string>();
  const bySlot = new Set<string>();
  const clean: string[] = [];
  for (const id of selected) {
    if (seen.has(id)) continue;
    const category = known.get(id)!.category;
    if (category !== "accessory") {
      if (bySlot.has(category)) continue;
      bySlot.add(category);
    }
    seen.add(id);
    clean.push(id);
  }

  // An outfit without a top, bottom and shoes is not an outfit.
  for (const required of ["top", "bottom", "shoes"]) {
    if (!bySlot.has(required)) {
      console.warn(`[gemini:chooseOutfit] no ${required} in selection — falling back`);
      return null;
    }
  }

  return {
    ...result,
    selectedItemIds: clean,
    overallScore: Math.round(result.overallScore),
  };
}

// ---------------------------------------------------------------------------
// 2. Vision — read an uploaded garment
// ---------------------------------------------------------------------------

const CATEGORIES = ["top", "bottom", "shoes", "layer", "accessory"] as const;

export const GarmentAnalysisSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.enum(CATEGORIES),
  subcategory: z.string().min(1).max(40),
  primaryColor: z.string().min(1).max(24),
  secondaryColors: z.array(z.string().max(24)).max(3).default([]),
  material: z.string().max(40).optional(),
  pattern: z.string().max(24).optional(),
  styleTags: z.array(z.string().max(24)).min(1).max(6),
  formalityScore: z.number().min(1).max(10),
  seasonTags: z.array(z.string().max(16)).max(4),
  weatherTags: z.array(z.string().max(16)).max(5),
  occasionTags: z.array(z.string().max(24)).max(8),
  description: z.string().min(1).max(240),
});

export type GarmentAnalysis = z.infer<typeof GarmentAnalysisSchema>;

const CATALOGUE_PROMPT = `You are a fashion cataloguer. Describe the single garment in this photo.

- category: exactly one of top, bottom, shoes, layer, accessory
  ("layer" = anything worn over a top: jacket, blazer, overshirt, cardigan, coat)
- primaryColor: one plain colour word, preferably from: black, charcoal, grey,
  light grey, white, off-white, cream, ecru, beige, sand, taupe, camel, tan,
  brown, chocolate, navy, denim, light blue, blue, olive, green, teal, burgundy,
  rust, red, orange, yellow, pink, purple, silver, gold
- formalityScore: 1 = gym clothes, 5 = smart casual, 8 = business, 10 = black tie
- seasonTags from: spring, summer, autumn, winter, all-season
- weatherTags from: hot, warm, mild, cool, cold, rain
- occasionTags from: date, rooftop-date, dinner, client-dinner, brunch, office,
  night-out, airport, casual, wedding, gallery
- styleTags: short lowercase descriptors such as minimal, relaxed, tailored,
  elevated, monochrome, streetwear, smart casual, mediterranean, comfort
- description: one concrete, unfussy sentence under 200 characters.

Describe only what you can actually see. Do not guess at a brand.`;

const garmentResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    category: { type: Type.STRING, enum: [...CATEGORIES] },
    subcategory: { type: Type.STRING },
    primaryColor: { type: Type.STRING },
    secondaryColors: { type: Type.ARRAY, items: { type: Type.STRING } },
    material: { type: Type.STRING },
    pattern: { type: Type.STRING },
    styleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    formalityScore: { type: Type.NUMBER },
    seasonTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    weatherTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    occasionTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    description: { type: Type.STRING },
  },
  required: [
    "name",
    "category",
    "subcategory",
    "primaryColor",
    "styleTags",
    "formalityScore",
    "description",
  ],
};

/**
 * Catalogue an uploaded garment photo.
 * Returns `null` when unconfigured or unreadable, in which case the caller keeps
 * its user-editable placeholder attributes.
 */
export async function analyzeGarment(
  image: { data: string; mimeType: string },
): Promise<GarmentAnalysis | null> {
  return await structured(
    [
      { text: CATALOGUE_PROMPT },
      { inlineData: { mimeType: image.mimeType, data: image.data } },
    ],
    garmentResponseSchema,
    GarmentAnalysisSchema,
    "analyzeGarment",
  );
}

// ---------------------------------------------------------------------------
// 3. Product evaluation — judge live candidates against the wardrobe
// ---------------------------------------------------------------------------

const VerdictSchema = z.object({
  /** Index into the candidate array we sent. */
  bestIndex: z.number().int().min(0),
  compatibilityScore: z.number().min(0).max(100),
  why: z.string().min(20).max(400),
  outfitsUnlocked: z.number().int().min(0).max(200),
  meaningfullyExpands: z.boolean(),
  runnerUpIndex: z.number().int().min(0).nullable(),
});

export type ProductVerdict = z.infer<typeof VerdictSchema> & {
  /** Resolved from `bestIndex` so callers never touch raw indices. */
  bestCandidate: StylistProduct;
};

export type StylistProduct = {
  name: string;
  retailer: string;
  price: number | null;
  currency: string | null;
  description: string;
  url: string;
};

const EVALUATOR_PROMPT = `You are advising someone on whether a purchase earns its place in their wardrobe.

You are given a wardrobe, the gap they are trying to fill, and real products
currently on sale.

Pick the ONE product that best complements what they already own.

- compatibilityScore is 0-100: how well the winner works with the existing
  wardrobe. Be sceptical. A product that only pairs with one or two things
  should score below 50.
- outfitsUnlocked: a realistic count of genuinely new, wearable combinations
  this piece creates. Do not inflate this.
- meaningfullyExpands: false if they effectively already own something that does
  this job, or if it only works with one outfit.
- why: 2-3 sentences to the wearer, naming specific pieces of theirs it works
  with. No emoji, no exclamation marks, no marketing language.
- runnerUpIndex: the second-best option, or null if there isn't a credible one.

Judge on colour, material, formality and versatility against their wardrobe —
not on brand prestige or price.`;

/**
 * Rank live product candidates against the wardrobe.
 *
 * Price ceilings are NOT enforced here — callers filter on price in code before
 * calling, because a model is the wrong place to enforce a hard constraint.
 */
export async function rankProducts(
  candidates: StylistProduct[],
  wardrobe: StylistItem[],
  gap: { productType: string; reason: string },
): Promise<ProductVerdict | null> {
  if (!hasGemini() || candidates.length === 0) return null;

  const rendered = candidates
    .map((product, index) => {
      const price =
        product.price !== null
          ? `${product.currency ?? ""} ${product.price}`.trim()
          : "price unknown";
      return `[${index}] ${product.name} — ${product.retailer}, ${price}\n    ${product.description.slice(0, 300)}`;
    })
    .join("\n");

  const result = await structured(
    [
      { text: EVALUATOR_PROMPT },
      {
        text:
          `THE GAP\n${gap.productType} — ${gap.reason}\n\n` +
          `THEIR WARDROBE\n${renderWardrobe(wardrobe)}\n\n` +
          `PRODUCTS ON SALE NOW\n${rendered}`,
      },
    ],
    {
      type: Type.OBJECT,
      properties: {
        bestIndex: {
          type: Type.NUMBER,
          description: "Index of the winning product from the list given.",
        },
        compatibilityScore: { type: Type.NUMBER, description: "0-100." },
        why: { type: Type.STRING, description: "2-3 sentences to the wearer." },
        outfitsUnlocked: { type: Type.NUMBER, description: "Realistic count of new outfits." },
        meaningfullyExpands: { type: Type.BOOLEAN },
        runnerUpIndex: { type: Type.NUMBER, nullable: true },
      },
      required: [
        "bestIndex",
        "compatibilityScore",
        "why",
        "outfitsUnlocked",
        "meaningfullyExpands",
        "runnerUpIndex",
      ],
    },
    VerdictSchema,
    "rankProducts",
    // Deliberately longer than the default: this prompt carries the whole
    // wardrobe plus every candidate, and it runs after a slow extraction, so a
    // tight timeout here silently demotes a good verdict to the fallback.
    35_000,
  );

  if (!result) return null;

  // An out-of-range index means we cannot trust the verdict it belongs to.
  if (result.bestIndex >= candidates.length) {
    console.warn(
      `[gemini:rankProducts] bestIndex ${result.bestIndex} out of range (${candidates.length}) — falling back`,
    );
    return null;
  }

  return {
    ...result,
    compatibilityScore: Math.round(result.compatibilityScore),
    runnerUpIndex:
      result.runnerUpIndex !== null && result.runnerUpIndex < candidates.length
        ? result.runnerUpIndex
        : null,
    bestCandidate: candidates[result.bestIndex],
  };
}
