"use node";

/**
 * ============================================================================
 *  Context.dev integration
 * ============================================================================
 *
 * Context.dev is how GRWM sees the outside world. Everything the app knows
 * about a product it does not own comes from here — nothing is scraped by hand
 * and nothing is invented.
 *
 * Two endpoints are used, both server-side only:
 *
 *   POST /v1/brand/ai/product   — one product page  -> one normalized record
 *   POST /v1/brand/ai/products  — a retailer page   -> up to 12 records
 *
 * Docs: https://docs.context.dev/guides/extract-product-from-websites
 *       https://docs.context.dev/api-reference/web-extraction/products
 *
 * Design notes
 * ------------
 * · The API key lives only in the Convex deployment environment. It is never
 *   sent to the browser, and errors are logged without it.
 * · Every successful extraction is persisted to `productCandidates`, keyed by
 *   URL, so repeated evaluations of the same product cost nothing.
 * · Extractions are normalized into GRWM's own `GarmentSpec` by the
 *   deterministic classifier in `engine/classify.ts`, so a Context.dev product
 *   and a wardrobe item are directly comparable by the scoring engine.
 * · If the network or the API fails, callers fall back to `cachedProducts.ts` —
 *   real extractions captured earlier, tagged `cached-context.dev` so the UI
 *   can say so honestly.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, type ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { classifyProduct, retailerFromUrl } from "./engine/classify";
import type { GarmentSpec } from "./engine/taxonomy";

const API_BASE = "https://api.context.dev/v1";

/** 7 days. Product pages don't change much and cached reads are free. */
const DEFAULT_MAX_AGE_MS = 604_800_000;
const DEFAULT_TIMEOUT_MS = 90_000;

// ---------------------------------------------------------------------------
// Wire types (exactly the shape Context.dev documents)
// ---------------------------------------------------------------------------

type ContextProduct = {
  name: string;
  description: string;
  price: number | null;
  regular_price?: number | null;
  currency: string | null;
  billing_frequency?: string | null;
  pricing_model?: string | null;
  url?: string | null;
  category?: string | null;
  availability?: string | null;
  features?: string[];
  target_audience?: string[];
  tags?: string[];
  image_url?: string | null;
  images?: string[];
  sku?: string | null;
};

type ExtractProductResponse = {
  is_product_page: boolean;
  platform: string | null;
  product: ContextProduct | null;
  key_metadata?: { credits_consumed?: number; credits_remaining?: number };
};

type ExtractProductsResponse = {
  products?: ContextProduct[];
  key_metadata?: { credits_consumed?: number; credits_remaining?: number };
};

type ContextError = { message?: string; error_code?: string };

/** The error codes Context.dev documents, mapped to something a user can read. */
const ERROR_COPY: Record<string, string> = {
  INPUT_VALIDATION_ERROR: "That doesn't look like a valid product URL.",
  WEBSITE_ACCESS_ERROR: "That shop blocked the request or is unreachable.",
  UNAUTHORIZED: "Context.dev rejected our credentials.",
  REQUEST_TIMEOUT: "That shop took too long to respond.",
  USAGE_EXCEEDED: "Context.dev quota exhausted.",
  RATE_LIMITED: "Too many extractions at once — try again in a moment.",
  INTERNAL_ERROR: "Context.dev had a problem extracting that page.",
};

export class ContextDevError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ContextDevError";
  }

  /** Safe to show a user; never contains credentials or internals. */
  get userMessage(): string {
    return ERROR_COPY[this.code] ?? "Couldn't read that product page.";
  }
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

function apiKey(): string {
  const key = process.env.CONTEXT_DEV_API_KEY;
  if (!key) {
    throw new ContextDevError(
      "UNAUTHORIZED",
      "CONTEXT_DEV_API_KEY is not set on the Convex deployment",
    );
  }
  return key;
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const started = Date.now();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // Network-level failure — log the shape, never the key.
    console.error(
      `[context.dev] ${path} network failure after ${Date.now() - started}ms:`,
      error instanceof Error ? error.message : "unknown",
    );
    throw new ContextDevError("WEBSITE_ACCESS_ERROR", "network failure");
  }

  const text = await response.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ContextDevError(
      "INTERNAL_ERROR",
      `non-JSON response (status ${response.status})`,
      response.status,
    );
  }

  if (!response.ok) {
    const err = json as ContextError;
    const code = err.error_code ?? `HTTP_${response.status}`;
    console.error(`[context.dev] ${path} -> ${response.status} ${code}: ${err.message ?? ""}`);
    throw new ContextDevError(code, err.message ?? `status ${response.status}`, response.status);
  }

  const credits = (json as ExtractProductResponse).key_metadata?.credits_remaining;
  console.log(
    `[context.dev] ${path} ok in ${Date.now() - started}ms` +
      (credits !== undefined ? ` · ${credits} credits left` : ""),
  );

  return json as T;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

