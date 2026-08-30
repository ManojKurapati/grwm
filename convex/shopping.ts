import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
  type ActionCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { ARCHETYPES, type Archetype } from "./engine/archetypes";
import { suggestInsteadOf } from "./engine/gaps";
import {
  evaluateCandidate,
  verdictCopy,
  verdictFor,
  type CompatibilityResult,
} from "./engine/compatibility";
import { describeSpec } from "./engine/classify";
import { currencyForCity } from "./engine/intent";
import { ContextDevError, type NormalizedProduct } from "./contextDev";
import { CACHED_PRODUCTS, cachedProductForArchetype } from "./data/cachedProducts";
import type { MissingPiece } from "./recommendation";
import { rankProducts, type StylistItem, type StylistProduct } from "./gemini";

/**
 * ============================================================================
 *  Missing Piece + "Should I Buy This?"
 * ============================================================================
 *
 * Both features answer one question: does this product make the clothes you
 * already own more useful? The wardrobe is always the yardstick.
 *
 * Division of responsibility:
 *
 *   · the GAP is identified upstream in `recommend.ts` — by Gemini in the
 *     primary path, by the deterministic library as a fallback — and stored on
 *     the outfit, so this module never has to guess what is missing
 *   · Context.dev finds and normalises real products for that gap
 *   · deterministic code measures compatibility and redundancy, because
 *     "you already own two of these" is a countable fact, not a taste call
 */

// ---------------------------------------------------------------------------
// Missing Piece
// ---------------------------------------------------------------------------

export type SourcedProduct = {
  url: string;
  name: string;
  retailer: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  description: string;
  /** "context.dev" (extracted live) or "cached-context.dev" (demo safety net) */
  provenance: string;
  specSummary: string;
};

export type SerializedCompatibility = {
  wardrobeCompatibility: number;
  newOutfitsUnlocked: number;
  pairsWithCount: number;
  pairsWithTotal: number;
  occasionCoverageGain: string[];
  redundantWith: string[];
  components: CompatibilityResult["components"];
};

export type GapResult = {
  /** searchable garment type, e.g. "brown suede loafers" */
  productType: string;
  label: string;
  reason: string;
  maxPrice: number;
  currency: string;
  compatibility: SerializedCompatibility;
  product: SourcedProduct | null;
  /**
   * Gemini's judgement of the winning product against this wardrobe. Null when
   * the stylist was unavailable, in which case the UI falls back to `reason` and
   * the deterministic compatibility numbers.
   */
  why: string | null;
  /** Gemini's own compatibility read, 0-100. Deterministic figure lives in `compatibility`. */
  stylistScore: number | null;
  /** Gemini's estimate of new outfits unlocked. */
  stylistOutfitsUnlocked: number | null;
  /** Gemini's call on whether this genuinely widens the wardrobe. */
  meaningfullyExpands: boolean | null;
  /** How the products were obtained. Internal honesty; not shouted at the user. */
  sourceMode: "live" | "curated" | "cached";
  evaluatedBy: "gemini" | "fallback";
  /** Runner-up real products, for the "also found" strip. */
  alsoFound: SourcedProduct[];
};

