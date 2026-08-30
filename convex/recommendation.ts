/**
 * ============================================================================
 *  The shared recommendation contract
 * ============================================================================
 *
 * GRWM has two engines that can produce a recommendation:
 *
 *   PRIMARY   Gemini            — taste, judgement, occasion reading
 *   FALLBACK  deterministic     — resilience when Gemini is unavailable
 *
 * They both return the shape defined here, so nothing downstream — not
 * `recommend.ts`, not the database, not a single React component — has to know
 * or care which one ran. `source` exists purely for debugging and for the demo.
 *
 * Division of responsibility
 * --------------------------
 * Gemini is trusted with *taste*, never with *correctness*:
 *
 *   · Gemini (or the fallback) CHOOSES the outfit and writes the explanation
 *   · deterministic code MEASURES the chosen outfit (`scoreBreakdown`)
 *   · deterministic code VALIDATES every field before it reaches the database
 *
 * That is why `scoreBreakdown` is not something we ask a model for. The score
 * bars in the UI are computed the same way regardless of who picked the outfit,
 * so they cannot disagree with reality and cannot be hallucinated.
 */

import { z } from "zod";
import { v } from "convex/values";

/** Which engine produced a result. Internal/debug only — never shouted at the user. */
export type RecommendationSource = "gemini" | "fallback" | "cached";

export const RECOMMENDATION_SOURCES = ["gemini", "fallback", "cached"] as const;

// ---------------------------------------------------------------------------
// Score breakdown — always measured deterministically
// ---------------------------------------------------------------------------

/**
 * The five explainable dimensions, each an integer 0-100.
 *
 * Deliberately five, not seven: the previous engine also scored "novelty" and a
 * mood/zodiac term. Judging mood is exactly the kind of taste call Gemini now
 * owns, so encoding it in rules was duplicated work.
 */
export const ScoreBreakdownSchema = z.object({
  occasion: z.number().int().min(0).max(100),
  weather: z.number().int().min(0).max(100),
  personalStyle: z.number().int().min(0).max(100),
  colorHarmony: z.number().int().min(0).max(100),
  comfort: z.number().int().min(0).max(100),
});

export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

// ---------------------------------------------------------------------------
// Missing piece
// ---------------------------------------------------------------------------

/**
 * A wardrobe gap, expressed as something Context.dev can actually go and find.
 *
 * This matches the shape `gemini.ts` produces, because it is what drives the
 * product search. The deterministic fallback fills the same fields from its
 * static gap library.
 */
export const MissingPieceSchema = z.object({
  /** searchable garment, e.g. "brown suede loafers" */
  productType: z.string().min(2).max(60),
  reason: z.string().min(10).max(240),
  attributes: z.array(z.string().min(1).max(30)).min(1).max(6),
  maxPrice: z.number().positive().max(100_000),
  currency: z.string().length(3),
});

export type MissingPiece = z.infer<typeof MissingPieceSchema>;

// ---------------------------------------------------------------------------
// The recommendation itself
// ---------------------------------------------------------------------------

/** One line of the "why this works" panel. */
export const ReasonSchema = z.object({
  label: z.string().min(1).max(30),
  score: z.number().int().min(0).max(100),
  text: z.string().min(1).max(200),
});

export type Reason = z.infer<typeof ReasonSchema>;

