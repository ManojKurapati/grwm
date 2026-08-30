import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { weatherContext } from "./schema";
import { parseIntent, type Intent } from "./engine/intent";
import {
  generateFallbackOutfit,
  isWearable,
  type FallbackContext,
  type FallbackItem,
} from "./engine/fallbackRecommendationEngine";
import { measureOutfit, type MeasureContext } from "./engine/measure";
import { fallbackMissingPiece } from "./engine/gaps";
import { classifyProduct } from "./engine/classify";
import { chooseOutfit, hasGemini, type StylistItem } from "./gemini";
import {
  missingPieceValidator,
  scoreBreakdownValidator,
  validateRecommendation,
  type MissingPiece,
  type Recommendation,
} from "./recommendation";
import { getWeather } from "./weather";
import { currencyForCity } from "./engine/intent";

/**
 * ============================================================================
 *  Ask GRWM — recommendation orchestration
 * ============================================================================
 *
 * The pipeline, in order:
 *
 *   1. read the wardrobe + style profile in ONE transaction
 *   2. parse the prompt into hard context (occasion, dress code, time, city)
 *   3. resolve the weather for the hour they're actually going out
 *   4. apply deterministic hard constraints to get the wearable set
 *   5. PRIMARY:  ask Gemini to style them
 *      VALIDATE: check every id, slot and score before trusting it
 *      FALLBACK: if any of that fails, build a safe outfit deterministically
 *   6. measure the chosen outfit and persist it
 *
 * Steps 4 and 6 are deterministic for both engines. Gemini is trusted with
 * taste; it is never trusted with correctness, and it can never stall the demo,
 * because step 5 always terminates with *something* wearable.
 */

export const generate = action({
  args: {
    prompt: v.string(),
    energy: v.optional(v.string()),
    city: v.optional(v.string()),
    /** Force the deterministic path — used by tests and for demoing resilience. */
    forceFallback: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ sessionId: Id<"recommendationSessions"> }> => {
    const started = Date.now();
    const snapshot = await ctx.runQuery(internal.wardrobe.engineSnapshot, {});
    const profile = snapshot.profile;

    // --- 2. context -------------------------------------------------------
    const intent = parseIntent(args.prompt, {
      fallbackCity: args.city ?? snapshot.city,
      baseFormality: profile.baseFormality,
      energy: args.energy,
    });

    // --- 3. weather -------------------------------------------------------
    const weather = await getWeather(intent.city, { timeOfDay: intent.timeOfDay });

    const measureCtx: MeasureContext = {
      occasion: intent.occasion,
      occasionLabel: intent.occasionLabel,
      dressCode: intent.dressCode,
      targetFormality: intent.targetFormality,
      timeOfDay: intent.timeOfDay,
      temperatureC: weather.temperatureC,
      band: weather.band,
      condition: weather.condition,
      humidity: weather.humidity,
      city: weather.city,
      preferredStyles: profile.preferredStyles,
      preferredColors: profile.preferredColors,
      avoidColors: profile.avoidColors,
    };

    const currency = currencyForCity(weather.city);
    const fallbackCtx: FallbackContext = { ...measureCtx, currency };

    const items: FallbackItem[] = snapshot.items.map((item) => ({
      id: item._id,
      name: item.name,
      spec: item.spec,
      availability: item.availability,
      wearCount: item.wearCount,
      lastWornAt: item.lastWornAt,
    }));

    // --- 4. hard constraints (shared by both engines) ---------------------
    const wearable = items.filter((item) => isWearable(item, measureCtx));
    const categoryById = new Map(items.map((item) => [item.id, item.spec.category]));

    /** Deterministic measurement, used to score whichever outfit gets chosen. */
    const measure = (itemIds: string[]) => {
      const chosen = itemIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is FallbackItem => Boolean(item));
      const { breakdown, reasons } = measureOutfit(chosen, measureCtx);
      return { breakdown, reasons };
    };

    // --- 5. primary, then fallback ---------------------------------------
    let recommendation: Recommendation | null = null;

    if (!args.forceFallback && hasGemini() && wearable.length > 0) {
      try {
        const choice = await chooseOutfit(toStylistItems(wearable), {
          prompt: args.prompt,
          city: weather.city,
          temperatureC: weather.temperatureC,
          condition: weather.condition,
          weatherSummary: weather.summary,
          occasionLabel: intent.occasionLabel,
          dressCode: intent.dressCode,
          timeOfDay: intent.timeOfDay,
          energy: args.energy,
          currency,
          preferredStyles: profile.preferredStyles,
          avoidColors: profile.avoidColors,
        });

        if (choice) {
          const validated = validateRecommendation(
            {
              selectedItemIds: choice.selectedItemIds,
              overallScore: choice.overallScore,
              explanation: choice.reasoningSummary,
              missingPiece: choice.missingPiece,
            },
            { categoryById, measure, defaultCurrency: currency },
            "gemini",
          );

          if (validated.ok) {
            recommendation = validated.recommendation;
            if (validated.repairs.length > 0) {
              console.warn(`[recommend] repaired Gemini output: ${validated.repairs.join("; ")}`);
            }
          } else {
            console.warn(`[recommend] rejected Gemini output — ${validated.problem}`);
          }
        }
      } catch (error) {
        // chooseOutfit already swallows its own failures, so this only catches
        // something genuinely unexpected. Either way: fall through.
        console.warn(
          "[recommend] Gemini recommendation failed. Using fallback:",
          error instanceof Error ? error.message : "unknown",
        );
      }
    }

    if (!recommendation) {
      recommendation = generateFallbackOutfit(items, fallbackCtx);
    }

    // Gemini may legitimately decide there's no gap; the fallback fills one in
    // so the Missing Piece section still has something to search for.
    if (!recommendation) {
      throw new Error(
        "Your wardrobe needs at least one top, one bottom and one pair of shoes before GRWM can build a fit.",
      );
    }

    // Gemini is told not to suggest something the user effectively already owns,
    // but it does anyway (it proposed a black linen shirt to someone who owns a
    // cream one). Redundancy is countable, so we check it rather than trusting
    // the instruction, and hand over to the deterministic library when it fails.
    const missingPiece = usefulMissingPiece(recommendation.missingPiece, items, fallbackCtx);

    // --- 6. persist -------------------------------------------------------
    const sessionId = await ctx.runMutation(internal.recommend.persist, {
      userId: snapshot.userId,
      prompt: args.prompt,
      energy: args.energy,
      intent,
      weather,
      currency,
      outfit: {
        selectedItemIds: recommendation.selectedItemIds as Id<"wardrobeItems">[],
        overallScore: recommendation.overallScore,
        scoreBreakdown: recommendation.scoreBreakdown,
        explanation: recommendation.explanation,
        reasons: recommendation.reasons,
        missingPiece,
        source: recommendation.source,
      },
    });

    console.log(
      `[recommend] "${args.prompt.slice(0, 46)}" -> ${recommendation.overallScore}% ` +
        `via ${recommendation.source} · ${weather.city} ${weather.temperatureC}°C` +
        `${weather.isFallback ? " (fallback weather)" : ""} · ${Date.now() - started}ms`,
    );

    return { sessionId };
  },
});

