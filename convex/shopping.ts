import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { garmentSpec } from "./schema";
import { parseIntent, type Intent } from "./engine/intent";
import { archetypeAsItem, findGaps, gapReason, suggestInsteadOf } from "./engine/gaps";
import {
  evaluateCandidate,
  lifeContexts,
  verdictCopy,
  verdictFor,
  type CompatibilityResult,
} from "./engine/compatibility";
import { describeSpec } from "./engine/classify";
import type { EngineContext, EngineItem } from "./engine/score";
import { archetypeById } from "./engine/archetypes";
import { toEngineItem, toEngineProfile } from "./wardrobe";
import { ContextDevError, extractProduct, type NormalizedProduct } from "./contextDev";
import { CACHED_PRODUCTS, cachedProductForArchetype } from "./data/cachedProducts";

/**
 * ============================================================================
 *  Missing Piece Engine + "Should I Buy This?"
 * ============================================================================
 *
 * Both features share one idea: a product is only worth owning if it makes the
 * clothes you already own more useful. The wardrobe is always the yardstick.
 *
 *   missingPiece   — find the smallest gap, then back it with a real product
 *   evaluateUrl    — take any product URL and judge it against the wardrobe
 *
 * Context.dev supplies every external product. Live extraction is attempted
 * first; if it fails we fall back to previously-extracted cached records and
 * say so in the response (`provenance`).
 */

// ---------------------------------------------------------------------------
// Missing Piece
// ---------------------------------------------------------------------------

export const missingPiece = action({
  args: { sessionId: v.id("recommendationSessions") },
  handler: async (
    ctx,
    args,
  ): Promise<{ gaps: GapResult[]; baselineScore: number }> => {
    const detail = await ctx.runQuery(internal.shopping.contextForSession, {
      sessionId: args.sessionId,
    });
    if (!detail) throw new Error("Session not found");

    const profile = toEngineProfile(detail.profile);
    const wardrobe = detail.items.map(toEngineItem);
    const now = Date.now();

    const todayContext: EngineContext = {
      intent: detail.session.intent as Intent,
      weather: {
        temperatureC: detail.session.weather.temperatureC,
        band: detail.session.weather.band,
        condition: detail.session.weather.condition,
        humidity: detail.session.weather.humidity,
        city: detail.session.weather.city,
      },
      energy: detail.session.energy,
      now,
      seenSignatures: new Set<string>(),
    };

    const life = lifeContexts(profile, detail.session.weather.city, now);

    const { gaps, baselineScore } = findGaps(wardrobe, profile, todayContext, life, {
      limit: 2,
    });

    const results: GapResult[] = [];
    for (const gap of gaps) {
      const product = await sourceProductForArchetype(ctx, gap.archetype.id);
      results.push({
        archetypeId: gap.archetype.id,
        label: gap.archetype.label,
        rationale: gap.archetype.rationale,
        reason: gapReason(gap, baselineScore),
        todayGain: gap.todayGain,
        improvedScore: gap.improvedScore,
        compatibility: serializeCompatibility(gap.compatibility),
        product,
      });
    }

    console.log(
      `[missingPiece] baseline ${baselineScore}% · ${results.length} gap(s): ` +
        results.map((r) => `${r.label} (+${r.todayGain})`).join(", "),
    );

    return { gaps: results, baselineScore };
  },
});

export type GapResult = {
  archetypeId: string;
  label: string;
  rationale: string;
  reason: string;
  todayGain: number;
  improvedScore: number;
  compatibility: SerializedCompatibility;
  product: SourcedProduct | null;
};

export type SourcedProduct = {
  url: string;
  name: string;
  retailer: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  description: string;
  /** "context.dev" (extracted just now) or "cached-context.dev" (demo fallback) */
  provenance: string;
  specSummary: string;
};

/**
 * Find a real product for a wardrobe gap.
 *
 * Order of preference:
 *   1. a product already in Convex for this archetype (free, instant)
 *   2. a fresh Context.dev extraction of a curated retailer product page
 *   3. the committed cache of earlier real extractions (demo safety net)
 */
async function sourceProductForArchetype(
  ctx: { runQuery: any; runAction: any; runMutation: any },
  archetypeId: string,
): Promise<SourcedProduct | null> {
  const stored: Doc<"productCandidates">[] = await ctx.runQuery(
    internal.products.byArchetype,
    { archetypeId },
  );
  if (stored.length > 0) {
    const best = stored.find((p) => p.imageUrl) ?? stored[0];
    return toSourced(best);
  }

  const archetype = archetypeById(archetypeId);
  if (archetype) {
    for (const url of archetype.sources) {
      try {
        const { product }: { product: NormalizedProduct } = await ctx.runAction(
          internal.contextDev.extractAndStore,
          { url, archetypeId },
        );
        return {
          url: product.url,
          name: product.name,
          retailer: product.retailer,
          price: product.price,
          currency: product.currency,
          imageUrl: product.imageUrl,
          description: product.description.slice(0, 200),
          provenance: product.provenance,
          specSummary: describeSpec(product.spec),
        };
      } catch (error) {
        const code = error instanceof ContextDevError ? error.code : "UNKNOWN";
        console.warn(`[missingPiece] live extraction of ${url} failed (${code}) — trying next`);
      }
    }
  }

  const cached = cachedProductForArchetype(archetypeId);
  if (cached) {
    return {
      url: cached.url,
      name: cached.name,
      retailer: cached.retailer,
      price: cached.price,
      currency: cached.currency,
      imageUrl: cached.imageUrl,
      description: cached.description.slice(0, 200),
      provenance: cached.provenance,
      specSummary: describeSpec(cached.spec),
    };
  }

  return null;
}

