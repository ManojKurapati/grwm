import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { scoreBreakdown, weatherContext } from "./schema";
import { parseIntent, type Intent } from "./engine/intent";
import { generateOutfits } from "./engine/outfits";
import { buildExplanation, buildReasons } from "./engine/explain";
import { scoreOutfit, type EngineContext, type ScoredOutfit } from "./engine/score";
import { ZODIAC, type Slot } from "./engine/taxonomy";
import { getWeather } from "./weather";
import { toEngineItem, toEngineProfile } from "./wardrobe";
import { polishExplanation } from "./ai";

/**
 * ============================================================================
 *  Ask GRWM — the recommendation pipeline
 * ============================================================================
 *
 *   1. read the wardrobe + style profile in a single transaction
 *   2. parse the prompt into hard constraints (occasion, dress code, time, city)
 *   3. resolve weather for that city
 *   4. filter, generate and score every plausible outfit combination
 *   5. persist the session, the ranked outfits and their item links
 *   6. optionally let a language model *polish the prose* — never the decision
 *
 * The model is deliberately last and deliberately optional. The score, the
 * ranking and the reasons are all produced by the deterministic engine, so the
 * demo cannot be broken by a model outage, and the numbers are reproducible.
 */

const HOW_MANY_ALTERNATES = 5;

export const generate = action({
  args: {
    prompt: v.string(),
    energy: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sessionId: Id<"recommendationSessions"> }> => {
    const snapshot = await ctx.runQuery(internal.wardrobe.engineSnapshot, {});
    const profile = toEngineProfile(snapshot.profile);

    // --- 2. intent -------------------------------------------------------
    const zodiacBias = snapshot.profile.zodiacSign
      ? ZODIAC[snapshot.profile.zodiacSign.toLowerCase()]?.styleBias
      : undefined;

    const intent = parseIntent(args.prompt, {
      fallbackCity: args.city ?? snapshot.city,
      baseFormality: profile.baseFormality,
      energy: args.energy,
      zodiacBias,
    });

    // --- 3. weather ------------------------------------------------------
    const weather = await getWeather(intent.city);

    // --- 4. the engine ---------------------------------------------------
    const engineCtx: EngineContext = {
      intent,
      weather: {
        temperatureC: weather.temperatureC,
        band: weather.band,
        condition: weather.condition,
        humidity: weather.humidity,
        city: weather.city,
      },
      energy: args.energy,
      now: Date.now(),
      seenSignatures: new Set(snapshot.seenSignatures),
    };

    const items = snapshot.items.map(toEngineItem);
    const { outfits, consideredCount } = generateOutfits(items, engineCtx, profile, {
      limit: HOW_MANY_ALTERNATES,
    });

    if (outfits.length === 0) {
      throw new Error(
        "No outfit could be assembled — the wardrobe needs at least one top, bottom and pair of shoes.",
      );
    }

    // --- 6. optional prose polish ---------------------------------------
    const prepared = await Promise.all(
      outfits.map(async (outfit, rank) => {
        const engineExplanation = buildExplanation(outfit, engineCtx);
        // Only the top result is worth a model call.
        const polished =
          rank === 0 ? await polishExplanation(outfit, engineCtx, engineExplanation) : null;
        return {
          outfit,
          explanation: polished?.text ?? engineExplanation,
          explanationSource: polished ? "llm" : "engine",
          reasons: buildReasons(outfit, engineCtx, profile),
        };
      }),
    );

    // --- 5. persist ------------------------------------------------------
    const sessionId = await ctx.runMutation(internal.recommend.persist, {
      userId: snapshot.userId,
      prompt: args.prompt,
      energy: args.energy,
      intent,
      weather,
      outfits: prepared.map(({ outfit, explanation, explanationSource, reasons }) => ({
        overallScore: outfit.overallScore,
        scoreBreakdown: roundBreakdown(outfit),
        explanation,
        explanationSource,
        reasons,
        signature: outfit.signature,
        items: outfit.slots.map((slot, order) => ({
          itemId: slot.item.id as Id<"wardrobeItems">,
          slot: slot.slot,
          order,
        })),
      })),
    });

    console.log(
      `[recommend] "${args.prompt.slice(0, 50)}" -> ${outfits[0].overallScore}% ` +
        `from ${consideredCount} combinations · ${weather.city} ${weather.temperatureC}°C` +
        `${weather.isFallback ? " (fallback weather)" : ""}`,
    );

    return { sessionId };
  },
});

