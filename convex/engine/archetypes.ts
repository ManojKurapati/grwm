/**
 * Wardrobe archetypes.
 *
 * The Missing Piece Engine does not ask an LLM to invent shopping ideas. It
 * holds a small library of garments that are known to make a neutral wardrobe
 * more useful, substitutes each one into the user's best outfit, and measures
 * the actual score delta and the number of new outfits unlocked.
 *
 * Only archetypes that measurably improve the wardrobe are ever surfaced, and
 * each one carries the retailer sources Context.dev will extract from.
 */

import type { GarmentSpec } from "./taxonomy";

export type Archetype = {
  id: string;
  /** Display name of the gap, e.g. "Brown suede loafers". */
  label: string;
  spec: GarmentSpec;
  /** Why this piece tends to unlock outfits — shown to the user. */
  rationale: string;
  /** Curated product pages Context.dev extracts for this archetype.
   *  Real retailer PDPs, so extraction returns genuine product records. */
  sources: string[];
  /** Search phrasing, used if a discovery provider is wired in later. */
  query: string;
};

const base = (over: Partial<GarmentSpec> & Pick<GarmentSpec, "category" | "subcategory" | "primaryColor" | "formalityScore">): GarmentSpec => ({
  secondaryColors: [],
  styleTags: [],
  seasonTags: ["all-season"],
  weatherTags: ["mild", "warm"],
  occasionTags: [],
  ...over,
});