/**
 * Keep a proposed gap unless the wardrobe *actually* already covers it.
 *
 * Gemini is told not to suggest something the user effectively owns, and it
 * mostly obeys — but it proposed a black linen shirt to someone who owns a cream
 * one. A gap that duplicates an owned piece scores near zero and "unlocks 0
 * outfits", leaving the Missing Piece section with nothing worth showing.
 *
 * The bar here is deliberately HIGHER than `isRedundantWith`, which treats any
 * two wardrobe-neutrals as interchangeable. That is right for "should I buy
 * this?" — owning black loafers really does devalue a second pair — but as a gap
 * filter it rejected "taupe suede loafers" from someone who owns black leather
 * ones, which is a genuinely different shoe. Overruling the stylist on a call
 * like that is exactly what deterministic code should not do.
 *
 * So we require the same category, the same subcategory AND the same material
 * before calling it a duplicate. That still catches linen-shirt-for-linen-shirt
 * while leaving suede-versus-leather to Gemini's judgement.
 */
function usefulMissingPiece(
  proposed: MissingPiece | null,
  items: FallbackItem[],
  ctx: FallbackContext,
): MissingPiece | null {
  if (proposed) {
    const { confidence: _confidence, ...spec } = classifyProduct({
      name: proposed.productType,
      description: proposed.attributes.join(", "),
    });

    const duplicate = items.find(
      (item) =>
        item.availability === "available" &&
        item.spec.category === spec.category &&
        item.spec.subcategory === spec.subcategory &&
        normalizeMaterial(item.spec.material) === normalizeMaterial(spec.material),
    );

    if (!duplicate) return proposed;

    console.warn(
      `[recommend] discarded gap "${proposed.productType}" — duplicates ${duplicate.name}`,
    );
  }

  return fallbackMissingPiece(items, ctx);
}