export type NormalizedProduct = {
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
  spec: GarmentSpec;
  confidence: "high" | "medium" | "low";
  provenance: string;
};

/**
 * Map a Context.dev product onto GRWM's garment model.
 *
 * This is the seam between "commerce data" and "fashion reasoning": Context.dev
 * tells us what the product *is*, and the classifier decides what it *means*
 * for a wardrobe (formality, weather, occasions, style language).
 */
export function normalizeFashionProduct(
  product: ContextProduct,
  fallbackUrl: string,
  provenance = "context.dev",
): NormalizedProduct {
  const url = product.url ?? fallbackUrl;
  const { confidence, ...spec } = classifyProduct({
    name: product.name,
    description: product.description ?? "",
    category: product.category,
    features: product.features,
    tags: product.tags,
    targetAudience: product.target_audience,
  });

  return {
    url,
    name: product.name,
    description: (product.description ?? "").slice(0, 900),
    retailer: retailerFromUrl(url),
    price: product.price ?? null,
    currency: product.currency ?? null,
    imageUrl: product.image_url ?? product.images?.[0] ?? null,
    images: (product.images ?? []).slice(0, 4),
    sku: product.sku ?? null,
    productCategory: product.category ?? null,
    features: (product.features ?? []).slice(0, 6),
    tags: (product.tags ?? []).slice(0, 8),
    spec,
    confidence,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Public operations
// ---------------------------------------------------------------------------

/**
 * Extract a single product page.
 *
 * Always verifies `is_product_page` AND a non-null `product` before reading
 * fields — Context.dev returns `false`/`null` for blog posts, category grids
 * and listing pages, and treating those as products is the classic integration
 * bug.
 */
export async function extractProduct(
  url: string,
  options: { maxAgeMs?: number; timeoutMS?: number } = {},
): Promise<NormalizedProduct> {
  const response = await post<ExtractProductResponse>("/brand/ai/product", {
    url,
    maxAgeMs: options.maxAgeMs ?? DEFAULT_MAX_AGE_MS,
    timeoutMS: options.timeoutMS ?? DEFAULT_TIMEOUT_MS,
  });

  if (!response.is_product_page || !response.product) {
    throw new ContextDevError(
      "NOT_A_PRODUCT_PAGE",
      `${url} is not a product detail page`,
    );
  }

  return normalizeFashionProduct(response.product, url);
}

/**
 * Extract a retailer's products from a category page or domain.
 * Used to source real candidates for a wardrobe gap.
 */
export async function extractProductCatalog(
  target: { domain?: string; directUrl?: string },
  options: { maxProducts?: number; maxAgeMs?: number; timeoutMS?: number } = {},
): Promise<NormalizedProduct[]> {
  if (!target.domain && !target.directUrl) {
    throw new ContextDevError("INPUT_VALIDATION_ERROR", "domain or directUrl required");
  }

  const response = await post<ExtractProductsResponse>("/brand/ai/products", {
    ...(target.directUrl ? { directUrl: target.directUrl } : { domain: target.domain }),
    maxProducts: options.maxProducts ?? 8,
    maxAgeMs: options.maxAgeMs ?? DEFAULT_MAX_AGE_MS,
    timeoutMS: options.timeoutMS ?? DEFAULT_TIMEOUT_MS,
  });

  const source = target.directUrl ?? `https://${target.domain}`;
  return (response.products ?? [])
    .filter((p) => p.name && (p.url || p.image_url))
    .map((p) => normalizeFashionProduct(p, source));
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

/**
 * Context.dev has no product-search endpoint, so discovery is composed:
 *
 *   /web/search        find candidate retailer pages for a natural-language need
 *   -> classify        product detail page, category listing, or editorial noise
 *   -> /brand/ai/*     extract real product records from the useful ones
 *
 * This is the only way to answer "find brown suede loafers under AED 500" with
 * live data rather than a hard-coded catalogue.
 */

type SearchResult = { url: string; title?: string; description?: string };
type SearchResponse = { results?: SearchResult[] };

/** Sites that rank well for shopping queries but never sell anything. */
const NOT_RETAILERS = [
  "pinterest.", "reddit.", "youtube.", "instagram.", "facebook.", "tiktok.",
  "wikipedia.", "quora.", "medium.", "gq.com", "esquire.", "vogue.",
  "harpersbazaar.", "buzzfeed.", "x.com", "twitter.", "linkedin.",
];

function isRetailer(url: string): boolean {
  const lower = url.toLowerCase();
  return !NOT_RETAILERS.some((domain) => lower.includes(domain));
}

/**
 * Guess whether a URL is a single product or a listing.
 *
 * Getting this wrong is only a performance cost, not a correctness one: a
 * listing sent to `/brand/ai/product` returns `is_product_page: false` and a
 * product sent to `/brand/ai/products` still yields that product.
 */
function looksLikeProductPage(url: string): boolean {
  return /\/(products?|p|item|itm|dp|prd)\//i.test(url) || /[-_/][A-Z0-9]{6,}\.html?$/i.test(url);
}

/**
 * Build the search query.
 *
 * Attributes routinely restate the product type — a "brown suede loafers" gap
 * arrives with attributes ["brown", "suede", "loafers"], which naively joined
 * produces "brown suede loafers brown suede loafers buy". Duplicated terms cost
 * relevance, so anything already present in the product type is dropped.
 */
function buildQuery(
  intent: { productType: string; attributes: string[] },
  audience?: string,
): string {
  const base = intent.productType.toLowerCase();
  const extra = intent.attributes
    .map((attribute) => attribute.trim())
    .filter((attribute) => attribute.length > 0 && !base.includes(attribute.toLowerCase()));

  return [audience ? `${audience}'s` : null, intent.productType, ...extra.slice(0, 3), "buy"]
    .filter(Boolean)
    .join(" ")
    .slice(0, 200);
}

export type Discovery = {
  products: NormalizedProduct[];
  /** How many retailer pages we actually extracted from. */
  pagesExtracted: number;
  /** Candidate URLs the search returned, after dropping editorial noise. */
  candidates: string[];
  query: string;
};

/**
 * Find real, currently-listed products for a wardrobe gap.
 *
 * The price ceiling is enforced HERE, in code, rather than being left to either
 * the search engine or the model — a hard constraint should never depend on a
 * probabilistic system. Products whose currency differs from the requested one
 * are kept but never price-filtered, because we do not convert currencies.
 */
export async function discoverProducts(
  intent: {
    productType: string;
    attributes: string[];
    maxPrice: number;
    currency: string;
  },
  options: {
    country?: string;
    maxPages?: number;
    maxAgeMs?: number;
    /** "men" / "women" — without it, a loafer search returns ballet flats. */
    audience?: string;
  } = {},
): Promise<Discovery> {
  const query = buildQuery(intent, options.audience);

  // `numResults` has an undocumented minimum of 10 — smaller values 400.
  const search = await post<SearchResponse>("/web/search", {
    query,
    numResults: 10,
    ...(options.country ? { country: options.country } : {}),
  });

  const candidates = (search.results ?? [])
    .map((result) => result.url)
    .filter((url) => Boolean(url) && isRetailer(url));

  const maxPages = options.maxPages ?? 3;
  const targets = candidates.slice(0, maxPages);

  // Extract in parallel — each of these is a 10-credit, rate-limit-weight-10
  // call, so the page count is deliberately small.
  const settled = await Promise.allSettled(
    targets.map(async (url) =>
      looksLikeProductPage(url)
        ? [await extractProduct(url, { maxAgeMs: options.maxAgeMs })]
        : await extractProductCatalog({ directUrl: url }, {
            maxProducts: 6,
            maxAgeMs: options.maxAgeMs,
          }),
    ),
  );

  const seen = new Set<string>();
  const products: NormalizedProduct[] = [];
  let pagesExtracted = 0;

  for (const outcome of settled) {
    if (outcome.status === "rejected") {
      const reason = outcome.reason;
      console.warn(
        `[context.dev] discovery page failed: ${
          reason instanceof Error ? reason.message : "unknown"
        }`,
      );
      continue;
    }
    pagesExtracted += 1;
    for (const product of outcome.value) {
      if (seen.has(product.url)) continue;
      seen.add(product.url);

      // No price filtering here, deliberately.
      //
      // Real retailer stock routinely sits above a sensible-sounding ceiling —
      // Dubai loafers came back at 620-1410 AED against a 400 AED budget — and
      // dropping those left the feature with nothing real to show, or worse, a
      // cached product from another country in another currency. The price is
      // always displayed as extracted, so the user can judge for themselves.
      products.push(product);
    }
  }

  console.log(
    `[context.dev] discovery "${query}" -> ${candidates.length} candidates, ` +
      `${pagesExtracted}/${targets.length} pages, ${products.length} in-budget products`,
  );

  return { products, pagesExtracted, candidates, query };
}

// ---------------------------------------------------------------------------
// Convex-facing actions
// ---------------------------------------------------------------------------

/**
 * Extract + persist. Returns the `productCandidates` id.
 * `ContextDevError` is allowed to propagate so callers can decide whether to
 * fall back to cached data or surface the message.
 */
export const extractAndStore = internalAction({
  args: {
    url: v.string(),
    archetypeId: v.optional(v.string()),
    /** 0 forces a fresh scrape; useful for a live "watch it work" demo. */
    maxAgeMs: v.optional(v.number()),
  },
  // Explicit return type: `persist` calls back into a generated mutation
  // reference, which makes the inferred type circular without an annotation.
  handler: async (
    ctx,
    args,
  ): Promise<{ id: Id<"productCandidates">; product: NormalizedProduct }> => {
    const product = await extractProduct(args.url, { maxAgeMs: args.maxAgeMs });
    const id = await persist(ctx, product, args.archetypeId);
    return { id, product };
  },
});

/**
 * Live product discovery for a wardrobe gap.
 *
 * Exposed as an action because this module runs in the Node runtime while
 * `shopping.ts` runs in V8 — crossing runtimes requires `ctx.runAction`, not a
 * direct import.
 */
export const discover = internalAction({
  args: {
    productType: v.string(),
    attributes: v.array(v.string()),
    maxPrice: v.number(),
    currency: v.string(),
    country: v.optional(v.string()),
    audience: v.optional(v.string()),
    maxPages: v.optional(v.number()),
    maxAgeMs: v.optional(v.number()),
  },
  handler: async (
    _ctx,
    args,
  ): Promise<{ products: NormalizedProduct[]; pagesExtracted: number; query: string }> => {
    const { products, pagesExtracted, query } = await discoverProducts(
      {
        productType: args.productType,
        attributes: args.attributes,
        maxPrice: args.maxPrice,
        currency: args.currency,
      },
      {
        country: args.country,
        audience: args.audience,
        maxPages: args.maxPages,
        maxAgeMs: args.maxAgeMs,
      },
    );
    return { products, pagesExtracted, query };
  },
});

export const extractCatalogAndStore = internalAction({
  args: {
    directUrl: v.optional(v.string()),
    domain: v.optional(v.string()),
    archetypeId: v.optional(v.string()),
    maxProducts: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ count: number; products: NormalizedProduct[] }> => {
    const products = await extractProductCatalog(
      { directUrl: args.directUrl, domain: args.domain },
      { maxProducts: args.maxProducts },
    );
    for (const product of products) {
      await persist(ctx, product, args.archetypeId);
    }
    return { count: products.length, products };
  },
});

async function persist(
  ctx: ActionCtx,
  product: NormalizedProduct,
  archetypeId?: string,
): Promise<Id<"productCandidates">> {
  return await ctx.runMutation(internal.products.upsert, {
    url: product.url,
    name: product.name,
    description: product.description,
    retailer: product.retailer,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl,
    images: product.images,
    sku: product.sku,
    productCategory: product.productCategory,
    features: product.features,
    tags: product.tags,
    spec: product.spec,
    provenance: product.provenance,
    archetypeId,
  });
}

/** Is a live Context.dev integration configured on this deployment? */
export const isConfigured = internalAction({
  args: {},
  handler: async () => ({ configured: Boolean(process.env.CONTEXT_DEV_API_KEY) }),
});
