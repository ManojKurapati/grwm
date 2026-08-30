/**
 * The seeded demo wardrobe.
 *
 * GRWM's image analysis is real, but a live demo must never depend on it. This
 * wardrobe is 16 visually distinct, deliberately neutral pieces that produce
 * genuinely good outfits for the demo prompts — and deliberately contains two
 * near-identical sneakers so the "SKIP IT" verdict is honest rather than staged.
 *
 * Every attribute here is the same shape the vision analyser produces for
 * uploads, so seeded and uploaded items are indistinguishable to the engine.
 */

import type { GarmentSpec } from "../engine/taxonomy";

export type SeedItem = {
  key: string;
  name: string;
  /**
   * Path under /public, kept local so imagery never fails to load on stage.
   *
   * Only set where we have a photograph that is genuinely the right garment on
   * a clean, near-white ground. Everything else falls back to the illustrated
   * system in `Garment.tsx`, which is preferable to a wrong or off-tone photo:
   * automated product discovery returned shoe insoles for "grey runners" and a
   * green-dial chronograph for "silver watch". Photographs are composited onto
   * the paper ground in `GarmentCard`, so the two media sit together.
   */
  imageUrl?: string;
  spec: GarmentSpec;
  aiDescription: string;
  wearCountDaysAgo?: number;
  wearCount: number;
};

