import { v } from "convex/values";
import { mutation, query, internalQuery, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { garmentSpec } from "./schema";
import { getProfile, requireDemoUser } from "./users";

/**
 * Wardrobe state.
 *
 * Images live in Convex File Storage for uploads; seeded demo garments are
 * rendered from their attributes by the illustration system instead, so the
 * wardrobe always draws even with no network.
 */

export type WardrobeItemView = Doc<"wardrobeItems"> & { imageSrc: string | null };

async function withImages(
  ctx: QueryCtx,
  items: Doc<"wardrobeItems">[],
): Promise<WardrobeItemView[]> {
  return await Promise.all(
    items.map(async (item) => ({
      ...item,
      imageSrc: item.imageStorageId
        ? await ctx.storage.getUrl(item.imageStorageId)
        : (item.imageUrl ?? null),
    })),
  );
}

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", "demo"))
      .unique();
    if (!user) return [];

    const items =
      args.category && args.category !== "all"
        ? await ctx.db
            .query("wardrobeItems")
            .withIndex("by_userId_and_category", (q) =>
              q.eq("userId", user._id).eq("spec.category", args.category!),
            )
            .take(300)
        : await ctx.db
            .query("wardrobeItems")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .take(300);

    return await withImages(ctx, items);
  },
});

export const get = query({
  args: { id: v.id("wardrobeItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get("wardrobeItems", args.id);
    if (!item) return null;
    const [view] = await withImages(ctx, [item]);
    return view;
  },
});

/** Counts per category, for the filter bar. */
export const counts = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", "demo"))
      .unique();
    if (!user) return { all: 0, top: 0, bottom: 0, shoes: 0, layer: 0, accessory: 0 };

    const items = await ctx.db
      .query("wardrobeItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(300);

    const counts: Record<string, number> = {
      all: items.length,
      top: 0,
      bottom: 0,
      shoes: 0,
      layer: 0,
      accessory: 0,
    };
    for (const item of items) {
      counts[item.spec.category] = (counts[item.spec.category] ?? 0) + 1;
    }
    return counts;
  },
});

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireDemoUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create an item from an upload. The garment attributes are filled in
 * immediately with a sensible placeholder so the wardrobe never shows a
 * half-built card, then refined by `ai.analyzeGarment` (which itself falls back
 * to deterministic defaults when no vision model is configured).
 */
export const addUploaded = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.optional(v.string()),
    spec: v.optional(garmentSpec),
  },
  handler: async (ctx, args) => {
    const user = await requireDemoUser(ctx);
    const now = Date.now();

    const spec = args.spec ?? {
      category: "top",
      subcategory: "shirt",
      primaryColor: "neutral",
      secondaryColors: [],
      pattern: "solid",
      styleTags: ["minimal"],
      formalityScore: 5,
      seasonTags: ["all-season"],
      weatherTags: ["mild", "warm"],
      occasionTags: ["casual"],
    };

    return await ctx.db.insert("wardrobeItems", {
      userId: user._id,
      name: args.name ?? "New piece",
      imageStorageId: args.storageId,
      spec,
      aiDescription: "",
      availability: "available",
      wearCount: 0,
      source: "upload",
      analysis: args.spec ? "done" : "pending",
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("wardrobeItems"),
    name: v.optional(v.string()),
    spec: v.optional(garmentSpec),
    availability: v.optional(v.string()),
    aiDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDemoUser(ctx);
    const item = await ctx.db.get("wardrobeItems", args.id);
    if (!item || item.userId !== user._id) throw new Error("Item not found");

    const { id, ...patch } = args;
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch("wardrobeItems", id, { ...clean, analysis: "done" });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("wardrobeItems") },
  handler: async (ctx, args) => {
    const user = await requireDemoUser(ctx);
    const item = await ctx.db.get("wardrobeItems", args.id);
    if (!item || item.userId !== user._id) throw new Error("Item not found");
    if (item.imageStorageId) await ctx.storage.delete(item.imageStorageId);
    await ctx.db.delete("wardrobeItems", args.id);
    return null;
  },
});

/** Mark a whole outfit as worn — feeds wear history and novelty scoring. */
export const markWorn = mutation({
  args: { outfitId: v.id("outfits") },
  handler: async (ctx, args) => {
    const user = await requireDemoUser(ctx);
    const outfit = await ctx.db.get("outfits", args.outfitId);
    if (!outfit || outfit.userId !== user._id) throw new Error("Outfit not found");

    const links = await ctx.db
      .query("outfitItems")
      .withIndex("by_outfitId", (q) => q.eq("outfitId", args.outfitId))
      .take(10);

    const now = Date.now();
    for (const link of links) {
      const item = await ctx.db.get("wardrobeItems", link.itemId);
      if (!item) continue;
      await ctx.db.patch("wardrobeItems", link.itemId, {
        wearCount: item.wearCount + 1,
        lastWornAt: now,
      });
      await ctx.db.insert("wearHistory", {
        userId: user._id,
        itemId: link.itemId,
        outfitId: args.outfitId,
        wornAt: now,
      });
    }
    await ctx.db.patch("outfits", args.outfitId, { wornAt: now });
    return null;
  },
});

// ---------------------------------------------------------------------------
// Engine bridge
// ---------------------------------------------------------------------------

/**
 * Everything the engine needs, in a single transactional read.
 * Actions call this once rather than issuing several queries, so the wardrobe
 * they reason about can never be a mix of two different points in time.
 */
export const engineSnapshot = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await requireDemoUser(ctx);
    const profile = await getProfile(ctx, user._id);
    const items = await ctx.db
      .query("wardrobeItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(300);

    return {
      userId: user._id,
      city: user.city,
      profile,
      items,
    };
  },
});