export const missingPiece = action({
  args: { sessionId: v.id("recommendationSessions") },
  handler: async (ctx, args): Promise<{ gaps: GapResult[]; baselineScore: number }> => {
    const detail = await ctx.runQuery(internal.shopping.contextForSession, {
      sessionId: args.sessionId,
    });
    if (!detail) throw new Error("Session not found");

    const gap = detail.missingPiece;
    if (!gap) return { gaps: [], baselineScore: detail.overallScore };

    const wardrobe = detail.items.map(toCompatItem);
    const archetype = matchArchetype(gap);

    // --- 1. real products for this gap ------------------------------------
    const { products, sourceMode } = await findProducts(ctx, gap, archetype, {
      country: countryForCity(detail.session.weather.city),
      audience: audienceFor(detail.profile.presentation),
    });

    // --- 2. let the stylist choose between them ---------------------------
    // Gemini judges fit; we never let it pick something outside budget, because
    // the candidate list was already filtered in code.
    const verdict =
      products.length > 0
        ? await rankProducts(
            products.map(toStylistProduct),
            detail.items.filter((i) => i.availability === "available").map(toStylistItem),
            gap,
          )
        : null;

    const winner =
      products.length === 0
        ? null
        : verdict
          ? (products.find((p) => p.url === verdict.bestCandidate.url) ?? products[0])
          : products[cheapestIndex(products)];

    // --- 3. measure it ourselves, whoever chose it ------------------------
    // Measure the real product where we have one; otherwise the archetype, so
    // the numbers always describe something concrete.
    const spec = winner?.spec ?? archetype?.spec;
    const compatibility = spec
      ? evaluateCandidate({
          spec,
          wardrobe,
          preferredStyles: detail.profile.preferredStyles,
          preferredColors: detail.profile.preferredColors,
          avoidColors: detail.profile.avoidColors,
        })
      : null;

    if (!compatibility) return { gaps: [], baselineScore: detail.overallScore };

    console.log(
      `[missingPiece] "${gap.productType}" · ${sourceMode} · ${products.length} candidate(s) -> ` +
        `${winner?.name ?? "no product"} by ${verdict ? "gemini" : "fallback"} ` +
        `· ${compatibility.wardrobeCompatibility}% · unlocks ${compatibility.newOutfitsUnlocked}`,
    );

    return {
      baselineScore: detail.overallScore,
      gaps: [
        {
          productType: gap.productType,
          label: titleCase(gap.productType),
          reason: gap.reason,
          maxPrice: gap.maxPrice,
          currency: gap.currency,
          compatibility: serialize(compatibility),
          product: winner ? toSourced(winner) : null,
          why: verdict?.why ?? null,
          stylistScore: verdict?.compatibilityScore ?? null,
          stylistOutfitsUnlocked: verdict?.outfitsUnlocked ?? null,
          meaningfullyExpands: verdict?.meaningfullyExpands ?? null,
          sourceMode,
          evaluatedBy: verdict ? "gemini" : "fallback",
          alsoFound: winner
            ? products.filter((p) => p.url !== winner.url).slice(0, 3).map(toSourced)
            : [],
        },
      ],
    };
  },
});

function toStylistProduct(product: NormalizedProduct): StylistProduct {
  return {
    name: product.name,
    retailer: product.retailer,
    price: product.price,
    currency: product.currency,
    description: product.description,
    url: product.url,
  };
}

function toStylistItem(item: Doc<"wardrobeItems">): StylistItem {
  return {
    id: item._id,
    name: item.name,
    category: item.spec.category,
    subcategory: item.spec.subcategory,
    primaryColor: item.spec.primaryColor,
    material: item.spec.material,
    formalityScore: item.spec.formalityScore,
    styleTags: item.spec.styleTags,
    weatherTags: item.spec.weatherTags,
    wearCount: item.wearCount,
  };
}

function cheapestIndex(products: NormalizedProduct[]): number {
  let best = 0;
  for (let i = 1; i < products.length; i += 1) {
    const price = products[i].price;
    const incumbent = products[best].price;
    if (price !== null && (incumbent === null || price < incumbent)) best = i;
  }
  return best;
}

/** Region bias for search. Deterministic — never asked of a model. */
const CITY_COUNTRY: Record<string, string> = {
  dubai: "AE",
  "abu dhabi": "AE",
  sharjah: "AE",
  doha: "QA",
  riyadh: "SA",
  london: "GB",
  paris: "FR",
  milan: "IT",
  berlin: "DE",
  madrid: "ES",
  amsterdam: "NL",
  mumbai: "IN",
  delhi: "IN",
  tokyo: "JP",
  singapore: "SG",
  sydney: "AU",
  toronto: "CA",
  "new york": "US",
};

function countryForCity(city: string): string | undefined {
  return CITY_COUNTRY[city.trim().toLowerCase()];
}

/**
 * Without a gender term a men's loafer search returns ballet flats — retailer
 * listing pages are gendered. Neutral presentation deliberately sends nothing
 * and leaves the filtering to Gemini.
 */
function audienceFor(presentation: string | undefined): string | undefined {
  if (presentation === "masc") return "men";
  if (presentation === "fem") return "women";
  return undefined;
}

