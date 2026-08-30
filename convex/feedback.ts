import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getProfile, requireDemoUser } from "./users";

/**
 * The feedback loop — "GRWM learns your style".
 *
 * Every 👍 / 👎 nudges affinity weights for the style tags, colours and
 * categories in that outfit. `scorePersonalStyle` reads those weights as a
 * multiplier, so approvals genuinely change what gets recommended next time
 * without ever overriding weather or occasion.
 */

/** How far a single vote can move one weight. */
const STEP = 0.5;
/** Weights are clamped so no amount of voting can dominate the hard constraints. */
const LIMIT = 3;

function nudge(
  map: Record<string, number>,
  keys: string[],
  direction: 1 | -1,
  step = STEP,
): Record<string, number> {
  const next = { ...map };
  for (const raw of keys) {
    const key = raw.trim().toLowerCase();
    if (!key) continue;
    const current = next[key] ?? 0;
    next[key] = Math.max(-LIMIT, Math.min(LIMIT, current + direction * step));
  }
  return next;
}

export const submit = mutation({
  args: {
    outfitId: v.id("outfits"),
    verdict: v.union(v.literal("wear"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    const user = await requireDemoUser(ctx);
    const outfit = await ctx.db.get("outfits", args.outfitId);
    if (!outfit || outfit.userId !== user._id) throw new Error("Outfit not found");

    // One vote per outfit — voting again replaces the previous verdict.
    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_outfitId", (q) => q.eq("outfitId", args.outfitId))
      .unique();

    if (existing?.verdict === args.verdict) return { changed: false };

    if (existing) {
      await ctx.db.patch("feedback", existing._id, {
        verdict: args.verdict,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("feedback", {
        userId: user._id,
        outfitId: args.outfitId,
        verdict: args.verdict,
        createdAt: Date.now(),
      });
    }

    // --- learn -----------------------------------------------------------
    const links = await ctx.db
      .query("outfitItems")
      .withIndex("by_outfitId", (q) => q.eq("outfitId", args.outfitId))
      .take(10);

    const styleTags: string[] = [];
    const colors: string[] = [];
    const categories: string[] = [];
    for (const link of links) {
      const item = await ctx.db.get("wardrobeItems", link.itemId);
      if (!item) continue;
      styleTags.push(...item.spec.styleTags);
      colors.push(item.spec.primaryColor, ...item.spec.secondaryColors);
      categories.push(item.spec.category);
    }

    const profile = await getProfile(ctx, user._id);
    const direction = args.verdict === "wear" ? 1 : -1;

    // If the user is reversing an earlier vote, undo it first so the profile
    // doesn't keep the effect of a decision they changed their mind about.
    let styleAffinity = profile.styleAffinity;
    let colorAffinity = profile.colorAffinity;
    let categoryAffinity = profile.categoryAffinity;

    if (existing) {
      const undo = existing.verdict === "wear" ? -1 : 1;
      styleAffinity = nudge(styleAffinity, styleTags, undo);
      colorAffinity = nudge(colorAffinity, colors, undo);
      categoryAffinity = nudge(categoryAffinity, categories, undo, STEP / 2);
    }

    await ctx.db.patch("styleProfiles", profile._id, {
      styleAffinity: nudge(styleAffinity, styleTags, direction),
      colorAffinity: nudge(colorAffinity, colors, direction),
      categoryAffinity: nudge(categoryAffinity, categories, direction, STEP / 2),
      updatedAt: Date.now(),
    });

    return { changed: true };
  },
});

/**
 * What GRWM has learned so far — surfaced in the UI so the learning is visible
 * rather than a claim on a slide.
 */
export const learned = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", "demo"))
      .unique();
    if (!user) return { votes: 0, up: [], down: [] };

    const profile = await ctx.db
      .query("styleProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const votes = await ctx.db
      .query("feedback")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    if (!profile) return { votes: votes.length, up: [], down: [] };

    const entries = [
      ...Object.entries(profile.styleAffinity),
      ...Object.entries(profile.colorAffinity),
    ].filter(([, weight]) => Math.abs(weight) >= STEP);

    const sorted = entries.sort((a, b) => b[1] - a[1]);

    return {
      votes: votes.length,
      up: sorted.filter(([, w]) => w > 0).slice(0, 5).map(([tag, weight]) => ({ tag, weight })),
      down: sorted.filter(([, w]) => w < 0).slice(-5).reverse().map(([tag, weight]) => ({ tag, weight })),
    };
  },
});
