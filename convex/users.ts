import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { SEED_PROFILE } from "./data/seedWardrobe";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * GRWM's MVP is intentionally single-player: one demo identity, no auth
 * ceremony. The schema is already multi-user (everything is keyed by userId),
 * so real auth is a drop-in later — but a hackathon demo should never open on
 * a login screen.
 */
export const DEMO_HANDLE = "demo";

export async function requireDemoUser(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await ctx.db
    .query("users")
    .withIndex("by_handle", (q) => q.eq("handle", DEMO_HANDLE))
    .unique();
  if (!user) throw new Error("Demo user not found — run the seed first.");
  return user;
}

export async function getProfile(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"styleProfiles">> {
  const profile = await ctx.db
    .query("styleProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!profile) throw new Error("Style profile not found — run the seed first.");
  return profile;
}

export async function ensureUser(
  ctx: MutationCtx,
  city: string,
): Promise<Doc<"users">> {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_handle", (q) => q.eq("handle", DEMO_HANDLE))
    .unique();
  if (existing) return existing;

  const userId = await ctx.db.insert("users", {
    handle: DEMO_HANDLE,
    displayName: "You",
    city,
    isDemo: true,
    createdAt: Date.now(),
  });
  await ctx.db.insert("styleProfiles", {
    userId,
    preferredStyles: SEED_PROFILE.preferredStyles,
    preferredColors: SEED_PROFILE.preferredColors,
    avoidColors: SEED_PROFILE.avoidColors,
    presentation: SEED_PROFILE.presentation,
    zodiacSign: SEED_PROFILE.zodiacSign,
    baseFormality: SEED_PROFILE.baseFormality,
    styleAffinity: {},
    colorAffinity: {},
    categoryAffinity: {},
    updatedAt: Date.now(),
  });
  const user = await ctx.db.get("users", userId);
  if (!user) throw new Error("Failed to create demo user");
  return user;
}

/** Everything the client needs to render the shell. */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_handle", (q) => q.eq("handle", DEMO_HANDLE))
      .unique();
    if (!user) return null;
    const profile = await ctx.db
      .query("styleProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const itemCount = (
      await ctx.db
        .query("wardrobeItems")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .take(500)
    ).length;
    return { user, profile, itemCount };
  },
});

export const updateProfile = mutation({
  args: {
    city: v.optional(v.string()),
    preferredStyles: v.optional(v.array(v.string())),
    preferredColors: v.optional(v.array(v.string())),
    avoidColors: v.optional(v.array(v.string())),
    presentation: v.optional(v.string()),
    zodiacSign: v.optional(v.string()),
    baseFormality: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireDemoUser(ctx);
    const profile = await getProfile(ctx, user._id);

    if (args.city) await ctx.db.patch("users", user._id, { city: args.city });

    const patch: Partial<Doc<"styleProfiles">> = { updatedAt: Date.now() };
    if (args.preferredStyles) patch.preferredStyles = args.preferredStyles;
    if (args.preferredColors) patch.preferredColors = args.preferredColors;
    if (args.avoidColors) patch.avoidColors = args.avoidColors;
    if (args.presentation !== undefined) patch.presentation = args.presentation;
    if (args.zodiacSign !== undefined) patch.zodiacSign = args.zodiacSign;
    if (args.baseFormality !== undefined) patch.baseFormality = args.baseFormality;

    await ctx.db.patch("styleProfiles", profile._id, patch);
    return null;
  },
});
