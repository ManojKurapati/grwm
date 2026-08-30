"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { analyzeGarment, hasGemini } from "./gemini";
import { classifyProduct } from "./engine/classify";

/**
 * Garment analysis for uploads.
 *
 * PRIMARY   Gemini vision — reads the photo into structured attributes
 * FALLBACK  deterministic classification from the item's name/filename
 *
 * The fallback is genuinely useful rather than a stub: "cream linen shirt.jpg"
 * yields the right category, colour, material and formality through the same
 * classifier that normalises Context.dev products. Either way the user can edit
 * everything afterwards, and an upload never blocks on the model.
 */
export const analyze = action({
  args: { itemId: v.id("wardrobeItems") },
  handler: async (
    ctx,
    args,
  ): Promise<{ source: "gemini" | "fallback"; name: string }> => {
    const item = await ctx.runQuery(api.wardrobe.get, { id: args.itemId });
    if (!item) throw new Error("Item not found");

    // --- primary: vision -------------------------------------------------
    if (hasGemini() && item.imageSrc) {
      const image = await fetchImage(item.imageSrc);
      if (image) {
        const analysis = await analyzeGarment(image);
        if (analysis) {
          await ctx.runMutation(api.wardrobe.update, {
            id: args.itemId,
            name: analysis.name,
            aiDescription: analysis.description,
            spec: {
              category: analysis.category,
              subcategory: analysis.subcategory,
              primaryColor: analysis.primaryColor,
              secondaryColors: analysis.secondaryColors,
              material: analysis.material,
              pattern: analysis.pattern,
              styleTags: analysis.styleTags,
              formalityScore: analysis.formalityScore,
              seasonTags: analysis.seasonTags,
              weatherTags: analysis.weatherTags,
              occasionTags: analysis.occasionTags,
            },
          });
          return { source: "gemini", name: analysis.name };
        }
      }
      console.warn(`[uploads] vision unavailable for ${args.itemId} — classifying from name`);
    }

    // --- fallback: deterministic classification ---------------------------
    const { confidence, ...spec } = classifyProduct({
      name: item.name,
      description: item.name,
    });

    await ctx.runMutation(api.wardrobe.update, {
      id: args.itemId,
      spec,
      aiDescription:
        confidence === "low"
          ? "Rename this with something like “cream linen shirt” and GRWM will fill in the details."
          : `${spec.primaryColor} ${spec.subcategory}${spec.material ? ` in ${spec.material}` : ""}.`,
    });

    return { source: "fallback", name: item.name };
  },
});

/** Gemini needs image bytes inline, so fetch the Convex storage URL first. */
async function fetchImage(
  url: string,
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      console.warn(`[uploads] couldn't fetch image (${response.status})`);
      return null;
    }
    const bytes = await response.arrayBuffer();
    return {
      data: Buffer.from(bytes).toString("base64"),
      mimeType: response.headers.get("content-type") ?? "image/jpeg",
    };
  } catch (error) {
    console.warn(
      "[uploads] image fetch failed:",
      error instanceof Error ? error.message : "unknown",
    );
    return null;
  }
}

/** Re-run analysis across every upload — useful after adding an API key. */
export const reanalyzeAll = action({
  args: {},
  handler: async (ctx): Promise<{ processed: number }> => {
    const items = await ctx.runQuery(api.wardrobe.list, {});
    const uploads = items.filter((i) => i.source === "upload");
    for (const item of uploads) {
      await ctx.runAction(api.uploads.analyze, { itemId: item._id as Id<"wardrobeItems"> });
    }
    return { processed: uploads.length };
  },
});