function toSourced(product: Doc<"productCandidates">): SourcedProduct {
  return {
    url: product.url,
    name: product.name,
    retailer: product.retailer,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl,
    description: product.description.slice(0, 200),
    provenance: product.provenance,
    specSummary: describeSpec(product.spec),
  };
}

export type SerializedCompatibility = {
  wardrobeCompatibility: number;
  newOutfitsUnlocked: number;
  pairsWithCount: number;
  pairsWithTotal: number;
  occasionCoverageGain: string[];
  redundantWith: string[];
  averageScoreGain: number;
  components: CompatibilityResult["components"];
};

function serializeCompatibility(result: CompatibilityResult): SerializedCompatibility {
  return {
    wardrobeCompatibility: result.wardrobeCompatibility,
    newOutfitsUnlocked: result.newOutfitsUnlocked,
    pairsWithCount: result.pairsWithCount,
    pairsWithTotal: result.pairsWithTotal,
    occasionCoverageGain: result.occasionCoverageGain,
    redundantWith: result.redundantWith,
    averageScoreGain: result.averageScoreGain,
    components: result.components,
  };
}

// ---------------------------------------------------------------------------
// Should I Buy This?
// ---------------------------------------------------------------------------

export type BuyVerdict = {
  verdict: "buy" | "maybe" | "skip";
  headline: string;
  reasons: string[];
  compatibility: SerializedCompatibility;
  product: SourcedProduct & { classified: string; confidence: string };
  /** what to buy instead, when we say SKIP */
  alternative: { label: string; rationale: string } | null;
  bestOutfitItemIds: string[];
  evaluationId: Id<"shoppingEvaluations">;
};