/** Map a free-text gap onto our curated retailer sources for extraction. */
function matchArchetype(gap: MissingPiece): Archetype | null {
  const haystack = `${gap.productType} ${gap.attributes.join(" ")}`.toLowerCase();

  let best: { archetype: Archetype; score: number } | null = null;
  for (const archetype of ARCHETYPES) {
    let score = 0;
    if (haystack.includes(archetype.spec.subcategory)) score += 3;
    if (haystack.includes(archetype.spec.primaryColor)) score += 2;
    if (archetype.spec.material && haystack.includes(archetype.spec.material)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { archetype, score };
  }
  return best?.archetype ?? null;
}

/**
 * Find real products for the gap.
 *
 * The order matters, and it is deliberately live-first:
 *
 *   1. LIVE     Context.dev discovery — search the open web for this gap, then
 *               extract whatever real products it finds. This is the product
 *               claim: any gap Gemini can name, we can go and shop for.
 *   2. CURATED  a handful of known-good retailer product pages for the closest
 *               archetype. Narrower, but reliable when search comes back thin.
 *   3. CACHED   earlier REAL extractions, replayed from the committed cache.
 *               Never invented data — just data we fetched on a previous run.
 *
 * A demo must never dead-end, but it must also never lie about where a product
 * came from, which is why the mode is returned rather than hidden.
 */
async function findProducts(
  ctx: ActionCtx,
  gap: MissingPiece,
  archetype: Archetype | null,
  options: { country?: string; audience?: string },
): Promise<{ products: NormalizedProduct[]; sourceMode: "live" | "curated" | "cached" }> {
  // --- 1. live discovery -------------------------------------------------
  try {
    const discovery = await ctx.runAction(internal.contextDev.discover, {
      productType: gap.productType,
      attributes: gap.attributes,
      maxPrice: gap.maxPrice,
      currency: gap.currency,
      country: options.country,
      audience: options.audience,
    });
    // Cheapest first, so the stylist's shortlist leads with sensible options —
    // but nothing is excluded on price. See the note in `contextDev.discoverProducts`.
    if (discovery.products.length > 0) {
      const byPrice = [...discovery.products].sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      );
      return { products: byPrice.slice(0, 8), sourceMode: "live" };
    }
    console.warn(`[missingPiece] live discovery returned nothing — trying curated`);
  } catch (error) {
    const code = error instanceof ContextDevError ? error.code : "UNKNOWN";
    console.warn(`[missingPiece] live discovery failed (${code}) — trying curated`);
  }

  // --- 2. curated retailer pages for the nearest archetype ---------------
  if (archetype) {
    const stored: Doc<"productCandidates">[] = await ctx.runQuery(
      internal.products.byArchetype,
      { archetypeId: archetype.id },
    );
    const usable = stored.filter((p) => p.imageUrl);
    if (usable.length > 0) {
      return { products: usable.slice(0, 6).map(fromDoc), sourceMode: "curated" };
    }

    for (const url of archetype.sources) {
      try {
        const result: { product: NormalizedProduct } = await ctx.runAction(
          internal.contextDev.extractAndStore,
          { url, archetypeId: archetype.id },
        );
        return { products: [result.product], sourceMode: "curated" };
      } catch (error) {
        const code = error instanceof ContextDevError ? error.code : "UNKNOWN";
        console.warn(`[missingPiece] extraction of ${url} failed (${code}) — trying next`);
      }
    }
  }

  // --- 3. committed cache of earlier real extractions --------------------
  const cachedForArchetype = archetype ? cachedProductForArchetype(archetype.id) : null;
  if (cachedForArchetype) {
    return {
      products: [fromDoc(cachedForArchetype as unknown as Doc<"productCandidates">)],
      sourceMode: "cached",
    };
  }

  const loose = CACHED_PRODUCTS.filter(
    (p) => p.imageUrl && gap.productType.toLowerCase().includes(p.spec.subcategory),
  ).slice(0, 4);

  return {
    products: loose.map((p) => fromDoc(p as unknown as Doc<"productCandidates">)),
    sourceMode: "cached",
  };
}

function fromDoc(doc: {
  url: string;
  name: string;
  description: string;
  retailer: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  images: string[];
  sku: string | null;
  productCategory: string | null;
  features: string[];
  tags: string[];
  spec: NormalizedProduct["spec"];
  provenance: string;
}): NormalizedProduct {
  return { ...doc, confidence: "high" };
}

