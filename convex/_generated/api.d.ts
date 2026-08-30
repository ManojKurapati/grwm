/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as contextDev from "../contextDev.js";
import type * as data_cachedProducts from "../data/cachedProducts.js";
import type * as data_seedWardrobe from "../data/seedWardrobe.js";
import type * as engine_archetypes from "../engine/archetypes.js";
import type * as engine_classify from "../engine/classify.js";
import type * as engine_compatibility from "../engine/compatibility.js";
import type * as engine_fallbackRecommendationEngine from "../engine/fallbackRecommendationEngine.js";
import type * as engine_gaps from "../engine/gaps.js";
import type * as engine_intent from "../engine/intent.js";
import type * as engine_measure from "../engine/measure.js";
import type * as engine_taxonomy from "../engine/taxonomy.js";
import type * as feedback from "../feedback.js";
import type * as gemini from "../gemini.js";
import type * as products from "../products.js";
import type * as recommend from "../recommend.js";
import type * as recommendation from "../recommendation.js";
import type * as seed from "../seed.js";
import type * as shopping from "../shopping.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";
import type * as wardrobe from "../wardrobe.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  contextDev: typeof contextDev;
  "data/cachedProducts": typeof data_cachedProducts;
  "data/seedWardrobe": typeof data_seedWardrobe;
  "engine/archetypes": typeof engine_archetypes;
  "engine/classify": typeof engine_classify;
  "engine/compatibility": typeof engine_compatibility;
  "engine/fallbackRecommendationEngine": typeof engine_fallbackRecommendationEngine;
  "engine/gaps": typeof engine_gaps;
  "engine/intent": typeof engine_intent;
  "engine/measure": typeof engine_measure;
  "engine/taxonomy": typeof engine_taxonomy;
  feedback: typeof feedback;
  gemini: typeof gemini;
  products: typeof products;
  recommend: typeof recommend;
  recommendation: typeof recommendation;
  seed: typeof seed;
  shopping: typeof shopping;
  uploads: typeof uploads;
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
