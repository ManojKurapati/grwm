/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as contextDev from "../contextDev.js";
import type * as data_cachedProducts from "../data/cachedProducts.js";
import type * as data_seedWardrobe from "../data/seedWardrobe.js";
import type * as engine_archetypes from "../engine/archetypes.js";
import type * as engine_classify from "../engine/classify.js";
import type * as engine_compatibility from "../engine/compatibility.js";
import type * as engine_explain from "../engine/explain.js";
import type * as engine_gaps from "../engine/gaps.js";
import type * as engine_intent from "../engine/intent.js";
import type * as engine_outfits from "../engine/outfits.js";
import type * as engine_score from "../engine/score.js";
import type * as engine_taxonomy from "../engine/taxonomy.js";
import type * as feedback from "../feedback.js";
import type * as products from "../products.js";
import type * as recommend from "../recommend.js";
import type * as seed from "../seed.js";
import type * as shopping from "../shopping.js";
import type * as users from "../users.js";
import type * as wardrobe from "../wardrobe.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  contextDev: typeof contextDev;
  "data/cachedProducts": typeof data_cachedProducts;
  "data/seedWardrobe": typeof data_seedWardrobe;
  "engine/archetypes": typeof engine_archetypes;
  "engine/classify": typeof engine_classify;
  "engine/compatibility": typeof engine_compatibility;
  "engine/explain": typeof engine_explain;
  "engine/gaps": typeof engine_gaps;
  "engine/intent": typeof engine_intent;
  "engine/outfits": typeof engine_outfits;
  "engine/score": typeof engine_score;
  "engine/taxonomy": typeof engine_taxonomy;
  feedback: typeof feedback;
  products: typeof products;
  recommend: typeof recommend;
  seed: typeof seed;
  shopping: typeof shopping;
  users: typeof users;
  wardrobe: typeof wardrobe;
  weather: typeof weather;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