export const ARCHETYPES: Archetype[] = [
  {
    id: "brown-suede-loafers",
    label: "Brown suede loafers",
    query: "brown suede loafers men",
    rationale:
      "A warm-toned loafer bridges your neutrals — it dresses up denim and softens black tailoring, which black shoes cannot do.",
    spec: base({
      category: "shoes",
      subcategory: "loafers",
      primaryColor: "brown",
      material: "suede",
      pattern: "solid",
      formalityScore: 7,
      styleTags: ["minimal", "elevated", "smart casual", "mediterranean", "tailored"],
      seasonTags: ["spring", "summer", "autumn"],
      weatherTags: ["mild", "warm", "hot"],
      occasionTags: ["date", "rooftop-date", "dinner", "brunch", "office", "client-dinner", "gallery"],
    }),
    sources: [
      "https://www.charleskeith.com/us/shoes/loafers",
      "https://www.mrporter.com/en-us/mens/product/tods/shoes/loafers/gommino-suede-loafers/1647597342475374",
    ],
  },
  {
    id: "navy-unstructured-blazer",
    label: "Unstructured navy blazer",
    query: "unstructured navy linen blazer",
    rationale:
      "An unlined blazer is the fastest way to move any of your shirts from casual to client-ready without adding real weight.",
    spec: base({
      category: "layer",
      subcategory: "blazer",
      primaryColor: "navy",
      material: "linen blend",
      pattern: "solid",
      formalityScore: 8,
      styleTags: ["tailored", "elevated", "business casual", "minimal", "sharp"],
      seasonTags: ["spring", "summer", "autumn"],
      weatherTags: ["mild", "warm", "cool"],
      occasionTags: ["client-dinner", "office", "dinner", "gallery", "wedding", "date"],
    }),
    sources: [
      "https://www.cos.com/en-us/men/menswear/blazers",
      "https://www.uniqlo.com/us/en/products/E465185-000",
    ],
  },
  {
    id: "white-leather-sneakers",
    label: "Clean white leather sneakers",
    query: "minimal white leather sneakers",
    rationale:
      "The single most versatile shoe in a neutral wardrobe — it carries casual and smart-casual equally.",
    spec: base({
      category: "shoes",
      subcategory: "sneakers",
      primaryColor: "white",
      material: "leather",
      pattern: "solid",
      formalityScore: 4,
      styleTags: ["minimal", "relaxed", "smart casual", "streetwear"],
      occasionTags: ["casual", "brunch", "airport", "date", "night-out"],
      weatherTags: ["mild", "warm", "cool", "hot"],
    }),
    sources: [
      "https://www.commonprojects.com/collections/original-achilles",
      "https://www.axelarigato.com/en-us/clean-90-white",
    ],
  },
  {
    id: "black-leather-derby",
    label: "Black leather derby shoes",
    query: "black leather derby shoes",
    rationale:
      "Covers the formal end of your wardrobe — weddings and client dinners currently fall back on loafers.",
    spec: base({
      category: "shoes",
      subcategory: "derby",
      primaryColor: "black",
      material: "leather",
      pattern: "solid",
      formalityScore: 9,
      styleTags: ["tailored", "formal", "sharp", "business casual"],
      occasionTags: ["wedding", "client-dinner", "office", "gallery"],
      weatherTags: ["mild", "cool", "cold"],
    }),
    sources: ["https://www.churchfootwear.com/us_en/shannon-173.html"],
  },
  {
    id: "cream-linen-shirt",
    label: "Cream linen shirt",
    query: "cream linen shirt relaxed",
    rationale:
      "A breathable light top raises your ceiling for every warm-weather evening in the wardrobe.",
    spec: base({
      category: "top",
      subcategory: "shirt",
      primaryColor: "cream",
      material: "linen",
      pattern: "solid",
      formalityScore: 5,
      styleTags: ["minimal", "relaxed", "smart casual", "mediterranean"],
      occasionTags: ["date", "rooftop-date", "brunch", "dinner", "casual"],
      seasonTags: ["spring", "summer"],
      weatherTags: ["warm", "hot", "mild"],
    }),
    sources: [
      "https://www.uniqlo.com/us/en/products/E475296-000",
      "https://www.cos.com/en-us/men/menswear/shirts",
    ],
  },
  {
    id: "black-knit-polo",
    label: "Black fine-knit polo",
    query: "black fine knit polo shirt",
    rationale:
      "A knit polo is more elevated than a tee and cooler than a shirt — it fills the gap between your two extremes.",
    spec: base({
      category: "top",
      subcategory: "polo",
      primaryColor: "black",
      material: "merino wool",
      pattern: "solid",
      formalityScore: 6.5,
      styleTags: ["minimal", "elevated", "monochrome", "smart casual", "sharp"],
      occasionTags: ["date", "rooftop-date", "dinner", "night-out", "office", "gallery"],
      weatherTags: ["mild", "warm", "cool"],
    }),
    sources: [
      "https://www.cos.com/en-us/men/menswear/knitwear",
      "https://www.arket.com/en_usd/men/knitwear.html",
    ],
  },
  {
    id: "beige-pleated-trousers",
    label: "Beige pleated trousers",
    query: "beige pleated wide trousers",
    rationale:
      "A light bottom balances your dark tops — right now almost every outfit is anchored dark on the bottom.",
    spec: base({
      category: "bottom",
      subcategory: "trousers",
      primaryColor: "beige",
      material: "cotton twill",
      pattern: "solid",
      formalityScore: 6.5,
      styleTags: ["tailored", "minimal", "elevated", "mediterranean", "smart casual"],
      occasionTags: ["date", "rooftop-date", "brunch", "dinner", "office", "gallery"],
      seasonTags: ["spring", "summer", "autumn"],
      weatherTags: ["warm", "mild", "hot"],
    }),
    sources: [
      "https://www.cos.com/en-us/men/menswear/trousers",
      "https://www.uniqlo.com/us/en/products/E464716-000",
    ],
  },
  {
    id: "olive-overshirt",
    label: "Olive overshirt",
    query: "olive cotton overshirt chore jacket",
    rationale:
      "Your layers are all neutral. One earthy layer adds an accent without breaking the palette.",
    spec: base({
      category: "layer",
      subcategory: "overshirt",
      primaryColor: "olive",
      material: "cotton twill",
      pattern: "solid",
      formalityScore: 5,
      styleTags: ["relaxed", "minimal", "smart casual", "streetwear"],
      occasionTags: ["casual", "brunch", "airport", "date", "office"],
      weatherTags: ["mild", "cool", "warm"],
    }),
    sources: ["https://www.arket.com/en_usd/men/jackets-coats.html"],
  },
  {
    id: "black-leather-belt",
    label: "Black leather belt",
    query: "black leather dress belt",
    rationale:
      "A finishing detail that makes tucked shirts read intentional rather than unfinished.",
    spec: base({
      category: "accessory",
      subcategory: "belt",
      primaryColor: "black",
      material: "leather",
      pattern: "solid",
      formalityScore: 7,
      styleTags: ["minimal", "tailored", "business casual"],
      occasionTags: ["office", "client-dinner", "dinner", "date", "wedding"],
      weatherTags: ["hot", "warm", "mild", "cool", "cold"],
    }),
    sources: ["https://www.cos.com/en-us/men/menswear/accessories"],
  },
  {
    id: "gold-signet-ring",
    label: "Gold signet ring",
    query: "gold signet ring minimal",
    rationale:
      "One warm metal detail adds personality to an all-neutral fit without shouting.",
    spec: base({
      category: "accessory",
      subcategory: "ring",
      primaryColor: "gold",
      material: "metal",
      pattern: "solid",
      formalityScore: 6,
      styleTags: ["statement", "elevated", "minimal"],
      occasionTags: ["date", "rooftop-date", "night-out", "dinner", "gallery"],
      weatherTags: ["hot", "warm", "mild", "cool", "cold"],
    }),
    sources: ["https://www.mejuri.com/shop/t/type/rings"],
  },
  {
    id: "navy-relaxed-trousers",
    label: "Navy relaxed trousers",
    query: "navy relaxed tailored trousers",
    rationale:
      "Navy is the neutral your wardrobe is missing — softer than black at night, sharper than beige.",
    spec: base({
      category: "bottom",
      subcategory: "trousers",
      primaryColor: "navy",
      material: "cotton twill",
      pattern: "solid",
      formalityScore: 7,
      styleTags: ["tailored", "minimal", "business casual", "elevated"],
      occasionTags: ["office", "client-dinner", "dinner", "date", "gallery"],
      weatherTags: ["mild", "warm", "cool"],
    }),
    sources: ["https://www.uniqlo.com/us/en/products/E459201-000"],
  },
  {
    id: "white-tshirt-heavyweight",
    label: "Heavyweight white T-shirt",
    query: "heavyweight white t-shirt boxy",
    rationale:
      "A structured tee holds its shape under layers, so your jackets stop looking slouchy.",
    spec: base({
      category: "top",
      subcategory: "t-shirt",
      primaryColor: "white",
      material: "cotton",
      pattern: "solid",
      formalityScore: 3,
      styleTags: ["minimal", "relaxed", "streetwear"],
      occasionTags: ["casual", "brunch", "airport", "night-out"],
      weatherTags: ["hot", "warm", "mild"],
    }),
    sources: ["https://www.arket.com/en_usd/men/t-shirts-tops.html"],
  },
];

export function archetypeById(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}