function normalizeMaterial(material: string | undefined): string {
  return (material ?? "").trim().toLowerCase();
}

/** Project wardrobe items into the compact shape the stylist prompt expects. */
function toStylistItems(items: FallbackItem[]): StylistItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.spec.category,
    subcategory: item.spec.subcategory,
    primaryColor: item.spec.primaryColor,
    material: item.spec.material,
    formalityScore: item.spec.formalityScore,
    styleTags: item.spec.styleTags,
    weatherTags: item.spec.weatherTags,
    wearCount: item.wearCount,
  }));
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export const persist = internalMutation({
  args: {
    userId: v.id("users"),
    prompt: v.string(),
    energy: v.optional(v.string()),
    intent: v.object({
      occasion: v.string(),
      occasionLabel: v.string(),
      dressCode: v.string(),
      targetFormality: v.number(),
      timeOfDay: v.string(),
      city: v.string(),
      keywords: v.array(v.string()),
      styleBias: v.array(v.string()),
      avoidStyles: v.array(v.string()),
    }),
    weather: weatherContext,
    currency: v.string(),
    outfit: v.object({
      selectedItemIds: v.array(v.id("wardrobeItems")),
      overallScore: v.number(),
      scoreBreakdown: scoreBreakdownValidator,
      explanation: v.string(),
      reasons: v.array(
        v.object({ label: v.string(), score: v.number(), text: v.string() }),
      ),
      missingPiece: v.union(missingPieceValidator, v.null()),
      source: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("recommendationSessions", {
      userId: args.userId,
      prompt: args.prompt,
      energy: args.energy,
      intent: args.intent,
      weather: args.weather,
      currency: args.currency,
      status: "ready",
      createdAt: now,
    });

    const outfitId = await ctx.db.insert("outfits", {
      userId: args.userId,
      sessionId,
      rank: 0,
      overallScore: args.outfit.overallScore,
      scoreBreakdown: args.outfit.scoreBreakdown,
      explanation: args.outfit.explanation,
      explanationSource: args.outfit.source,
      source: args.outfit.source,
      reasons: args.outfit.reasons,
      missingPiece: args.outfit.missingPiece ?? undefined,
      signature: [...args.outfit.selectedItemIds].sort().join("|"),
      createdAt: now,
    });

    for (const [order, itemId] of args.outfit.selectedItemIds.entries()) {
      const item = await ctx.db.get("wardrobeItems", itemId);
      await ctx.db.insert("outfitItems", {
        outfitId,
        itemId,
        slot: item?.spec.category ?? "accessory",
        order,
      });
    }

    return sessionId;
  },
});

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type OutfitView = {
  outfit: Doc<"outfits">;
  items: Array<{
    slot: string;
    order: number;
    item: (Doc<"wardrobeItems"> & { imageSrc: string | null }) | null;
  }>;
  feedback: string | null;
};

/** A whole session, hydrated for the result screen. Reactive by default. */
export const session = query({
  args: { sessionId: v.id("recommendationSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get("recommendationSessions", args.sessionId);
    if (!session) return null;

    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_sessionId_and_rank", (q) => q.eq("sessionId", args.sessionId))
      .take(10);

    const hydrated: OutfitView[] = [];
    for (const outfit of outfits) {
      const links = await ctx.db
        .query("outfitItems")
        .withIndex("by_outfitId", (q) => q.eq("outfitId", outfit._id))
        .take(10);

      const items = await Promise.all(
        links
          .sort((a, b) => a.order - b.order)
          .map(async (link) => {
            const item = await ctx.db.get("wardrobeItems", link.itemId);
            return {
              slot: link.slot,
              order: link.order,
              item: item
                ? {
                    ...item,
                    imageSrc: item.imageStorageId
                      ? await ctx.storage.getUrl(item.imageStorageId)
                      : (item.imageUrl ?? null),
                  }
                : null,
            };
          }),
      );

      const feedback = await ctx.db
        .query("feedback")
        .withIndex("by_outfitId", (q) => q.eq("outfitId", outfit._id))
        .unique();

      hydrated.push({ outfit, items, feedback: feedback?.verdict ?? null });
    }

    return { session, outfits: hydrated };
  },
});

/** The most recent session, so returning to /ask restores the last result. */
export const latestSession = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", "demo"))
      .unique();
    if (!user) return null;
    const session = await ctx.db
      .query("recommendationSessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    return session?._id ?? null;
  },
});

// ---------------------------------------------------------------------------
// Swap a single slot
// ---------------------------------------------------------------------------

/**
 * Replace one garment with the best owned alternative.
 *
 * Deterministic by design: this is a small, instant, offline interaction, and
 * round-tripping a model for "give me a different pair of shoes" would make it
 * feel slow for no gain.
 */
export const swapItem = action({
  args: { outfitId: v.id("outfits"), slot: v.string() },
  handler: async (ctx, args): Promise<{ swappedTo: string | null }> => {
    const detail = await ctx.runQuery(internal.recommend.outfitForSwap, {
      outfitId: args.outfitId,
    });
    if (!detail) throw new Error("Outfit not found");

    const intent = detail.session.intent as Intent;
    const measureCtx: MeasureContext = {
      occasion: intent.occasion,
      occasionLabel: intent.occasionLabel,
      dressCode: intent.dressCode,
      targetFormality: intent.targetFormality,
      timeOfDay: intent.timeOfDay,
      temperatureC: detail.session.weather.temperatureC,
      band: detail.session.weather.band,
      condition: detail.session.weather.condition,
      humidity: detail.session.weather.humidity,
      city: detail.session.weather.city,
      preferredStyles: detail.profile.preferredStyles,
      preferredColors: detail.profile.preferredColors,
      avoidColors: detail.profile.avoidColors,
    };

    const current = detail.links
      .filter((link) => link.item !== null)
      .map((link) => ({
        id: link.item!._id as string,
        name: link.item!.name,
        spec: link.item!.spec,
      }));

    const target = detail.links.find((link) => link.slot === args.slot);
    if (!target?.item) throw new Error(`No ${args.slot} in this outfit`);
    const currentId = target.item._id as string;

    const alternatives = detail.wardrobe
      .filter(
        (item) =>
          item.spec.category === args.slot &&
          item._id !== target.item!._id &&
          item.availability === "available",
      )
      .map((item) => ({ id: item._id as string, name: item.name, spec: item.spec }));

    if (alternatives.length === 0) return { swappedTo: null };

    let best: { id: string; name: string; score: number } | null = null;
    for (const alternative of alternatives) {
      const swapped = current.map((item) => (item.id === currentId ? alternative : item));
      const { overall } = measureOutfit(swapped, measureCtx);
      if (!best || overall > best.score) {
        best = { id: alternative.id, name: alternative.name, score: overall };
      }
    }
    if (!best) return { swappedTo: null };

    await ctx.runMutation(internal.recommend.applySwap, {
      outfitId: args.outfitId,
      slot: args.slot,
      newItemId: best.id as Id<"wardrobeItems">,
      newScore: best.score,
    });

    return { swappedTo: best.name };
  },
});

export const outfitForSwap = internalQuery({
  args: { outfitId: v.id("outfits") },
  handler: async (ctx, args) => {
    const outfit = await ctx.db.get("outfits", args.outfitId);
    if (!outfit) return null;
    const session = await ctx.db.get("recommendationSessions", outfit.sessionId);
    if (!session) return null;
    const profile = await ctx.db
      .query("styleProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", outfit.userId))
      .unique();
    if (!profile) return null;

    const links = await ctx.db
      .query("outfitItems")
      .withIndex("by_outfitId", (q) => q.eq("outfitId", args.outfitId))
      .take(10);

    const hydrated = await Promise.all(
      links.map(async (link) => ({
        slot: link.slot,
        item: await ctx.db.get("wardrobeItems", link.itemId),
      })),
    );

    const wardrobe = await ctx.db
      .query("wardrobeItems")
      .withIndex("by_userId", (q) => q.eq("userId", outfit.userId))
      .take(300);

    return { outfit, session, profile, links: hydrated, wardrobe };
  },
});

export const applySwap = internalMutation({
  args: {
    outfitId: v.id("outfits"),
    slot: v.string(),
    newItemId: v.id("wardrobeItems"),
    newScore: v.number(),
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("outfitItems")
      .withIndex("by_outfitId", (q) => q.eq("outfitId", args.outfitId))
      .take(10);
    const target = links.find((link) => link.slot === args.slot);
    if (!target) return null;

    await ctx.db.patch("outfitItems", target._id, { itemId: args.newItemId });

    const remaining = links.map((link) =>
      link._id === target._id ? args.newItemId : link.itemId,
    );
    await ctx.db.patch("outfits", args.outfitId, {
      overallScore: args.newScore,
      signature: [...remaining].sort().join("|"),
    });
    return null;
  },
});
