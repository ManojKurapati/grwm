import { v } from "convex/values";
import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { SEED_WARDROBE } from "./data/seedWardrobe";
import { CACHED_PRODUCTS } from "./data/cachedProducts";
import { ensureUser, DEMO_HANDLE } from "./users";

const DAY_MS = 86_400_000;

/**
 * Idempotent seeding.
 *
 * Called automatically the first time the app loads, so the demo can never open
 * onto an empty wardrobe. Safe to call repeatedly — it only fills in what is
 * missing, and never clobbers items the user uploaded themselves.
 */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ensureUser(ctx, "Dubai");

    const existing = await ctx.db
      .query("wardrobeItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(200);
    const existingSeedKeys = new Set(
      existing.filter((i) => i.source === "seed").map((i) => i.name),
    );

    const now = Date.now();
    let inserted = 0;
    for (const item of SEED_WARDROBE) {
      if (existingSeedKeys.has(item.name)) continue;
      await ctx.db.insert("wardrobeItems", {
        userId: user._id,
        name: item.name,
        imageUrl: item.imageUrl,
        spec: item.spec,
        aiDescription: item.aiDescription,
        availability: "available",
        wearCount: item.wearCount,
        lastWornAt: item.wearCountDaysAgo ? now - item.wearCountDaysAgo * DAY_MS : undefined,
        source: "seed",
        analysis: "done",
        createdAt: now,
      });
      inserted += 1;
    }

    // Pre-load the demo-safety product cache. These are genuine Context.dev
    // extractions captured earlier — `provenance` records that clearly.
    const cachedInserted = await seedProducts(ctx);

    return { userId: user._id, inserted, cachedProducts: cachedInserted };
  },
});

async function seedProducts(ctx: MutationCtx): Promise<number> {
  let inserted = 0;
  for (const product of CACHED_PRODUCTS) {
    const existing = await ctx.db
      .query("productCandidates")
      .withIndex("by_url", (q) => q.eq("url", product.url))
      .unique();
    if (existing) continue;
    await ctx.db.insert("productCandidates", { ...product, extractedAt: Date.now() });
    inserted += 1;
  }
  return inserted;
}

/** Wipe and re-seed. Handy while iterating; never called from the UI. */
export const reset = internalMutation({
  args: { includeUploads: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", DEMO_HANDLE))
      .unique();
    if (!user) return { deleted: 0 };

    let deleted = 0;
    const items = await ctx.db
      .query("wardrobeItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(500);
    for (const item of items) {
      if (item.source === "upload" && !args.includeUploads) continue;
      if (item.imageStorageId) await ctx.storage.delete(item.imageStorageId);
      await ctx.db.delete("wardrobeItems", item._id);
      deleted += 1;
    }
    return { deleted };
  },
});
