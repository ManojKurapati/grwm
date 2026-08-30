import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { garmentSpec } from "./schema";

/**
 * Storage for Context.dev-extracted products.
 *
 * Keyed by URL so a product is only ever extracted once. Repeat evaluations —
 * and every reload during a demo — read from Convex instead of burning API
 * credits or risking a live network call.
 */

export const upsert = internalMutation({
  args: {
    url: v.string(),
    name: v.string(),
    description: v.string(),
    retailer: v.string(),
    price: v.union(v.number(), v.null()),
    currency: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    images: v.array(v.string()),
    sku: v.union(v.string(), v.null()),
    productCategory: v.union(v.string(), v.null()),
    features: v.array(v.string()),
    tags: v.array(v.string()),
    spec: garmentSpec,
    provenance: v.string(),
    archetypeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("productCandidates")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();

    if (existing) {
      // A live extraction always supersedes a cached snapshot.
      const keepProvenance =
        existing.provenance === "context.dev" && args.provenance !== "context.dev"
          ? existing.provenance
          : args.provenance;
      await ctx.db.patch("productCandidates", existing._id, {
        ...args,
        provenance: keepProvenance,
        archetypeId: args.archetypeId ?? existing.archetypeId,
        extractedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("productCandidates", {
      ...args,
      extractedAt: Date.now(),
    });
  },
});

export const byUrl = internalQuery({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productCandidates")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
  },
});

export const byArchetype = internalQuery({
  args: { archetypeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productCandidates")
      .withIndex("by_archetypeId", (q) => q.eq("archetypeId", args.archetypeId))
      .take(6);
  },
});

export const get = query({
  args: { id: v.id("productCandidates") },
  handler: async (ctx, args) => await ctx.db.get("productCandidates", args.id),
});

/** How much real product data GRWM currently holds — shown in the UI footer. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("productCandidates").take(400);
    return {
      total: all.length,
      live: all.filter((p) => p.provenance === "context.dev").length,
      cached: all.filter((p) => p.provenance === "cached-context.dev").length,
    };
  },
});