export const RecommendationSchema = z.object({
  /** wardrobe ids, in the order worn; always contains a top, bottom and shoes */
  selectedItemIds: z.array(z.string().min(1)).min(3).max(6),
  overallScore: z.number().int().min(0).max(100),
  scoreBreakdown: ScoreBreakdownSchema,
  explanation: z.string().min(10).max(400),
  reasons: z.array(ReasonSchema).max(8),
  missingPiece: MissingPieceSchema.nullable(),
  source: z.enum(RECOMMENDATION_SOURCES),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

/** Convex validators mirroring the above, for schema + function args. */
export const scoreBreakdownValidator = v.object({
  occasion: v.number(),
  weather: v.number(),
  personalStyle: v.number(),
  colorHarmony: v.number(),
  comfort: v.number(),
  // Retained as optional so recommendations written by the older seven-dimension
  // engine still satisfy the schema. Nothing writes these any more.
  novelty: v.optional(v.number()),
  personality: v.optional(v.number()),
});

export const missingPieceValidator = v.object({
  productType: v.string(),
  reason: v.string(),
  attributes: v.array(v.string()),
  maxPrice: v.number(),
  currency: v.string(),
});

// ---------------------------------------------------------------------------
// Validation + repair
// ---------------------------------------------------------------------------

export const REQUIRED_SLOTS = ["top", "bottom", "shoes"] as const;

export type ValidationInput = {
  selectedItemIds: unknown;
  overallScore: unknown;
  explanation: unknown;
  missingPiece?: unknown;
};

export type ValidationContext = {
  /** category, keyed by wardrobe id — the set of ids that genuinely exist */
  categoryById: Map<string, string>;
  /** deterministic measurement for a validated set of ids */
  measure: (itemIds: string[]) => { breakdown: ScoreBreakdown; reasons: Reason[] };
  defaultCurrency: string;
};

export type ValidationFailure = {
  ok: false;
  /** why we rejected it, for logs — the caller then runs the fallback */
  problem: string;
};

export type ValidationSuccess = { ok: true; recommendation: Recommendation; repairs: string[] };

/**
 * Turn a raw model response into a trustworthy `Recommendation`, or say no.
 *
 * Lightweight repairs are attempted where they are unambiguously safe:
 *   · drop ids that don't exist in the wardrobe
 *   · drop duplicates and second garments in a single-garment slot
 *   · clamp and round `overallScore`
 *   · trim an over-long explanation
 *   · discard a malformed `missingPiece` (the outfit is still usable without one)
 *
 * Anything that cannot be repaired without guessing — no top, an empty outfit,
 * a missing explanation — is rejected outright so the deterministic fallback can
 * produce a coherent answer instead. Malformed AI output never reaches the UI.
 */
export function validateRecommendation(
  raw: ValidationInput,
  context: ValidationContext,
  source: RecommendationSource = "gemini",
): ValidationSuccess | ValidationFailure {
  const repairs: string[] = [];

  // --- ids --------------------------------------------------------------
  if (!Array.isArray(raw.selectedItemIds)) {
    return { ok: false, problem: "selectedItemIds is not an array" };
  }

  const known: string[] = [];
  for (const candidate of raw.selectedItemIds) {
    if (typeof candidate !== "string") continue;
    if (!context.categoryById.has(candidate)) continue;
    known.push(candidate);
  }
  if (known.length !== raw.selectedItemIds.length) {
    repairs.push(`dropped ${raw.selectedItemIds.length - known.length} unknown id(s)`);
  }

  const seen = new Set<string>();
  const filledSlots = new Set<string>();
  const selectedItemIds: string[] = [];
  for (const id of known) {
    if (seen.has(id)) {
      repairs.push("dropped a duplicate id");
      continue;
    }
    const category = context.categoryById.get(id)!;
    if (category !== "accessory") {
      if (filledSlots.has(category)) {
        repairs.push(`dropped a second ${category}`);
        continue;
      }
      filledSlots.add(category);
    }
    seen.add(id);
    selectedItemIds.push(id);
  }

  for (const slot of REQUIRED_SLOTS) {
    if (!filledSlots.has(slot)) {
      return { ok: false, problem: `no ${slot} in the selection` };
    }
  }
  if (selectedItemIds.length > 6) {
    selectedItemIds.length = 6;
    repairs.push("trimmed to 6 pieces");
  }

  // --- explanation ------------------------------------------------------
  if (typeof raw.explanation !== "string" || raw.explanation.trim().length < 10) {
    return { ok: false, problem: "explanation missing or too short" };
  }
  let explanation = raw.explanation.trim();
  if (explanation.length > 400) {
    explanation = `${explanation.slice(0, 397).trimEnd()}…`;
    repairs.push("truncated explanation");
  }

  // --- score ------------------------------------------------------------
  let overallScore: number;
  if (typeof raw.overallScore === "number" && Number.isFinite(raw.overallScore)) {
    const clamped = Math.min(100, Math.max(0, Math.round(raw.overallScore)));
    if (clamped !== raw.overallScore) repairs.push("normalised overallScore");
    overallScore = clamped;
  } else {
    return { ok: false, problem: "overallScore is not a finite number" };
  }

  // --- measurement (always ours) ---------------------------------------
  const { breakdown, reasons } = context.measure(selectedItemIds);

  // --- missing piece ----------------------------------------------------
  let missingPiece: MissingPiece | null = null;
  if (raw.missingPiece !== null && raw.missingPiece !== undefined) {
    const parsed = MissingPieceSchema.safeParse(
      withDefaultCurrency(raw.missingPiece, context.defaultCurrency),
    );
    if (parsed.success) missingPiece = parsed.data;
    else repairs.push("discarded a malformed missingPiece");
  }

  const recommendation = RecommendationSchema.safeParse({
    selectedItemIds,
    overallScore,
    scoreBreakdown: breakdown,
    explanation,
    reasons,
    missingPiece,
    source,
  });

  if (!recommendation.success) {
    return {
      ok: false,
      problem: `failed final schema check (${recommendation.error.issues
        .map((issue) => issue.path.join(".") || "root")
        .join(", ")})`,
    };
  }

  return { ok: true, recommendation: recommendation.data, repairs };
}

/** Models sometimes omit currency; the app always knows it, so fill it in. */
function withDefaultCurrency(value: unknown, currency: string): unknown {
  if (typeof value !== "object" || value === null) return value;
  const record = value as Record<string, unknown>;
  if (typeof record.currency === "string" && record.currency.length === 3) return record;
  return { ...record, currency };
}