export const SEED_WARDROBE: SeedItem[] = [
  {
    key: "cream-linen-overshirt",
    name: "Cream linen shirt",
    wearCount: 6,
    wearCountDaysAgo: 12,
    spec: {
      category: "top",
      subcategory: "shirt",
      primaryColor: "cream",
      secondaryColors: [],
      material: "linen",
      pattern: "solid",
      styleTags: ["minimal", "smart casual", "mediterranean", "relaxed", "elevated"],
      formalityScore: 5.5,
      seasonTags: ["spring", "summer"],
      weatherTags: ["hot", "warm", "mild"],
      occasionTags: ["date", "rooftop-date", "brunch", "dinner", "casual", "office", "gallery"],
    },
    aiDescription:
      "Relaxed cream linen shirt with a soft collar. Breathable, slightly textured, reads effortless rather than dressy.",
  },
  {
    key: "black-fitted-shirt",
    name: "Black fitted shirt",
    wearCount: 9,
    wearCountDaysAgo: 5,
    spec: {
      category: "top",
      subcategory: "shirt",
      primaryColor: "black",
      secondaryColors: [],
      material: "cotton",
      pattern: "solid",
      styleTags: ["minimal", "monochrome", "sharp", "elevated", "smart casual"],
      formalityScore: 7,
      seasonTags: ["all-season"],
      weatherTags: ["warm", "mild", "cool"],
      occasionTags: ["date", "rooftop-date", "dinner", "night-out", "client-dinner", "office", "gallery"],
    },
    aiDescription:
      "Clean black shirt with a trim fit. The sharpest top in the wardrobe — carries evenings on its own.",
  },
  {
    key: "white-oxford-shirt",
    name: "White Oxford shirt",
    wearCount: 14,
    wearCountDaysAgo: 21,
    spec: {
      category: "top",
      subcategory: "shirt",
      primaryColor: "white",
      secondaryColors: [],
      material: "oxford",
      pattern: "solid",
      styleTags: ["minimal", "tailored", "business casual", "smart casual"],
      formalityScore: 7,
      seasonTags: ["all-season"],
      weatherTags: ["warm", "mild", "cool"],
      occasionTags: ["office", "client-dinner", "dinner", "wedding", "date", "gallery", "brunch"],
    },
    aiDescription:
      "Crisp white Oxford with a button-down collar. The most formal top here and the most reliable.",
  },
  {
    key: "black-tshirt",
    name: "Black T-shirt",
    wearCount: 22,
    wearCountDaysAgo: 2,
    spec: {
      category: "top",
      subcategory: "t-shirt",
      primaryColor: "black",
      secondaryColors: [],
      material: "cotton",
      pattern: "solid",
      styleTags: ["minimal", "monochrome", "relaxed", "streetwear"],
      formalityScore: 3,
      seasonTags: ["all-season"],
      weatherTags: ["hot", "warm", "mild"],
      occasionTags: ["casual", "night-out", "airport", "brunch"],
    },
    aiDescription: "Plain black crew-neck tee in a mid-weight cotton. Pure base layer.",
  },
  {
    key: "white-tshirt",
    name: "White T-shirt",
    wearCount: 25,
    wearCountDaysAgo: 4,
    spec: {
      category: "top",
      subcategory: "t-shirt",
      primaryColor: "white",
      secondaryColors: [],
      material: "cotton",
      pattern: "solid",
      styleTags: ["minimal", "relaxed", "streetwear"],
      formalityScore: 3,
      seasonTags: ["all-season"],
      weatherTags: ["hot", "warm", "mild"],
      occasionTags: ["casual", "brunch", "airport", "night-out"],
    },
    aiDescription: "Clean white crew-neck tee. Works alone in heat or under every layer here.",
  },
  {
    key: "black-relaxed-trousers",
    name: "Black relaxed trousers",
    imageUrl: "/wardrobe/black-relaxed-trousers.jpg",
    wearCount: 11,
    wearCountDaysAgo: 9,
    spec: {
      category: "bottom",
      subcategory: "trousers",
      primaryColor: "black",
      secondaryColors: [],
      material: "cotton twill",
      pattern: "solid",
      styleTags: ["minimal", "monochrome", "tailored", "relaxed", "elevated", "smart casual"],
      formalityScore: 7,
      seasonTags: ["all-season"],
      weatherTags: ["warm", "mild", "cool"],
      occasionTags: ["date", "rooftop-date", "dinner", "night-out", "office", "client-dinner", "gallery"],
    },
    aiDescription:
      "Relaxed straight-leg black trousers with a soft drape. Dressy enough for dinner, easy enough for a rooftop.",
  },
  {
    key: "beige-trousers",
    name: "Beige trousers",
    wearCount: 7,
    wearCountDaysAgo: 16,
    spec: {
      category: "bottom",
      subcategory: "trousers",
      primaryColor: "beige",
      secondaryColors: [],
      material: "cotton twill",
      pattern: "solid",
      styleTags: ["minimal", "mediterranean", "smart casual", "relaxed", "tailored"],
      formalityScore: 6,
      seasonTags: ["spring", "summer", "autumn"],
      weatherTags: ["hot", "warm", "mild"],
      occasionTags: ["brunch", "date", "rooftop-date", "dinner", "office", "casual", "gallery"],
    },
    aiDescription:
      "Light beige tapered trousers in a dry cotton twill. The lightest bottom in the wardrobe.",
  },
  {
    key: "blue-jeans",
    name: "Blue jeans",
    wearCount: 31,
    wearCountDaysAgo: 3,
    spec: {
      category: "bottom",
      subcategory: "jeans",
      primaryColor: "denim",
      secondaryColors: [],
      material: "denim",
      pattern: "solid",
      styleTags: ["relaxed", "minimal", "streetwear"],
      formalityScore: 4,
      seasonTags: ["all-season"],
      weatherTags: ["mild", "cool", "warm"],
      occasionTags: ["casual", "brunch", "night-out", "date", "airport"],
    },
    aiDescription:
      "Mid-wash straight-leg jeans. The default bottom — comfortable, not dressy.",
  },
  {
    key: "white-sneakers",
    name: "White sneakers",
    wearCount: 40,
    wearCountDaysAgo: 1,
    spec: {
      category: "shoes",
      subcategory: "sneakers",
      primaryColor: "white",
      secondaryColors: [],
      material: "leather",
      pattern: "solid",
      styleTags: ["minimal", "relaxed", "smart casual", "streetwear"],
      formalityScore: 4,
      seasonTags: ["all-season"],
      weatherTags: ["hot", "warm", "mild", "cool"],
      occasionTags: ["casual", "brunch", "airport", "night-out", "date"],
    },
    aiDescription: "Low-profile white leather sneakers. The most-worn item in the wardrobe.",
  },
  {
    key: "grey-runners",
    name: "Grey runners",
    imageUrl: "/wardrobe/grey-runners.jpg",
    wearCount: 18,
    wearCountDaysAgo: 6,
    spec: {
      category: "shoes",
      subcategory: "runners",
      primaryColor: "light grey",
      secondaryColors: ["white"],
      material: "wool",
      pattern: "textured",
      styleTags: ["relaxed", "comfort", "minimal", "athleisure"],
      formalityScore: 3,
      seasonTags: ["all-season"],
      weatherTags: ["mild", "warm", "cool"],
      occasionTags: ["casual", "airport", "brunch"],
    },
    aiDescription:
      "Soft grey knit runners. Comfort-first — overlaps heavily with the white sneakers.",
  },
  {
    key: "black-loafers",
    name: "Black loafers",
    imageUrl: "/wardrobe/black-loafers.jpg",
    wearCount: 8,
    wearCountDaysAgo: 14,
    spec: {
      category: "shoes",
      subcategory: "loafers",
      primaryColor: "black",
      secondaryColors: [],
      material: "leather",
      pattern: "solid",
      styleTags: ["minimal", "monochrome", "tailored", "elevated", "smart casual", "sharp"],
      formalityScore: 7.5,
      seasonTags: ["all-season"],
      weatherTags: ["warm", "mild", "cool"],
      occasionTags: ["date", "rooftop-date", "dinner", "office", "client-dinner", "gallery", "wedding", "night-out"],
    },
    aiDescription:
      "Polished black leather loafers. The only genuinely smart shoe in the wardrobe.",
  },
  {
    key: "stone-overshirt",
    name: "Stone overshirt",
    wearCount: 5,
    wearCountDaysAgo: 19,
    spec: {
      category: "layer",
      subcategory: "overshirt",
      primaryColor: "taupe",
      secondaryColors: [],
      material: "cotton",
      pattern: "solid",
      styleTags: ["minimal", "relaxed", "smart casual", "mediterranean"],
      formalityScore: 5,
      seasonTags: ["spring", "autumn", "summer"],
      weatherTags: ["warm", "mild", "cool"],
      occasionTags: ["casual", "brunch", "date", "office", "airport", "dinner"],
    },
    aiDescription:
      "Unstructured stone overshirt in a light cotton. Layers without adding real weight.",
  },
  {
    key: "charcoal-knit",
    name: "Charcoal knit",
    wearCount: 4,
    wearCountDaysAgo: 40,
    spec: {
      category: "layer",
      subcategory: "cardigan",
      primaryColor: "charcoal",
      secondaryColors: [],
      material: "merino wool",
      pattern: "textured",
      styleTags: ["minimal", "monochrome", "elevated", "comfort"],
      formalityScore: 6,
      seasonTags: ["autumn", "winter", "spring"],
      weatherTags: ["cool", "mild", "cold"],
      occasionTags: ["dinner", "office", "date", "casual", "gallery"],
    },
    aiDescription:
      "Fine-gauge charcoal merino knit. The warmest layer here — reserved for cooler evenings.",
  },
  {
    key: "silver-watch",
    name: "Silver watch",
    wearCount: 34,
    wearCountDaysAgo: 3,
    spec: {
      category: "accessory",
      subcategory: "watch",
      primaryColor: "silver",
      secondaryColors: ["white"],
      material: "stainless steel",
      pattern: "solid",
      styleTags: ["minimal", "elevated", "tailored", "monochrome"],
      formalityScore: 6.5,
      seasonTags: ["all-season"],
      weatherTags: ["hot", "warm", "mild", "cool", "cold"],
      occasionTags: ["date", "rooftop-date", "dinner", "office", "client-dinner", "gallery", "wedding", "casual", "brunch", "night-out"],
    },
    aiDescription:
      "Slim silver watch on a steel bracelet. Quietly finishes almost any outfit.",
  },
  {
    key: "silver-chain",
    name: "Silver chain",
    wearCount: 15,
    wearCountDaysAgo: 7,
    spec: {
      category: "accessory",
      subcategory: "chain",
      primaryColor: "silver",
      secondaryColors: [],
      material: "sterling silver",
      pattern: "solid",
      styleTags: ["minimal", "statement", "streetwear", "monochrome"],
      formalityScore: 5,
      seasonTags: ["all-season"],
      weatherTags: ["hot", "warm", "mild", "cool", "cold"],
      occasionTags: ["date", "rooftop-date", "night-out", "casual", "brunch", "gallery"],
    },
    aiDescription:
      "Thin sterling silver chain. Adds a little edge to open collars and tees.",
  },
  {
    key: "black-sunglasses",
    name: "Black sunglasses",
    imageUrl: "/wardrobe/black-sunglasses.jpg",
    wearCount: 20,
    wearCountDaysAgo: 8,
    spec: {
      category: "accessory",
      subcategory: "sunglasses",
      primaryColor: "black",
      secondaryColors: [],
      material: "acetate",
      pattern: "solid",
      styleTags: ["statement", "minimal", "mediterranean", "elevated"],
      formalityScore: 5,
      seasonTags: ["spring", "summer", "autumn"],
      weatherTags: ["hot", "warm", "mild"],
      occasionTags: ["casual", "brunch", "airport", "rooftop-date", "date"],
    },
    aiDescription:
      "Angular black acetate sunglasses. The wardrobe's one statement piece.",
  },
];

/** Onboarding answers for the seeded demo user. */
export const SEED_PROFILE = {
  preferredStyles: ["minimal", "smart casual", "elevated", "monochrome", "relaxed"],
  preferredColors: ["black", "cream", "white", "beige", "charcoal"],
  avoidColors: ["yellow", "orange", "purple"],
  presentation: "neutral",
  zodiacSign: "scorpio",
  baseFormality: 6,
};