export const evaluateUrl = action({
  args: {
    url: v.string(),
    /** 0 = force a fresh scrape, useful when demoing live extraction */
    maxAgeMs: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<BuyVerdict> => {
    const url = args.url.trim();
    if (!/^https?:\/\//i.test(url)) {
      throw new Error("Paste a full product URL, starting with https://");
    }

    // --- 1. get the product, via Context.dev -----------------------------
    let product: NormalizedProduct | null = null;
    let productId: Id<"productCandidates"> | null = null;

    const existing: Doc<"productCandidates"> | null = await ctx.runQuery(
      internal.products.byUrl,
      { url },
    );

    if (existing && args.maxAgeMs !== 0) {
      productId = existing._id;
      product = {
        url: existing.url,
        name: existing.name,
        description: existing.description,
        retailer: existing.retailer,
        price: existing.price,
        currency: existing.currency,
        imageUrl: existing.imageUrl,
        images: existing.images,
        sku: existing.sku,
        productCategory: existing.productCategory,
        features: existing.features,
        tags: existing.tags,
        spec: existing.spec,
        confidence: "high",
        provenance: existing.provenance,
      };
    } else {
      try {
        const result: { id: Id<"productCandidates">; product: NormalizedProduct } =
          await ctx.runAction(internal.contextDev.extractAndStore, {
            url,
            maxAgeMs: args.maxAgeMs,
          });
        product = result.product;
        productId = result.id;
      } catch (error) {
        // Demo safety: if the same product is in our committed cache, use it.
        const cached = CACHED_PRODUCTS.find((p) => p.url === url);
        if (!cached) {
          const message =
            error instanceof ContextDevError
              ? error.userMessage
              : "Couldn't read that product page.";
          throw new Error(message);
        }
        console.warn(`[shouldIBuy] live extraction failed — using cached record for ${url}`);
        productId = await ctx.runMutation(internal.products.upsert, {
          ...cached,
          archetypeId: cached.archetypeId,
        });
        product = { ...cached, confidence: "high" };
      }
    }

    if (!product || !productId) throw new Error("Couldn't read that product page.");

    // --- 2. judge it against the wardrobe --------------------------------
    const snapshot = await ctx.runQuery(internal.wardrobe.engineSnapshot, {});
    const profile = toEngineProfile(snapshot.profile);
    const wardrobe = snapshot.items.map(toEngineItem);
    const now = Date.now();
    const life = lifeContexts(profile, snapshot.city, now);

    const candidate: EngineItem = {
      id: `product:${productId}`,
      name: product.name,
      spec: product.spec,
      wearCount: 0,
      availability: "available",
    };

    const result = evaluateCandidate(wardrobe, candidate, profile, life);
    const verdict = verdictFor(result);
    const copy = verdictCopy(product.name, result);

    // --- 3. when we say no, say what to buy instead -----------------------
    let alternative: BuyVerdict["alternative"] = null;
    if (verdict === "skip") {
      const suggestion = suggestInsteadOf(wardrobe, profile, life, product.spec.category);
      if (suggestion) {
        alternative = { label: suggestion.label, rationale: suggestion.rationale };
        copy.reasons.push(
          `Your wardrobe would benefit more from ${suggestion.label.toLowerCase()}.`,
        );
      }
    }

    if (product.confidence === "low") {
      copy.reasons.push(
        `Heads up: we couldn't confidently tell what kind of garment this is, so treat this with a pinch of salt.`,
      );
    }

    const bestOutfitItemIds = (result.bestOutfit?.itemIds ?? []).filter(
      (id) => !id.startsWith("product:"),
    );

    const evaluationId: Id<"shoppingEvaluations"> = await ctx.runMutation(
      internal.shopping.saveEvaluation,
      {
        userId: snapshot.userId,
        productId,
        verdict,
        wardrobeCompatibility: result.wardrobeCompatibility,
        newOutfitsUnlocked: result.newOutfitsUnlocked,
        pairsWithCount: result.pairsWithCount,
        occasionCoverageGain: result.occasionCoverageGain,
        redundancyNote: result.redundantWith.length ? result.redundantWith.join(", ") : null,
        headline: copy.headline,
        reasons: copy.reasons,
        bestOutfitPreview: bestOutfitItemIds as Id<"wardrobeItems">[],
      },
    );

    console.log(
      `[shouldIBuy] ${product.name} -> ${verdict.toUpperCase()} ` +
        `${result.wardrobeCompatibility}% · ${result.newOutfitsUnlocked} unlocked · ${product.provenance}`,
    );

    return {
      verdict,
      headline: copy.headline,
      reasons: copy.reasons,
      compatibility: serializeCompatibility(result),
      product: {
        url: product.url,
        name: product.name,
        retailer: product.retailer,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        description: product.description.slice(0, 240),
        provenance: product.provenance,
        specSummary: describeSpec(product.spec),
        classified: `${product.spec.primaryColor} ${product.spec.subcategory}`,
        confidence: product.confidence,
      },
      alternative,
      bestOutfitItemIds,
      evaluationId,
    };
  },
});

// ---------------------------------------------------------------------------
// Support functions
// ---------------------------------------------------------------------------

export const contextForSession = internalQuery({
  args: { sessionId: v.id("recommendationSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get("recommendationSessions", args.sessionId);
    if (!session) return null;
    const profile = await ctx.db
      .query("styleProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .unique();
    if (!profile) return null;
    const items = await ctx.db
      .query("wardrobeItems")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .take(300);
    return { session, profile, items };
  },
});

export const saveEvaluation = internalMutation({
  args: {
    userId: v.id("users"),
    productId: v.id("productCandidates"),
    verdict: v.string(),
    wardrobeCompatibility: v.number(),
    newOutfitsUnlocked: v.number(),
    pairsWithCount: v.number(),
    occasionCoverageGain: v.array(v.string()),
    redundancyNote: v.union(v.string(), v.null()),
    headline: v.string(),
    reasons: v.array(v.string()),
    bestOutfitPreview: v.array(v.id("wardrobeItems")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shoppingEvaluations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Recent verdicts, so the Should I Buy page has history to show. */
export const recentEvaluations = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", "demo"))
      .unique();
    if (!user) return [];

    const evaluations = await ctx.db
      .query("shoppingEvaluations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(6);

    return await Promise.all(
      evaluations.map(async (evaluation) => ({
        evaluation,
        product: await ctx.db.get("productCandidates", evaluation.productId),
      })),
    );
  },
});

/** Example product URLs for the demo, drawn from products we really extracted. */
export const exampleUrls = query({
  args: {},
  handler: async (ctx) => {
    const stored = await ctx.db.query("productCandidates").take(200);
    const pick = (predicate: (p: Doc<"productCandidates">) => boolean) =>
      stored.find(predicate);

    const sneaker = pick((p) => p.spec.subcategory === "sneakers" || p.spec.subcategory === "runners");
    const loafer = pick((p) => p.spec.subcategory === "loafers");
    const blazer = pick((p) => p.spec.subcategory === "blazer");

    return [
      sneaker && { label: "Another pair of sneakers", url: sneaker.url, hint: "we think you'll be told to skip this" },
      loafer && { label: "Brown suede loafers", url: loafer.url, hint: "fills a real gap" },
      blazer && { label: "A tailored jacket", url: blazer.url, hint: "borderline" },
    ].filter(Boolean);
  },
});