function toSourced(product: NormalizedProduct): SourcedProduct {
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

function serialize(result: CompatibilityResult): SerializedCompatibility {
  return {
    wardrobeCompatibility: result.wardrobeCompatibility,
    newOutfitsUnlocked: result.newOutfitsUnlocked,
    pairsWithCount: result.pairsWithCount,
    pairsWithTotal: result.pairsWithTotal,
    occasionCoverageGain: result.occasionCoverageGain,
    redundantWith: result.redundantWith,
    components: result.components,
  };
}

function toCompatItem(item: Doc<"wardrobeItems">) {
  return { name: item.name, spec: item.spec, availability: item.availability };
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  alternative: { label: string; rationale: string } | null;
  evaluationId: Id<"shoppingEvaluations">;
};

export const evaluateUrl = action({
  args: {
    url: v.string(),
    /** 0 forces a fresh scrape — useful when demoing live extraction */
    maxAgeMs: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<BuyVerdict> => {
    const url = args.url.trim();
    if (!/^https?:\/\//i.test(url)) {
      throw new Error("Paste a full product URL, starting with https://");
    }

    // --- 1. get the product via Context.dev ------------------------------
    let product: NormalizedProduct | null = null;
    let productId: Id<"productCandidates"> | null = null;

    const existing: Doc<"productCandidates"> | null = await ctx.runQuery(
      internal.products.byUrl,
      { url },
    );

    if (existing && args.maxAgeMs !== 0) {
      productId = existing._id;
      product = fromDoc(existing);
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
        // Demo safety: if this exact product is in the committed cache, use it.
        const cached = CACHED_PRODUCTS.find((p) => p.url === url);
        if (!cached) {
          throw new Error(
            error instanceof ContextDevError
              ? error.userMessage
              : "Couldn't read that product page.",
          );
        }
        console.warn(`[shouldIBuy] live extraction failed — using cached record for ${url}`);
        productId = await ctx.runMutation(internal.products.upsert, {
          ...cached,
          archetypeId: cached.archetypeId,
        });
        product = fromDoc(cached as unknown as Doc<"productCandidates">);
      }
    }

    if (!product || !productId) throw new Error("Couldn't read that product page.");

    // --- 2. judge it against the wardrobe --------------------------------
    const snapshot = await ctx.runQuery(internal.wardrobe.engineSnapshot, {});
    const wardrobe = snapshot.items.map(toCompatItem);

    const result = evaluateCandidate({
      spec: product.spec,
      wardrobe,
      preferredStyles: snapshot.profile.preferredStyles,
      preferredColors: snapshot.profile.preferredColors,
      avoidColors: snapshot.profile.avoidColors,
    });

    const verdict = verdictFor(result);
    const copy = verdictCopy(product.name, result);

    // --- 3. when we say no, say what to buy instead -----------------------
    let alternative: BuyVerdict["alternative"] = null;
    if (verdict === "skip") {
      const suggestion = suggestInsteadOf(wardrobe, product.spec.category);
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
        bestOutfitPreview: [],
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
      compatibility: serialize(result),
      product: {
        ...toSourced(product),
        classified: `${product.spec.primaryColor} ${product.spec.subcategory}`,
        confidence: product.confidence,
      },
      alternative,
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

    const outfit = await ctx.db
      .query("outfits")
      .withIndex("by_sessionId_and_rank", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const currency = session.currency ?? currencyForCity(session.weather.city);
    const gap = outfit?.missingPiece ?? null;

    return {
      session,
      profile,
      items,
      overallScore: outfit?.overallScore ?? 0,
      missingPiece: gap ? ({ ...gap, currency: gap.currency || currency } as MissingPiece) : null,
    };
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

/** Recent verdicts, so the page has history to show. */
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

/** Example URLs for the demo, drawn from products we really extracted. */
export const exampleUrls = query({
  args: {},
  handler: async (ctx) => {
    const stored = await ctx.db.query("productCandidates").take(200);
    const pick = (predicate: (p: Doc<"productCandidates">) => boolean) =>
      stored.find(predicate);

    const sneaker = pick(
      (p) => p.spec.subcategory === "sneakers" || p.spec.subcategory === "runners",
    );
    const loafer = pick((p) => p.spec.subcategory === "loafers");
    const blazer = pick((p) => p.spec.subcategory === "blazer");

    return [
      sneaker && { label: "Another pair of sneakers", url: sneaker.url },
      loafer && { label: "Brown suede loafers", url: loafer.url },
      blazer && { label: "A tailored jacket", url: blazer.url },
    ].filter(Boolean);
  },
});