function roundBreakdown(outfit: ScoredOutfit) {
  const b = outfit.breakdown;
  const pct = (n: number) => Math.round(n * 100);
  return {
    occasion: pct(b.occasion),
    weather: pct(b.weather),
    personalStyle: pct(b.personalStyle),
    colorHarmony: pct(b.colorHarmony),
    comfort: pct(b.comfort),
    novelty: pct(b.novelty),
    personality: pct(b.personality),
  };
}

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
    outfits: v.array(
      v.object({
        overallScore: v.number(),
        scoreBreakdown: scoreBreakdown,
        explanation: v.string(),
        explanationSource: v.string(),
        reasons: v.array(
          v.object({ label: v.string(), score: v.number(), text: v.string() }),
        ),
        signature: v.string(),
        items: v.array(
          v.object({
            itemId: v.id("wardrobeItems"),
            slot: v.string(),
            order: v.number(),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("recommendationSessions", {
      userId: args.userId,
      prompt: args.prompt,
      energy: args.energy,
      intent: args.intent,
      weather: args.weather,
      status: "ready",
      createdAt: now,
    });

    for (const [rank, outfit] of args.outfits.entries()) {
      const outfitId = await ctx.db.insert("outfits", {
        userId: args.userId,
        sessionId,
        rank,
        overallScore: outfit.overallScore,
        scoreBreakdown: outfit.scoreBreakdown,
        explanation: outfit.explanation,
        explanationSource: outfit.explanationSource,
        reasons: outfit.reasons,
        signature: outfit.signature,
        createdAt: now,
      });
      for (const link of outfit.items) {
        await ctx.db.insert("outfitItems", { outfitId, ...link });
      }
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

/** Swap one slot of an outfit for the next-best owned alternative. */
export const swapItem = action({
  args: {
    outfitId: v.id("outfits"),
    slot: v.string(),
  },
  handler: async (ctx, args): Promise<{ swappedTo: string | null }> => {
    const detail = await ctx.runQuery(internal.recommend.outfitForSwap, {
      outfitId: args.outfitId,
    });
    if (!detail) throw new Error("Outfit not found");

    const profile = toEngineProfile(detail.profile);
    const engineCtx: EngineContext = {
      intent: detail.session.intent as Intent,
      weather: {
        temperatureC: detail.session.weather.temperatureC,
        band: detail.session.weather.band,
        condition: detail.session.weather.condition,
        humidity: detail.session.weather.humidity,
        city: detail.session.weather.city,
      },
      energy: detail.session.energy,
      now: Date.now(),
      seenSignatures: new Set(detail.seenSignatures),
    };

    const target = detail.links.find((l) => l.slot === args.slot);
    if (!target?.item) throw new Error(`No ${args.slot} in this outfit`);
    const currentItemId = target.item._id;

    const current = detail.links.map((link) => ({
      slot: link.slot as Slot,
      item: toEngineItem(link.item!),
    }));

    // Try every other owned item in that slot, keep the best that isn't current.
    const alternatives = detail.wardrobe
      .filter(
        (i) =>
          i.spec.category === args.slot &&
          i._id !== currentItemId &&
          i.availability === "available",
      )
      .map(toEngineItem);

    if (alternatives.length === 0) return { swappedTo: null };

    let best: { id: string; name: string; score: number } | null = null;
    for (const alternative of alternatives) {
      const slots = current.map((s) =>
        s.item.id === currentItemId ? { slot: s.slot, item: alternative } : s,
      );
      const signature = [...slots.map((s) => s.item.id)].sort().join("|");
      const scored = scoreOutfit({ slots, signature }, engineCtx, profile);
      if (!best || scored.overallScore > best.score) {
        best = { id: alternative.id, name: alternative.name, score: scored.overallScore };
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

    const previous = await ctx.db
      .query("outfits")
      .withIndex("by_userId", (q) => q.eq("userId", outfit.userId))
      .order("desc")
      .take(40);

    return {
      outfit,
      session,
      profile,
      links: hydrated.filter((l) => l.item !== null),
      wardrobe,
      seenSignatures: previous.map((o) => o.signature),
    };
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
    const target = links.find((l) => l.slot === args.slot);
    if (!target) return null;

    await ctx.db.patch("outfitItems", target._id, { itemId: args.newItemId });

    const remaining = links.map((l) =>
      l._id === target._id ? args.newItemId : l.itemId,
    );
    await ctx.db.patch("outfits", args.outfitId, {
      overallScore: args.newScore,
      signature: [...remaining].sort().join("|"),
    });
    return null;
  },
});
