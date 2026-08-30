import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * GRWM AI — Convex schema.
 *
 * Convex is the single source of truth for the whole product: wardrobe state,
 * garment imagery (File Storage), the learned style profile, every
 * recommendation session, Context.dev-extracted products and shopping verdicts.
 */

/** A garment as GRWM understands it. Shared by wardrobe items and by
 *  normalized external products, so the scoring engine can treat a candidate
 *  purchase exactly like something you already own. */
export const garmentSpec = v.object({
  category: v.string(), // top | bottom | shoes | layer | accessory
  subcategory: v.string(), // "linen shirt", "loafers", ...
  primaryColor: v.string(),
  secondaryColors: v.array(v.string()),
  material: v.optional(v.string()),
  pattern: v.optional(v.string()),
  styleTags: v.array(v.string()),
  formalityScore: v.number(), // 1..10
  seasonTags: v.array(v.string()), // spring | summer | autumn | winter
  weatherTags: v.array(v.string()), // hot | warm | mild | cool | cold | rain
  occasionTags: v.array(v.string()),
});

export const scoreBreakdown = v.object({
  occasion: v.number(),
  weather: v.number(),
  personalStyle: v.number(),
  colorHarmony: v.number(),
  comfort: v.number(),
  novelty: v.number(),
  personality: v.number(),
});

export const weatherContext = v.object({
  city: v.string(),
  country: v.optional(v.string()),
  temperatureC: v.number(),
  feelsLikeC: v.optional(v.number()),
  humidity: v.optional(v.number()),
  condition: v.string(), // "clear" | "cloudy" | "rain" | ...
  band: v.string(), // hot | warm | mild | cool | cold
  summary: v.string(), // "Warm · Humid"
  vibe: v.optional(v.string()), // "Rooftop-friendly"
  /** true when the live provider failed and we used the demo-safe fallback. */
  isFallback: v.boolean(),
  fetchedAt: v.number(),
});

const schema = defineSchema({
  users: defineTable({
    handle: v.string(), // "demo" for the seeded demo user
    displayName: v.string(),
    city: v.string(),
    isDemo: v.boolean(),
    createdAt: v.number(),
  }).index("by_handle", ["handle"]),

  /** Onboarding answers + the affinities GRWM learns from feedback. */
  styleProfiles: defineTable({
    userId: v.id("users"),
    preferredStyles: v.array(v.string()),
    preferredColors: v.array(v.string()),
    avoidColors: v.array(v.string()),
    presentation: v.optional(v.string()), // masc | fem | neutral
    zodiacSign: v.optional(v.string()),
    baseFormality: v.number(), // 1..10 resting formality preference
    /** learned weights, mutated by the feedback loop */
    styleAffinity: v.record(v.string(), v.number()),
    colorAffinity: v.record(v.string(), v.number()),
    categoryAffinity: v.record(v.string(), v.number()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  wardrobeItems: defineTable({
    userId: v.id("users"),
    name: v.string(),
    /** Convex File Storage id for user uploads. */
    imageStorageId: v.optional(v.id("_storage")),
    /** Static path under /public for seeded demo garments. */
    imageUrl: v.optional(v.string()),
    spec: garmentSpec,
    aiDescription: v.string(),
    availability: v.string(), // available | laundry | packed
    wearCount: v.number(),
    lastWornAt: v.optional(v.number()),
    /** P2: semantic retrieval. Optional so the MVP never depends on it. */
    embedding: v.optional(v.array(v.float64())),
    source: v.string(), // seed | upload
    analysis: v.optional(v.string()), // pending | done | failed
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_category", ["userId", "spec.category"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 256,
      filterFields: ["userId", "spec.category"],
    }),

  /** One row per generated recommendation request. */
  recommendationSessions: defineTable({
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
    status: v.string(), // ready | failed
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  outfits: defineTable({
    userId: v.id("users"),
    sessionId: v.id("recommendationSessions"),
    rank: v.number(), // 0 = the recommended fit, 1+ = "Try another"
    overallScore: v.number(),
    scoreBreakdown: scoreBreakdown,
    explanation: v.string(),
    reasons: v.array(
      v.object({ label: v.string(), score: v.number(), text: v.string() }),
    ),
    /** deterministic fingerprint of the item set, for novelty scoring */
    signature: v.string(),
    explanationSource: v.string(), // engine | llm
    wornAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_and_rank", ["sessionId", "rank"])
    .index("by_userId", ["userId"]),

  outfitItems: defineTable({
    outfitId: v.id("outfits"),
    itemId: v.id("wardrobeItems"),
    slot: v.string(), // top | bottom | shoes | layer | accessory
    order: v.number(),
  })
    .index("by_outfitId", ["outfitId"])
    .index("by_itemId", ["itemId"]),

  wearHistory: defineTable({
    userId: v.id("users"),
    itemId: v.id("wardrobeItems"),
    outfitId: v.optional(v.id("outfits")),
    wornAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_itemId", ["userId", "itemId"]),

  feedback: defineTable({
    userId: v.id("users"),
    outfitId: v.id("outfits"),
    verdict: v.string(), // wear | reject
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_outfitId", ["outfitId"]),

  /** Products extracted via Context.dev, normalized into GRWM's garment space.
   *  Cached here so repeated evaluations never re-hit the external API. */
  productCandidates: defineTable({
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
    /** GRWM's deterministic classification of the product. */
    spec: garmentSpec,
    /** "context.dev" for live extractions, "cached-context.dev" for the
     *  demo-safety snapshots captured from earlier real extractions. */
    provenance: v.string(),
    /** which archetype gap this product was sourced for, if any */
    archetypeId: v.optional(v.string()),
    extractedAt: v.number(),
  })
    .index("by_url", ["url"])
    .index("by_archetypeId", ["archetypeId"]),

  /** "Should I Buy This?" verdicts + Missing Piece compatibility results. */
  shoppingEvaluations: defineTable({
    userId: v.id("users"),
    productId: v.id("productCandidates"),
    sessionId: v.optional(v.id("recommendationSessions")),
    verdict: v.string(), // buy | maybe | skip
    wardrobeCompatibility: v.number(),
    newOutfitsUnlocked: v.number(),
    pairsWithCount: v.number(),
    occasionCoverageGain: v.array(v.string()),
    redundancyNote: v.union(v.string(), v.null()),
    headline: v.string(),
    reasons: v.array(v.string()),
    bestOutfitPreview: v.array(v.id("wardrobeItems")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_productId", ["userId", "productId"]),
});

export default schema;
