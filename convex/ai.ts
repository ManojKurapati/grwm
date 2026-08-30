/**
 * ============================================================================
 *  The optional AI layer
 * ============================================================================
 *
 * GRWM's decisions are made by the deterministic engine, not by a language
 * model. This module is strictly additive, and it has two jobs:
 *
 *   1. `analyzeGarment`  — read an uploaded photo into a structured GarmentAnalysis
 *   2. `polishExplanation` — rewrite the engine's sentence in a warmer voice
 *
 * Both return `null` when no model is configured, and every caller has a real
 * fallback path. That is why the demo works with zero LLM credentials.
 *
 * All model output is validated against a Zod schema before it is allowed
 * anywhere near application logic — we never parse prose, and a malformed
 * response degrades to the deterministic result instead of throwing.
 */

import { z } from "zod";
import type { EngineContext, ScoredOutfit } from "./engine/score";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 12_000;

function model(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

export function hasModel(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

// ---------------------------------------------------------------------------
// Schemas — the contract between the model and the application
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

const ExplanationSchema = z.object({
  /** One or two sentences. Hard-capped so the UI layout can't be broken. */
  explanation: z.string().min(20).max(260),
});

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

type ChatMessage = {
  role: "system" | "user";
  content: string | Array<Record<string, unknown>>;
};

/**
 * Call the model and parse the result through a schema.
 * Returns `null` on any failure — missing key, network error, bad JSON,
 * schema violation. Callers must always have a deterministic fallback.
 */
async function structured<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  label: string,
): Promise<T | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model(),
        messages,
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[ai:${label}] model returned ${response.status} — using deterministic result`);
      return null;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      console.warn(`[ai:${label}] empty completion — using deterministic result`);
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.warn(`[ai:${label}] non-JSON completion — using deterministic result`);
      return null;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[ai:${label}] schema violation (${result.error.issues.map((i) => i.path.join(".")).join(", ")}) — using deterministic result`,
      );
      return null;
    }

    return result.data;
  } catch (error) {
    console.warn(
      `[ai:${label}] request failed — using deterministic result:`,
      error instanceof Error ? error.message : "unknown",
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Vision: analyse an uploaded garment
// ---------------------------------------------------------------------------

const ANALYSIS_SYSTEM = `You are a fashion cataloguer. Given a photo of a single garment, return STRICT JSON describing it.

Rules:
- category must be exactly one of: top, bottom, shoes, layer, accessory
  ("layer" = anything worn over a top: jacket, blazer, overshirt, cardigan, coat)
- primaryColor must be a single plain colour word from this vocabulary where possible:
  black, charcoal, grey, light grey, white, off-white, cream, ecru, beige, sand,
  taupe, camel, tan, brown, chocolate, navy, denim, light blue, blue, olive,
  green, teal, burgundy, rust, red, orange, yellow, pink, purple, silver, gold
- formalityScore: 1 = gym clothes, 5 = smart casual, 8 = business, 10 = black tie
- seasonTags from: spring, summer, autumn, winter, all-season
- weatherTags from: hot, warm, mild, cool, cold, rain
- occasionTags from: date, rooftop-date, dinner, client-dinner, brunch, office,
  night-out, airport, casual, wedding, gallery
- styleTags are short lowercase descriptors, e.g. minimal, relaxed, tailored,
  elevated, monochrome, streetwear, smart casual, mediterranean, comfort
- description: one sentence, max 200 characters, concrete and unfussy.

Return only the JSON object.`;

/**
 * Analyse an uploaded garment image.
 * Returns `null` when no vision model is configured — the caller then keeps the
 * user-editable placeholder attributes instead.
 */
export async function analyzeGarment(imageUrl: string): Promise<GarmentAnalysis | null> {
  return await structured(
    [
      { role: "system", content: ANALYSIS_SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: "Catalogue this garment." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    GarmentAnalysisSchema,
    "analyzeGarment",
  );
}

// ---------------------------------------------------------------------------
// 2. Prose: polish the engine's explanation
// ---------------------------------------------------------------------------

const POLISH_SYSTEM = `You are a stylist writing one short caption for an outfit.

You will be given the outfit, the situation, and the scores our engine computed.
Rewrite the draft caption so it reads like a confident human stylist.

Hard rules:
- ONE or TWO sentences. Under 200 characters total.
- Never contradict the scores you are given.
- Never invent garments, colours, materials, brands, prices or weather.
- No emoji. No exclamation marks. No "elevate your look" filler.
- Do not explain your reasoning; just write the caption.

Return STRICT JSON: {"explanation": "..."}`;

/**
 * Rewrite the deterministic explanation in a warmer voice.
 *
 * Note what is NOT delegated here: the outfit, the score, the ranking and the
 * reason breakdown are all already decided. The model only touches wording, so
 * a hallucination can change the prose but never the recommendation.
 */
export async function polishExplanation(
  outfit: ScoredOutfit,
  ctx: EngineContext,
  draft: string,
): Promise<{ text: string } | null> {
  if (!hasModel()) return null;

  const pieces = outfit.slots
    .map((s) => `${s.slot}: ${s.item.name} (${s.item.spec.primaryColor}${s.item.spec.material ? `, ${s.item.spec.material}` : ""})`)
    .join("\n");

  const facts = [
    `Occasion: ${ctx.intent.occasionLabel} (${ctx.intent.dressCode}, ${ctx.intent.timeOfDay})`,
    `Weather: ${ctx.weather.city ?? "—"} ${Math.round(ctx.weather.temperatureC)}°C, ${ctx.weather.condition}`,
    `Overall match: ${outfit.overallScore}%`,
    `Scores — occasion ${Math.round(outfit.breakdown.occasion * 100)}%, weather ${Math.round(outfit.breakdown.weather * 100)}%, style ${Math.round(outfit.breakdown.personalStyle * 100)}%, colour ${Math.round(outfit.breakdown.colorHarmony * 100)}%`,
  ].join("\n");

  const result = await structured(
    [
      { role: "system", content: POLISH_SYSTEM },
      {
        role: "user",
        content: `OUTFIT\n${pieces}\n\nSITUATION\n${facts}\n\nDRAFT CAPTION\n${draft}`,
      },
    ],
    ExplanationSchema,
    "polishExplanation",
  );

  if (!result) return null;

  // Final guard: if the model ignored the length rule, keep the engine's copy.
  if (result.explanation.length > 240) return null;

  return { text: result.explanation.trim() };
}
