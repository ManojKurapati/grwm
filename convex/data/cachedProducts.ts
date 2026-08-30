/**
 * AUTO-GENERATED — do not edit by hand.
 *   regenerate with: npx tsx scripts/build-cached-products.ts
 *
 * Demo-safety cache of REAL Context.dev extractions.
 *
 * Every record below was returned by a live call to
 *   POST https://api.context.dev/v1/brand/ai/products
 * against a curated fashion retailer. Nothing here is fabricated. They are
 * committed to the repo so the Missing Piece Engine and "Should I Buy This?"
 * still have grounded product data when the network is unreliable during a
 * live demo. `provenance: "cached-context.dev"` marks them as cached, so the
 * UI can label them honestly; live extractions are tagged `"context.dev"`.
 *
 * 85 products · generated 2026-08-30
 */

import type { GarmentSpec } from "../engine/taxonomy";

export type CachedProduct = {
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
  provenance: string;
  archetypeId?: string;
};

export const CACHED_PRODUCTS: CachedProduct[] = [
  {
    "url": "https://www.uniqlo.com/us/en/contents/feature/masterpiece/product/airism-cotton-oversized-t-shirt",
    "name": "AIRism Cotton Oversized T-Shirt",
    "description": "A high-quality oversized T-shirt made from a cotton fabric blended with AIRism technology, offering a cool, dry, and smooth feel on the skin. Features a fine-textured surface of premium cotton, meticulous attention to color, detail, and balanced sizing. Designed as UNIQLO's best-selling basic T-shirt, suitable for adults and kids with a relaxed silhouette for comfort and ease of movement.",
    "retailer": "Uniqlo",
    "price": null,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/e665a44e-1499-4e2e-831c-822b15f68e31.jpg",
    "images": [],
    "sku": "airism-cotton-oversized-t-shirt",
    "productCategory": "Clothing",
    "features": [
      "Cotton fabric blended with AIRism for cool, dry, and smooth feel",
      "Fine-textured surface of premium cotton",
      "Meticulous attention to color and detail",
      "Balanced sizing for comfort",
      "Relaxed silhouette for ease of movement",
      "Neck tape to reduce prickliness around the neck (kids version)"
    ],
    "tags": [
      "cotton",
      "AIRism",
      "oversized",
      "T-shirt",
      "basic",
      "comfortable",
      "breathable"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "elevated"
      ],
      "formalityScore": 1.8,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E465185-000/00",
    "name": "AIRism Cotton Oversized T-Shirt | Half-Sleeve",
    "description": "A unisex oversized T-shirt made from a cotton-blend fabric incorporating AIRism technology, providing the look of cotton with smooth, quick-drying, and cooling functionality. Features a relaxed silhouette with half-length sleeves, dropped shoulders, and a narrow crew neck for refined styling. Designed for versatile everyday wear, suitable for layering or wearing alone, and made with recycled materials as part of sustainability efforts.",
    "retailer": "Uniqlo",
    "price": 19.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/e708fd83-5457-4370-b80a-6126e62780b3.jpg",
    "images": [
      "https://media.brand.dev/df0d92bc-dc93-4754-ab7c-c876edcf2e76.jpg",
      "https://media.brand.dev/33c9d9db-9220-4005-a191-c400d664c6f2.jpg",
      "https://media.brand.dev/1909c0d3-da09-4b07-b14e-c5a74aebef7e.jpg",
      "https://media.brand.dev/ff10f704-77a9-4f73-8130-69ea1eff7cb2.jpg"
    ],
    "sku": "465185-00-003-000",
    "productCategory": "Men / T-Shirts, Sweats & Fleece / T-Shirts / Uniqlo U",
    "features": [
      "AIRism fabric with the look of cotton",
      "Stay-fresh comfort",
      "Instantly cool and comfortable",
      "Relaxed silhouette with half-length sleeves",
      "Oversized cut with dropped shoulders",
      "Narrow crew neck for refined styling"
    ],
    "tags": [
      "AIRism",
      "cotton",
      "oversized",
      "T-shirt",
      "half-sleeve",
      "quick-drying",
      "recycled materials",
      "Uniqlo U"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 2.6,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/contents/feature/masterpiece/product/airism-cotton-crew-neck-t-shirt-long-sleeve",
    "name": "AIRism Cotton T-Shirt | Long-Sleeve",
    "description": "The long-sleeve version of UNIQLO's best-selling AIRism Cotton Oversized T-shirt, offering a smooth, comfortable feel with a contemporary silhouette. Features include a thick collar, wide armholes, loose-fitting sleeves, and tighter ribbing to keep sleeves from slipping when rolled up. Made with recycled materials and available in natural new hues inspired by painting, photography, and nature.",
    "retailer": "Uniqlo",
    "price": 29.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/e72cee80-a162-48ec-b498-c27eb144706a.jpg",
    "images": [],
    "sku": "E465193-000",
    "productCategory": "Clothing",
    "features": [
      "Long-sleeve design",
      "Made with recycled materials",
      "Thick collar and wide armholes for a sharp look",
      "Loose-fitting sleeves for contemporary silhouette",
      "Tighter ribbing to prevent sleeves slipping when rolled up",
      "Available in natural new hues inspired by art and nature"
    ],
    "tags": [
      "AIRism",
      "Cotton",
      "Long Sleeve",
      "T-Shirt",
      "Recycled Materials",
      "Unisex"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 2.6,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK2-40782908-1_PEC.BR.html",
    "name": "Aislin Hobo Bag",
    "description": "The Aislin Hobo Bag in pecan brown is made with recycled suede leather and features a softly structured trapeze silhouette, polished gold-tone accents, a magnetic closure, and an adjustable shoulder strap. It can fit a 13-inch laptop, making it both stylish and practical. This product contains recycled material.",
    "retailer": "Charleskeith",
    "price": 139,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/5847fe15-9579-435b-aa27-1aa96c19a860.jpg",
    "images": [],
    "sku": "CK2-40782908-1_PEC.BR",
    "productCategory": "Bags",
    "features": [
      "Made with recycled suede leather",
      "Softly structured trapeze silhouette",
      "Polished gold-tone accents",
      "Magnetic closure",
      "Adjustable and detachable shoulder strap",
      "Fits a 13-inch laptop"
    ],
    "tags": [
      "hobo bag",
      "recycled material",
      "suede leather",
      "adjustable strap",
      "magnetic closure",
      "laptop compatible",
      "pecan brown"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "bag",
      "primaryColor": "gold",
      "secondaryColors": [
        "brown"
      ],
      "material": "suede",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 5.3,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "airport",
        "office",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK2-90151648-1_STO.GR.html",
    "name": "Apfra Quilted Shoulder Bag",
    "description": "The Apfra Quilted Shoulder Bag in stone grey is made with recycled faux suede leather featuring a quilted finish, a front-flap design, and a trapeze silhouette. It has double braided-chain handles and a magnetic closure, designed to add tactility and visual interest to all-day outfits. This product contains recycled material.",
    "retailer": "Charleskeith",
    "price": 139,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/621b0c1e-254c-474f-b830-a793e7498f17.jpg",
    "images": [],
    "sku": "CK2-90151648-1_STO.GR",
    "productCategory": "Bags",
    "features": [
      "Made with recycled faux suede leather",
      "Quilted finish",
      "Front-flap design",
      "Trapeze silhouette",
      "Double braided-chain handles",
      "Magnetic closure"
    ],
    "tags": [
      "quilted",
      "shoulder bag",
      "stone grey",
      "faux suede",
      "recycled material",
      "magnetic closure",
      "braided-chain handles"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "bag",
      "primaryColor": "beige",
      "secondaryColors": [
        "grey"
      ],
      "material": "suede",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "airport",
        "office",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK2-80782534_BLACK.html",
    "name": "Arwen Quilted Top Handle Vanity Bag",
    "description": "The petite shape and classic quilted design of this Arwen bag make it ideal for special occasions and evening dinners. Inspired by compact vanity cases, this bag features a top handle and a detachable braided chain strap, offering versatile carrying options. Made from Nappa PU material, it includes a zip closure, adjustable and detachable strap, and weighs 252 grams.",
    "retailer": "Charleskeith",
    "price": 99,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/b9d6ff26-39b1-40b1-9314-8f4a98369fb5.jpg",
    "images": [],
    "sku": "CK2-80782534_BLACK",
    "productCategory": "Bags",
    "features": [
      "Petite shape",
      "Classic quilted design",
      "Top handle",
      "Detachable braided chain strap",
      "Zip closure",
      "Adjustable strap"
    ],
    "tags": [
      "quilted",
      "top handle",
      "vanity bag",
      "black",
      "Nappa PU",
      "adjustable strap",
      "detachable strap"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "bag",
      "primaryColor": "black",
      "secondaryColors": [],
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "airport",
        "office",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E492365-000/00",
    "name": "Baggy Straight Jeans",
    "description": "Men's Baggy Straight Jeans featuring a voluminous baggy silhouette with a polished look. Made from crisp 100% cotton denim, pre-washed for a subtly faded, casual appearance. Workwear-inspired pockets complement the straight silhouette and offer plenty of storage. Darts create a more three-dimensional shape around the hips. Fit is loose with a straight silhouette. Imported from Bangladesh.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/cb3ad52c-8b79-4c05-a182-0dfaa868cb81.jpg",
    "images": [
      "https://media.brand.dev/b017ab56-94a1-4523-b3e4-521c36993b0b.jpg",
      "https://media.brand.dev/648f9344-c39c-47c7-9013-29ac26e440a8.jpg",
      "https://media.brand.dev/d02d1ae5-b914-4152-8a18-f26e155ee73d.jpg",
      "https://media.brand.dev/28cf2d57-c22d-47fb-9436-d2e04604d12e.jpg"
    ],
    "sku": "492365-08-030-000",
    "productCategory": "Men / Bottoms / Jeans / Wide",
    "features": [
      "100% cotton denim",
      "Pre-washed for subtle faded look",
      "Workwear-inspired pockets",
      "Darts for three-dimensional hip shape",
      "Loose fit",
      "Straight silhouette"
    ],
    "tags": [
      "baggy",
      "straight",
      "jeans",
      "cotton",
      "denim",
      "loose fit",
      "casual"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear"
      ],
      "formalityScore": 2.8,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488743-000/00",
    "name": "Barrel Jeans",
    "description": "Unisex wide-leg jeans made with dyed colored denim featuring a stylish curved silhouette and sleek L-shaped front pockets for easy access. These jeans have a loose fit and barrel silhouette, crafted from 100% cotton fabric. Machine washable and imported.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/01bb1d6d-fa43-40d8-a7b1-2052bfe35014.jpg",
    "images": [
      "https://media.brand.dev/00b9a535-dc2a-46d4-9163-99d5411b51e4.jpg",
      "https://media.brand.dev/c207b846-fb9d-4c07-9a38-42a575b27bd6.jpg",
      "https://media.brand.dev/d3134501-f79e-47ca-a3b0-b7c2857f4b63.jpg",
      "https://media.brand.dev/2eafd0f1-cddd-4fb5-937f-c00030757326.jpg"
    ],
    "sku": "488743-09-029-000",
    "productCategory": "Clothing",
    "features": [
      "Wide-leg pants with curved silhouette",
      "Loose fit",
      "Barrel silhouette",
      "Dyed colored denim",
      "Sleek L-shaped front pockets",
      "100% Cotton fabric"
    ],
    "tags": [
      "jeans",
      "wide-leg",
      "denim",
      "cotton",
      "unisex",
      "barrel silhouette"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 3.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E489565-000/00",
    "name": "Barrel Jeans | Indigo",
    "description": "Wide-leg pants in a stylish curved silhouette made from indigo denim with a naturally faded finish for a casual yet refined look. Features sleek L-shaped front pockets for easy access. Fit is loose with a barrel silhouette. Made from 100% cotton, imported. Machine wash cold, do not dry clean.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/3e0caa60-d407-48c2-9b21-bfca4f77c96b.jpg",
    "images": [
      "https://media.brand.dev/1abfbc01-878a-4158-a791-5fd74cb0448a.jpg",
      "https://media.brand.dev/8058e746-2bbb-43d7-92e7-79069c90df1b.jpg",
      "https://media.brand.dev/10c875a8-008b-41ce-85f4-f159dddd79a2.jpg"
    ],
    "sku": "489565-66-029-000",
    "productCategory": "Men / Bottoms / Jeans / Wide",
    "features": [
      "Wide-leg pants",
      "Stylish curved silhouette",
      "Indigo denim with naturally faded finish",
      "Sleek L-shaped front pockets",
      "Loose fit",
      "Barrel silhouette"
    ],
    "tags": [
      "jeans",
      "denim",
      "wide-leg",
      "barrel",
      "indigo",
      "casual",
      "loose fit"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 4,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E486585-000/00",
    "name": "Broadcloth Shirt | Check",
    "description": "A casual unisex broadcloth shirt made from 100% cotton fabric crafted from rare ultra-long cotton fibers. Features a naturally washed-out, wrinkled texture that pairs well with denim and chinos. The pattern is expertly aligned by hand for symmetry at the collar, placket, sleeves, and cuffs. It has buttons with rounded edges for easy fastening and a button-down collar that looks great tucked in or untucked. The shirt has a regular fit and is not sheer. Imported from Vietnam.",
    "retailer": "Uniqlo",
    "price": null,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/f541e80c-f602-4380-918a-e85ac21837eb.jpg",
    "images": [],
    "sku": "E486585-000",
    "productCategory": "Clothing",
    "features": [
      "100% cotton fabric from rare ultra-long cotton fibers",
      "Smooth and comfortable texture",
      "Naturally washed-out, wrinkled texture",
      "Patterns aligned by hand for symmetry",
      "Buttons with rounded edges",
      "Button-down collar"
    ],
    "tags": [
      "broadcloth",
      "shirt",
      "check",
      "cotton",
      "casual",
      "button-down",
      "regular fit"
    ],
    "spec": {
      "category": "top",
      "subcategory": "shirt",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "minimal",
        "smart casual",
        "tailored",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "cream-linen-shirt"
  },
  {
    "url": "https://www.danielwellington.com/products/classic-sheffield-eggshell-white-silver",
    "name": "Classic Sheffield Silver",
    "description": "The Classic Sheffield Silver is a minimalist wristwatch featuring an eggshell white dial, black leather strap, and polished stainless steel (316L) case available in 36 mm or 40 mm diameter. It has a Japanese quartz movement, water resistance up to 3 ATM (rain resistant), and interchangeable straps with spring bars for personalization. Suitable for professional everyday wear and formal occasions.",
    "retailer": "Danielwellington",
    "price": 169,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/73b48c5a-fafe-419c-b1fe-3b57d428263e.png",
    "images": [],
    "sku": "DW00100053",
    "productCategory": "watch",
    "features": [
      "Eggshell white dial",
      "Black leather strap",
      "Polished stainless steel (316L) case",
      "Japanese quartz movement",
      "Water resistant up to 3 ATM (rain resistant)",
      "Interchangeable straps with spring bars"
    ],
    "tags": [
      "classic",
      "silver",
      "leather strap",
      "minimalist",
      "Japanese quartz",
      "water resistant",
      "interchangeable strap"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "silver",
      "secondaryColors": [],
      "material": "leather",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored"
      ],
      "formalityScore": 6.5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/contents/feature/masterpiece/product/u-crew-neck-t-shirt",
    "name": "Crew Neck T-Shirt",
    "description": "The UNIQLO U Crew Neck T-Shirt is designed with a focus on perfect fit, fabric quality, and refined colors. The men's version features a durable 100% cotton fabric made with thick yarn for a fit that's not too loose, embodying a 'New Classic' concept. The women's version uses cotton with an interlock weave for a smooth, soft impression and a fit that is neither too tight nor too loose. Both versions are crafted with attention to detail and color selection to provide a sophisticated yet comfortable everyday T-shirt.",
    "retailer": "Uniqlo",
    "price": null,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/46f77547-4170-4d20-a3f4-e0c18d3880e1.jpg",
    "images": [],
    "sku": "ined",
    "productCategory": "Clothing",
    "features": [
      "100% cotton fabric",
      "Men's version: durable thick yarn cotton",
      "Women's version: interlock-knit jersey fabric",
      "Fit designed to be neither too tight nor too loose",
      "Carefully selected refined colors",
      "Designed by Christophe Lemaire, artistic director of Uniqlo U"
    ],
    "tags": [
      "crew neck",
      "t-shirt",
      "cotton",
      "comfortable",
      "UNIQLO U",
      "basic",
      "everyday wear"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 3,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488793-000/00",
    "name": "Easy Care Soft Shirt | Checked",
    "description": "A unisex relaxed silhouette shirt with dropped shoulders and a straight hem, perfect for pairing with wide-leg pants and as an outer layer. Features a versatile ombre check pattern and is sumptuously soft and smooth. The shirt is wrinkle-resistant after washing for easy care and is made from 57% Rayon and 43% Polyester (with 43% recycled polyester fiber). Machine washable on a gentle cycle or dry clean. Imported from Indonesia.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/785dcb34-c674-411a-a266-27dbde369e49.jpg",
    "images": [
      "https://media.brand.dev/34d2dd14-b0fa-440b-8aa5-98357d4d2034.jpg",
      "https://media.brand.dev/5fce439c-31cb-4e89-8d9e-ad60c19e09d1.jpg",
      "https://media.brand.dev/ebede8f2-aade-4333-9b95-d4ec6ac324cf.jpg",
      "https://media.brand.dev/9cdbb4ff-7fbd-4fdd-99da-367a552214d9.jpg"
    ],
    "sku": "488793-19-004-000",
    "productCategory": "Clothing",
    "features": [
      "Relaxed silhouette with dropped shoulders",
      "Straight hem",
      "Wrinkle-resistant after washing",
      "Sumptuously soft and smooth fabric",
      "Versatile ombre check pattern",
      "57% Rayon, 43% Polyester (43% recycled polyester fiber)"
    ],
    "tags": [
      "shirt",
      "easy care",
      "soft",
      "checked",
      "ombre check",
      "wrinkle-resistant",
      "recycled polyester"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "checked",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 2.2,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-70380740-1_CAMEL.html",
    "name": "Faux Suede Metallic Knot-Bar Loafers",
    "description": "Light-toned faux suede shoes perfect for spring-summer wardrobe. Versatile to pair with neutral and vibrant outfits. Gold-tone accents add subtle shine to elevate everyday ensembles.",
    "retailer": "Charleskeith",
    "price": 89,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/eab030c7-8c10-4284-a4bf-3855a58b0f0d.jpg",
    "images": [],
    "sku": "CK1-70380740-1_CAMEL",
    "productCategory": "Shoes",
    "features": [
      "Material: Faux Suede",
      "Material lining: Fabric & PU",
      "Sole material: PU",
      "Gold-tone accents",
      "Light-toned camel color"
    ],
    "tags": [
      "faux suede",
      "loafers",
      "camel",
      "metallic",
      "spring-summer",
      "shoes"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "gold",
      "secondaryColors": [
        "camel"
      ],
      "material": "suede",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488559-000/00",
    "name": "Flannel Boxy Shirt",
    "description": "A unisex flannel boxy shirt made with 100% brushed cotton (exclusive of decoration). Features a short length with a boxy silhouette and JW ANDERSON logo embroidery on the front hem. The shirt can be styled alone or layered, with the collar open or buttoned up. It has an oversized fit and is not sheer.",
    "retailer": "Uniqlo",
    "price": 39.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/5231c1a2-3951-4dc6-98c3-9a183d6f0f22.jpg",
    "images": [
      "https://media.brand.dev/c402052c-8754-45a7-8e95-7073296686a7.jpg",
      "https://media.brand.dev/2ff33695-a88d-4b6d-81ef-91a4380bd219.jpg",
      "https://media.brand.dev/aa8063ba-56ff-409e-8fb8-5b0098627d07.jpg",
      "https://media.brand.dev/d0301552-0b05-4038-87e4-0ce326d7cd9c.jpg"
    ],
    "sku": "488559-30-003-000",
    "productCategory": "Women / Shirts & Blouses / Shirts & Blouses / Cropped",
    "features": [
      "100% brushed cotton main body",
      "Short length with boxy silhouette",
      "JW ANDERSON logo embroidery on front hem",
      "Unisex design",
      "Oversized fit",
      "Not sheer"
    ],
    "tags": [
      "flannel",
      "boxy shirt",
      "cotton",
      "oversized",
      "JW ANDERSON",
      "UNIQLO"
    ],
    "spec": {
      "category": "top",
      "subcategory": "shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 5.6,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E486597-000/00",
    "name": "Flannel Shirt | Ombre Check",
    "description": "Unisex flannel shirt featuring an ombre check pattern. Made from fine 100% cotton brushed on both sides for a smooth outside and soft, cozy inside. Classic regular fit with updated length suitable for wearing tucked in or untucked, featuring a shirt-tail design and rounded buttons for easy fastening. Available in a wide range of colors and patterns including ombre checks, plaid, and block checks. Not sheer, regular fit, machine washable.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/4cd2db9d-4167-4be5-be67-1611e968fbb8.jpg",
    "images": [
      "https://media.brand.dev/6b3ecd2c-17e5-434b-89b4-28bc6aedb8c8.jpg",
      "https://media.brand.dev/0eaad351-f2b6-4c29-91bf-36c4526ae776.jpg",
      "https://media.brand.dev/ecd02290-2fce-46ac-b857-9851f6260d9c.jpg",
      "https://media.brand.dev/8520bbb8-6f4e-4156-8576-3a44df24e6eb.jpg"
    ],
    "sku": "486597-19-003-000",
    "productCategory": "Men / Shirts / Casual Shirts / Long Sleeve",
    "features": [
      "100% cotton, brushed on both sides",
      "Smooth outside, soft and cozy inside",
      "Classic regular fit",
      "Updated length for tucked or untucked wear",
      "Shirt-tail design",
      "Rounded buttons for easy fastening"
    ],
    "tags": [
      "flannel",
      "ombre check",
      "shirt",
      "casual",
      "long sleeve",
      "cotton",
      "regular fit"
    ],
    "spec": {
      "category": "top",
      "subcategory": "shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "minimal",
        "smart casual",
        "tailored",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E486594-000/00",
    "name": "Flannel Shirt | Tartan Check",
    "description": "Unisex flannel shirt featuring a classic regular fit, updated length suitable for wearing tucked in or untucked. Made from fine 100% cotton brushed on both sides, smooth on the outside and soft and cozy on the inside. Includes rounded buttons for easy fastening. Not sheer, regular fit, perfect for wearing alone or layered.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/c6b76b0f-424c-4b5d-963f-85b1e47be6fc.jpg",
    "images": [
      "https://media.brand.dev/d0c8b458-40c5-4132-9d45-48af5d864e8f.jpg",
      "https://media.brand.dev/20f28861-ce79-4731-b30e-bca3d5318b0c.jpg",
      "https://media.brand.dev/b638d183-4f11-4c2d-9f39-cfa0c87475d0.jpg",
      "https://media.brand.dev/51dcd949-ea55-462f-ab25-759e8f4b9f8c.jpg"
    ],
    "sku": "486594-30-003-000",
    "productCategory": "Men / Shirts / Casual Shirts / Long Sleeve",
    "features": [
      "100% cotton fabric, brushed on both sides",
      "Smooth exterior and soft, cozy interior",
      "Rounded buttons for easy fastening",
      "Updated length for versatile styling",
      "Classic regular fit",
      "Not sheer"
    ],
    "tags": [
      "flannel",
      "shirt",
      "tartan check",
      "cotton",
      "long sleeve",
      "casual",
      "unisex"
    ],
    "spec": {
      "category": "top",
      "subcategory": "shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "minimal",
        "smart casual",
        "tailored",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E449753-000/00",
    "name": "Fluffy Yarn Fleece Full-Zip Jacket",
    "description": "Women's full-zip jacket made from long-pile fleece refined through multiple prototypes for ultimate comfort. Features a fluffy yarn texture with a warm feel, piping at the hem and cuffs to keep cold air out, and knit construction with fabric density designed to reduce shedding and provide greater warmth. Machine washable and made with 100% recycled polyester fiber. Imported.",
    "retailer": "Uniqlo",
    "price": 39.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/31eb0072-3777-4a7c-8525-9ff2806345f2.jpg",
    "images": [
      "https://media.brand.dev/73fcaef6-38bf-4558-8144-c23cec252b08.jpg",
      "https://media.brand.dev/f07d5493-2e29-4313-8990-bf17627f6f53.jpg",
      "https://media.brand.dev/5faa8cc3-070b-4f84-bd46-8b7dff70ce18.jpg",
      "https://media.brand.dev/d3b54e51-f2c5-4f19-a177-e7cbda3601d4.jpg"
    ],
    "sku": "449753-09-003-000",
    "productCategory": "Women / T-Shirts, Sweats & Fleece / Fleece / Jackets",
    "features": [
      "Long-pile fleece for ultimate comfort",
      "Fluffy yarn texture for warmth",
      "Piping at hem and cuffs to block cold air",
      "Knit construction reduces shedding",
      "Made with 100% recycled polyester fiber",
      "Machine washable for easy care"
    ],
    "tags": [
      "fleece",
      "full-zip",
      "jacket",
      "warm",
      "soft",
      "recycled materials",
      "polyester"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-70381242_DB.TXT.html",
    "name": "Griselda Faux Suede Loafers",
    "description": "These Griselda loafers in dark brown are made with faux suede and feature almond toes, classic penny tabs, shiny lock charms, and very low block heels. They complement work staples with stylish tactility and functional details.",
    "retailer": "Charleskeith",
    "price": 89,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/f409c70a-1885-473c-b217-ba8ed867ce92.jpg",
    "images": [],
    "sku": "CK1-70381242_DB.TXT",
    "productCategory": "Shoes",
    "features": [
      "Made with faux suede material",
      "Fabric lining",
      "PU sole material",
      "Almond toe design",
      "Classic penny tabs",
      "Shiny lock charms"
    ],
    "tags": [
      "loafers",
      "faux suede",
      "dark brown",
      "shoes",
      "women's footwear"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "brown",
      "secondaryColors": [],
      "material": "suede",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 6.8,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "brown-suede-loafers"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-70381242_BLACK.html",
    "name": "Griselda Loafers",
    "description": "These Griselda loafers in black feature almond toes, classic penny tabs, shiny lock charms, and very low block heels. They are stylish and versatile shoes suitable for both office outfits and weekend wear.",
    "retailer": "Charleskeith",
    "price": 89,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/8767ac5a-6d1c-4df5-97a0-65ddc56de03d.jpg",
    "images": [],
    "sku": "CK1-70381242_BLACK",
    "productCategory": "Shoes",
    "features": [
      "Almond toe design",
      "Classic penny tabs",
      "Shiny lock charms",
      "Very low block heels",
      "Material: Natural PU",
      "Lining: Fabric"
    ],
    "tags": [
      "loafers",
      "black",
      "shoes",
      "block heels",
      "almond toe",
      "penny tabs"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "black",
      "secondaryColors": [],
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 7,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.danielwellington.com/products/iconic-link-eggshell-white-gold",
    "name": "Iconic Link Gold",
    "description": "The Iconic Link Gold is a women's gold watch featuring a polished link bracelet made from 316L stainless steel with PVD gold coating and a white eggshell dial. It is available in 28mm and 32mm sizes, suitable for both professional everyday wear and special occasions. The watch has a Japanese quartz movement and is water resistant up to 3 ATM (rain resistant).",
    "retailer": "Danielwellington",
    "price": 169,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/bfc0c35a-51f6-4f24-a07f-375de2c627ef.png",
    "images": [],
    "sku": "DW00100567",
    "productCategory": "watch",
    "features": [
      "Gold link bracelet",
      "Stainless Steel (316L) with PVD gold plating",
      "Eggshell white dial with twelve index dial",
      "Japanese quartz movement",
      "Water resistant up to 3 ATM (rain resistant)"
    ],
    "tags": [
      "gold",
      "watch",
      "women's watch",
      "stainless steel",
      "quartz movement",
      "water resistant"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "gold",
      "secondaryColors": [],
      "material": "stainless steel",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored"
      ],
      "formalityScore": 5.7,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.danielwellington.com/products/juliette-braided-mesh-white-sunray-gold",
    "name": "Juliette Braided Mesh White Sunray Gold",
    "description": "The Juliette Braided Mesh White Sunray Gold is a minimalist ladies' watch featuring a refined oval case (20 x 26 mm) and a braided mesh strap, designed for slender wrists and everyday use. It has a stainless steel (316L) case with PVD gold coating, a white sunray dial with polished rectangular indices at 3, 6, 9, and 12 o’clock, and a debossed oval for texture and depth. The watch includes a Japanese quartz movement, water resistance up to 3 ATM (rain resistant), and interchangeable straps, weighing just 40 grams. The strap is adjustable between 125-192 mm and fastens with a fold-over clasp.",
    "retailer": "Danielwellington",
    "price": 169,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/f6dd0776-0247-4249-9f66-6d2152ef2fa1.png",
    "images": [],
    "sku": "DW00100882",
    "productCategory": "watch",
    "features": [
      "316L Stainless Steel case with PVD gold plating",
      "Braided mesh strap",
      "White sunray dial with polished rectangular indices",
      "Japanese quartz movement",
      "Water resistant up to 3 ATM (rain resistant)",
      "Interchangeable straps"
    ],
    "tags": [
      "minimalist",
      "gold",
      "braided mesh",
      "oval case",
      "Japanese quartz",
      "water resistant",
      "interchangeable strap"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "white",
      "secondaryColors": [
        "gold"
      ],
      "material": "stainless steel",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored",
        "sharp"
      ],
      "formalityScore": 6.5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-71720030-1_DK.BRW.html",
    "name": "Kaiya Penny Loafers",
    "description": "Kaiya penny loafers in dark brown featuring an effortless slip-on style, decorative slotted leather strips across the vamps, and platform soles that provide a slight lift while remaining comfortable for everyday wear. Made with Box PU material, fabric & PU lining, and PU sole, these loafers combine simplicity with refined sophistication, making them versatile enough to complement any wardrobe.",
    "retailer": "Charleskeith",
    "price": 99,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/6a0ab052-490c-4248-94ec-7be21c3ecbe4.jpg",
    "images": [],
    "sku": "CK1-71720030-1_DK.BRW",
    "productCategory": "Shoes",
    "features": [
      "Slip-on style",
      "Decorative slotted leather strips across vamps",
      "Platform soles for slight lift and comfort",
      "Material: Box PU",
      "Lining: Fabric & PU",
      "Sole material: PU"
    ],
    "tags": [
      "loafers",
      "dark brown",
      "slip-on",
      "platform sole",
      "comfortable",
      "elegant"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "brown",
      "secondaryColors": [],
      "material": "leather",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored",
        "relaxed",
        "comfort",
        "sharp"
      ],
      "formalityScore": 7.4,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/SL1-70920014_BLKTXT.html",
    "name": "Leather & Suede Bow Loafers",
    "description": "These flat loafers in black are made with genuine leather and suede. They feature covered almond toes, contrast-trim detailing and bows on the front. Suitable for both work and play, these versatile shoes will go well with most outfits.",
    "retailer": "Charleskeith",
    "price": 119,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/41f53b4a-cb47-4b0e-ae0e-461f0cbeb95c.jpg",
    "images": [],
    "sku": "SL1-70920014_BLKTXT",
    "productCategory": "Shoes",
    "features": [
      "Made with genuine leather and suede",
      "Covered almond toes",
      "Contrast-trim detailing",
      "Bows on the front",
      "Material lining: Fabric",
      "Sole material: PU"
    ],
    "tags": [
      "loafers",
      "flat shoes",
      "leather",
      "suede",
      "black",
      "bow"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "black",
      "secondaryColors": [],
      "material": "suede",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 6.8,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-90380188_BLACK.html",
    "name": "Leoi Chunky Knee-High Boots",
    "description": "These Leoi knee-high boots in black feature a minimalist design, fitted shafts, chunky ridged soles, covered round toes and back zips for easy wear. They are made of natural PU material and designed to complement minimalist dresses for versatile fall outfits that look polished and intentionally assembled.",
    "retailer": "Charleskeith",
    "price": 149,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/2005979b-bda5-4992-aa87-b41fa47840f1.jpg",
    "images": [],
    "sku": "CK1-90380188_BLACK",
    "productCategory": "Shoes",
    "features": [
      "Minimalist design",
      "Fitted shafts",
      "Chunky ridged soles",
      "Covered round toes",
      "Back zips for easy wear",
      "Material: Natural PU"
    ],
    "tags": [
      "knee-high boots",
      "black boots",
      "chunky boots",
      "fall footwear",
      "minimalist design"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "chelsea boots",
      "primaryColor": "black",
      "secondaryColors": [],
      "pattern": "solid",
      "styleTags": [
        "sharp",
        "minimal",
        "tailored",
        "streetwear",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 6.5,
      "seasonTags": [
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "cool",
        "cold",
        "mild"
      ],
      "occasionTags": [
        "night-out",
        "date",
        "office",
        "casual",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E457517-000/01",
    "name": "Men's AIRism Cotton T-Shirt | Sleeveless",
    "description": "Men's sleeveless AIRism Cotton T-Shirt featuring a regular fit and classic crew neck. Made with smooth, quick-drying AIRism fabric blended with cotton for comfort and a sleek silhouette. Includes side slits for style and ease of movement. Slightly sheer in white color depending on lighting. Made with recycled materials (53% Cotton, 47% Polyester with 30% recycled polyester fiber). Imported from Vietnam.",
    "retailer": "Uniqlo",
    "price": 9.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/c6f7feb1-db8b-4680-9a28-1ff9da911bfd.jpg",
    "images": [
      "https://media.brand.dev/72cf51aa-cbbf-4775-9fdd-ffc96c0ba389.jpg",
      "https://media.brand.dev/b4e886a4-3220-4e78-9c47-0ae1caa7ae3e.jpg",
      "https://media.brand.dev/c99006cd-0e25-4da8-94f0-1da6e3b7a805.jpg",
      "https://media.brand.dev/9d1a4770-d74b-4728-ba44-cac1a90f4a6a.jpg"
    ],
    "sku": "457517-11-003-000",
    "productCategory": "Clothing",
    "features": [
      "AIRism fabric with cotton look",
      "Stay-fresh comfort",
      "Side slits for stylish accent and movement",
      "Regular fit",
      "Classic crew neck",
      "Smooth, quick-drying fabric"
    ],
    "tags": [
      "AIRism",
      "cotton",
      "sleeveless",
      "t-shirt",
      "recycled materials",
      "quick-drying",
      "regular fit",
      "crew neck"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "white",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 3,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "white-tshirt-heavyweight"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E482868-000/00",
    "name": "Men's Baggy Jeans",
    "description": "These Men's Baggy Jeans feature a relaxed, voluminous straight-leg silhouette crafted from 100% cotton denim, offering a naturally soft feel and comfortable year-round wear. They have laser-processed whiskers and fading for a realistic worn-in look, a loose fit from hip to hem for a roomy shape, and clean lines with subtle detailing for a refined look. The jeans include practical pockets and are suitable for pairing with oversized tees, workwear layers, fleece, or structured jackets. They provide more volume than classic straight-leg jeans but more definition than wide-leg styles.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/278f9be2-234e-4f0d-8ac8-57141493078c.jpg",
    "images": [
      "https://media.brand.dev/2c8a9e2e-00db-489d-936f-ac59de224283.jpg",
      "https://media.brand.dev/cb70db31-1f8a-4a55-be5a-34efdee69e5e.jpg",
      "https://media.brand.dev/e0c002e1-0968-4a3c-b0eb-7d44561f2e1e.jpg",
      "https://media.brand.dev/fbef64d4-4761-4f38-9185-9cbeaaf64d72.jpg"
    ],
    "sku": "482868-08-029-000",
    "productCategory": "Clothing",
    "features": [
      "100% cotton denim",
      "Lightweight for year-round wear",
      "Contrast stitching and belt loop design",
      "Flat-finished rivets and buttons",
      "Loose fit with voluminous straight-leg silhouette",
      "Laser-processed whiskers and fading for worn-in look"
    ],
    "tags": [
      "baggy jeans",
      "men",
      "denim",
      "cotton",
      "straight leg",
      "loose fit",
      "casual"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 3.9,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E450543-000/00",
    "name": "Men's Cashmere Sweater",
    "description": "A premium men's cashmere sweater featuring perfected yarn thickness and knit tension for an exquisite feel described as the “gem of fibers.” It is hand-washable with special pilling-resistant processing, made from 100% cashmere, and imported. The sweater offers a luxurious and soft texture, suitable for stylish and comfortable wear.",
    "retailer": "Uniqlo",
    "price": 99.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/8a88b149-cbc0-4a78-9675-ad674b1ce14a.jpg",
    "images": [
      "https://media.brand.dev/1847226f-3695-4098-a1ed-d2a0a80157ed.jpg",
      "https://media.brand.dev/180a6900-8c53-4ae6-b142-6fd148bd74d3.jpg",
      "https://media.brand.dev/8121a62d-ac1e-4bf6-bc07-ada6741ef32d.jpg",
      "https://media.brand.dev/1fa20c69-e30b-45de-abad-8497701774f3.jpg"
    ],
    "sku": "450543-01-004-000",
    "productCategory": "Clothing",
    "features": [
      "100% Cashmere fabric",
      "Yarn thickness and knit tension perfected for premium feel",
      "Hand-washable",
      "Special pilling-resistant processing",
      "Imported"
    ],
    "tags": [
      "cashmere",
      "sweater",
      "men",
      "knitwear",
      "premium",
      "hand-washable"
    ],
    "spec": {
      "category": "top",
      "subcategory": "knit",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cashmere",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "elevated",
        "comfort",
        "relaxed"
      ],
      "formalityScore": 6.8,
      "seasonTags": [
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "cool",
        "mild",
        "cold"
      ],
      "occasionTags": [
        "dinner",
        "date",
        "office",
        "casual",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E482299-000/00",
    "name": "Men's DRY-EX T-Shirt",
    "description": "Men's DRY-EX T-Shirt designed for active wear and warm climates, featuring quick-drying DRY-EX technology, breathable mesh panels at sides and center back, fine-textured smooth fabric with subtle gloss for a premium look, and a seamless design at cuffs and hem. Regular fit offers natural movement and a streamlined silhouette. Suitable for workouts, travel, commuting, and casual layering in hot and transitional weather. Made with recycled materials.",
    "retailer": "Uniqlo",
    "price": 24.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/4c0665d7-4bf3-456a-a995-03babb5d8b95.jpg",
    "images": [
      "https://media.brand.dev/bcd8a531-e3a4-4d95-8def-c25e90895d56.jpg",
      "https://media.brand.dev/3eef8c8d-d561-4298-a2e0-b2b9b6406a96.jpg",
      "https://media.brand.dev/67e9270e-a4b5-4234-baa5-a58c0920af65.jpg",
      "https://media.brand.dev/39097085-942c-4acc-9cc3-98517f11bed6.jpg"
    ],
    "sku": "482299-54-003-000",
    "productCategory": "Clothing",
    "features": [
      "Quick-drying DRY-EX technology",
      "Breathable mesh at sides and center back",
      "Fine texture and smooth feel",
      "Subtly glossy fabric for premium look",
      "Seamless design at cuffs and hem",
      "Regular fit for natural movement"
    ],
    "tags": [
      "quick-drying",
      "breathable",
      "mesh",
      "lightweight",
      "recycled materials",
      "active wear",
      "summer",
      "regular fit"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "elevated",
        "athleisure"
      ],
      "formalityScore": 2.2,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488397-000/00",
    "name": "Men's EZY Barrel Jeans",
    "description": "Men's EZY Barrel Jeans feature a distinctive three-dimensional barrel-leg silhouette with a crisp fabric that creates a stylish look. The classic denim-look outer is paired with a pile lining that feels as comfortable as sweatpants. They have a comfortable elastic waist with a drawstring and low-profile rivets that complement the material. The fit is loose with a barrel silhouette.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/2137f809-6d51-4417-a9f6-0937283684ed.jpg",
    "images": [
      "https://media.brand.dev/7afafc5d-fea8-4755-9fd3-ad10096e2c4b.jpg",
      "https://media.brand.dev/8df3af2b-8282-4ec1-81a3-591c3b8e25bb.jpg",
      "https://media.brand.dev/9b490f1d-8667-4ddc-bbb1-8885b1b21c0a.jpg"
    ],
    "sku": "488397-08-004-000",
    "productCategory": "Men / Bottoms / Easy Pants / Jeans",
    "features": [
      "Distinctive three-dimensional barrel-leg silhouette",
      "Crisp fabric for stylish barrel-leg silhouette",
      "Classic denim-look outer with pile lining",
      "Comfortable elastic waist with drawstring",
      "Low-profile rivets complement the material",
      "Fit: Loose"
    ],
    "tags": [
      "jeans",
      "barrel-leg",
      "denim-look",
      "elastic waist",
      "drawstring",
      "casual pants"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 3.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.allbirds.com/products/mens-runner-nz-slip-on-light-grey",
    "name": "Men's Runner NZ Slip On",
    "description": "Men's Runner NZ Slip On sneakers are lightweight slip-on shoes delivering everyday comfort with a sleek profile and subtle texture. Made from a breathable blend of TENCEL™ Lyocell (tree fiber) and recycled polyester, they feature a dual-density Featherbed™ memory foam insole for plush comfort, SweetFoam® cushioning made from sugarcane for energy return, and flexible construction designed to move naturally with you. They are washable by hand and air dryable.",
    "retailer": "Allbirds",
    "price": 105,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/702ab96c-abf7-4991-9572-692e3999ed9a.png",
    "images": [
      "https://media.brand.dev/c3327ae2-c36f-4697-a233-ed1f54f2eab7.png",
      "https://media.brand.dev/c9ebccd3-bad3-4ee5-9c8f-ca30d62f6155.png"
    ],
    "sku": "MENS_RUNNER_NZ_SLIP_ON",
    "productCategory": "Footwear",
    "features": [
      "Lightweight slip-on design",
      "Made from TENCEL™ Lyocell and recycled polyester",
      "Dual-density Featherbed™ memory foam insole",
      "SweetFoam® cushioning made from sugarcane",
      "Breathable, moisture-wicking, and cool materials",
      "Flexible, functional construction"
    ],
    "tags": [
      "slip-on",
      "sneakers",
      "lightweight",
      "comfortable",
      "breathable",
      "memory foam",
      "sustainable materials"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "sneakers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "tencel",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "relaxed",
        "streetwear",
        "smart casual",
        "comfort"
      ],
      "formalityScore": 3.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "cool",
        "hot"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out",
        "date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E486080-000/00",
    "name": "Men's Souffle Yarn Sweater",
    "description": "Soft and non-itchy Souffle Yarn sweater with a roomy fit in the shoulders and body and a short length. Made from 57% Acrylic, 32% Polyester (32% recycled fiber), 8% Wool, and 3% Spandex. Features a regular fit and is not sheer. Imported. Care instructions: hand wash cold or dry clean.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1076095e-374e-493c-89d9-bf0364557f66.jpg",
    "images": [
      "https://media.brand.dev/9fa04bfc-0457-4244-bccb-c0fb8e1e3659.jpg",
      "https://media.brand.dev/bc14a2f6-8bc3-45b2-a6d3-619a7ed1c116.jpg",
      "https://media.brand.dev/08c3aaf0-38b4-4ed0-b239-ad42abd79301.jpg",
      "https://media.brand.dev/0e44d2b4-73eb-4edf-b314-5f1cee1cc612.jpg"
    ],
    "sku": "486080-08-003-000",
    "productCategory": "Men / Sweaters & Knitwear / Sweaters & Cardigans",
    "features": [
      "Soft and non-itchy Souffle Yarn",
      "Roomy fit in shoulders and body",
      "Short length",
      "Regular fit",
      "Not sheer",
      "Made with 32% recycled polyester fiber"
    ],
    "tags": [
      "sweater",
      "knitwear",
      "souffle yarn",
      "men",
      "recycled polyester",
      "regular fit"
    ],
    "spec": {
      "category": "top",
      "subcategory": "knit",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "wool",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "comfort",
        "relaxed"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "cool",
        "mild",
        "cold"
      ],
      "occasionTags": [
        "dinner",
        "date",
        "office",
        "casual",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487206-000/00",
    "name": "Men's Straight Jeans",
    "description": "Men's Straight Jeans by UNIQLO, designed in collaboration with JW ANDERSON. These jeans feature 100% cotton denim that is pre-washed for a casual, naturally faded look. They have a regular fit with a straight cut from waist to hem, offering a timeless and easy-to-wear silhouette. The jeans include branded JW ANDERSON logo front buttons and practical pockets. Suitable for year-round wear and a great alternative to slim or wide-leg jeans.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/aa056c39-fc63-47d9-bb10-1f20b248a8d4.jpg",
    "images": [
      "https://media.brand.dev/a89df120-c99b-4097-bcbd-4057e5a2033d.jpg",
      "https://media.brand.dev/4acd3608-c13f-4754-aada-3f287e9b8c38.jpg",
      "https://media.brand.dev/a7d0cdac-1738-4590-852b-9c227f5d3933.jpg",
      "https://media.brand.dev/2fad8954-70d5-4b1b-a712-147765dab296.jpg"
    ],
    "sku": "487206-67-029-000",
    "productCategory": "Clothing",
    "features": [
      "100% cotton denim",
      "Pre-washed for subtle faded finish",
      "Straight cut from waist to hem",
      "Regular fit for relaxed comfort",
      "JW ANDERSON logo front buttons",
      "Pockets for daily functionality"
    ],
    "tags": [
      "jeans",
      "straight",
      "cotton",
      "denim",
      "casual",
      "JW ANDERSON"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 3.5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.allbirds.com/products/mens-tree-dasher-relay-hanami-blue",
    "name": "Men's Tree Dasher Relay",
    "description": "The Men's Tree Dasher Relay is a laceless running shoe made from earth-friendly materials, including leftover stock yarns that create unique color variations. It features a stretch one-piece upper made from breathable Tree Knit, a TENCEL™ Lyocell (tree fiber) blend, and a responsibly-sourced wool blend heel lining for comfort and support. The shoe includes a sugarcane-based SweetFoam® midsole that is both sturdy and soft, designed for lightweight, breathable, and supportive everyday wear. It is machine washable (insoles hand wash separately) and fits true to size with a slightly wide fit.",
    "retailer": "Allbirds",
    "price": 135,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/f09380df-1afe-4cac-9b20-64de050ea94f.png",
    "images": [
      "https://media.brand.dev/a5761c69-ec06-4571-9faf-588cf9d82a4d.png",
      "https://media.brand.dev/7cb09c7d-7c4d-4850-96f6-ff1d16ffcfba.png"
    ],
    "sku": "MENS_TREE_DASHER_RELAY",
    "productCategory": "Active Shoes",
    "features": [
      "Laceless running shoe",
      "Made from leftover stock yarns for unique color variations",
      "Stretch one-piece upper made from breathable Tree Knit (TENCEL™ Lyocell blend)",
      "Responsibly-sourced wool blend heel lining for support",
      "Sugarcane-based SweetFoam® midsole for sturdy and soft cushioning",
      "Lightweight, breathable, and supportive design"
    ],
    "tags": [
      "running",
      "active",
      "sustainable",
      "eco-friendly",
      "laceless",
      "breathable",
      "lightweight",
      "supportive"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "sneakers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "wool",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "streetwear",
        "smart casual",
        "comfort",
        "athleisure"
      ],
      "formalityScore": 3.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "cool",
        "hot",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out",
        "date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.allbirds.com/products/mens-tree-runners-wheat-dark-beige",
    "name": "Men's Tree Runner - Wheat",
    "description": "The Allbirds Men's Tree Runner is a breathable and lightweight sneaker made with responsibly sourced eucalyptus tree fiber that feels silky smooth and cool on your skin. It features a breathable TENCEL™ Lyocell (tree fiber) and recycled polyester blend upper, sugarcane-based SweetFoam® cushioning with responsive energy return, a soft Merino wool-blend lining, and 100% recycled polyester laces sourced from plastic bottles. Designed for everyday wear including traveling, walking, and commuting, it offers a light, cool feel and all-day comfort. The shoe is machine washable and made in Vietnam.",
    "retailer": "Allbirds",
    "price": 100,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/aa68391a-5350-4d5e-8ba9-bffb8a14e341.png",
    "images": [
      "https://media.brand.dev/82d785f4-5f23-402b-bb39-54bcf47ab047.png",
      "https://media.brand.dev/64735d87-cf43-4c4f-8ef8-53f3d45bc9b6.png"
    ],
    "sku": "MENS_TREE_RUNNERS",
    "productCategory": "Footwear",
    "features": [
      "Breathable TENCEL™ Lyocell (tree fiber) and recycled polyester blend upper",
      "Sugarcane-based SweetFoam® cushioning with responsive energy return",
      "Soft Merino wool-blend lining",
      "100% recycled polyester laces sourced from plastic bottles",
      "Machine washable"
    ],
    "tags": [
      "sneakers",
      "breathable",
      "lightweight",
      "sustainable",
      "tree fiber",
      "Merino wool",
      "recycled materials"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "sneakers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "merino wool",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "streetwear",
        "smart casual",
        "comfort"
      ],
      "formalityScore": 3.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "cool",
        "hot",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out",
        "date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.allbirds.com/products/mens-tree-runner-nz-medium-grey",
    "name": "Men's Tree Runner NZ",
    "description": "The latest iteration of the fan-favorite Tree Runner sneaker, the Tree Runner NZ nods to Allbirds' New Zealand roots, combining ten years of innovation in a stylish and comfortable shoe. Designed for all-day wear, it features a slightly more structured build than the original, made with breathable, lightweight materials ideal for travel and everyday use.",
    "retailer": "Allbirds",
    "price": 100,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/10d58804-da1f-4831-8956-e90a81878b1b.png",
    "images": [
      "https://media.brand.dev/84685bfd-fb92-4c00-91bb-1c7f3681e92c.png",
      "https://media.brand.dev/c0694baf-f85b-42e1-9bb8-d742539ce302.png"
    ],
    "sku": "MENS_TREE_RUNNER_NZ",
    "productCategory": "Footwear",
    "features": [
      "Breathable hemp and TENCEL™ Lyocell (tree fiber) canvas upper",
      "Merino wool-blend lining for softness and comfort",
      "Sugarcane-based SweetFoam® cushioning for comfort and energy return",
      "Plush Featherbed™ dual-density memory foam insole for extra softness and bounce",
      "Machine washable (remove insoles and hand wash separately)",
      "Lightweight and breathable design"
    ],
    "tags": [
      "sneakers",
      "men's shoes",
      "sustainable materials",
      "breathable",
      "comfortable",
      "travel",
      "casual footwear"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "sneakers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "merino wool",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "streetwear",
        "smart casual",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 3.5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "cool",
        "hot",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out",
        "date"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "white-leather-sneakers"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-70380740-1_BLACK.html",
    "name": "Metallic Knot-Bar Loafers",
    "description": "Sleek and sophisticated almond-toe loafers featuring simple design with gold-tone metallic knot accents that stand out beautifully against clean black uppers, adding shine to elevate everyday look.",
    "retailer": "Charleskeith",
    "price": 89,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/eabfd92c-b28b-437f-9ac8-406701fa905f.jpg",
    "images": [],
    "sku": "CK1-70380740-1_BLACK",
    "productCategory": "Shoes",
    "features": [
      "Almond-toe design",
      "Gold-tone metallic knot accents",
      "Natural PU material",
      "Fabric & PU lining",
      "PU sole"
    ],
    "tags": [
      "loafers",
      "black",
      "metallic",
      "almond-toe",
      "PU",
      "shoes"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "gold",
      "secondaryColors": [
        "black"
      ],
      "material": "gold",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 6.2,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-60280532_BLKBOX.html",
    "name": "Metallic-Buckle Loafer Pumps",
    "description": "These loafer pumps in black feature a glossy finish, polished metallic buckles, chunky block heels, gently rounded toes and a clean-lined silhouette. They bring structure and sophistication to simple weekday looks.",
    "retailer": "Charleskeith",
    "price": 89,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/19e2e47a-a626-4c0c-a537-025c6b5eb931.jpg",
    "images": [],
    "sku": "CK1-60280532_BLKBOX",
    "productCategory": "Shoes",
    "features": [
      "Glossy finish",
      "Polished metallic buckles",
      "Chunky block heels",
      "Gently rounded toes",
      "Clean-lined silhouette",
      "Material: Box PU"
    ],
    "tags": [
      "loafer",
      "pumps",
      "black",
      "metallic buckle",
      "block heel",
      "shoes"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "black",
      "secondaryColors": [],
      "material": "metal",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored"
      ],
      "formalityScore": 7,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E478550-000/00",
    "name": "Milano Ribbed Shirt Collar Cardigan",
    "description": "A refined silhouette cardigan made with elegant knit fabric suitable for both business and casual wear. Can be styled buttoned as a top or unbuttoned as a light outer layer. The fabric is easy to care for and hand-washable. Made with recycled materials, containing 39% Cotton, 34% Polyester (34% recycled polyester fiber), and 27% Rayon. The fit is regular and the fabric is not sheer.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/fb0627b4-ad13-4479-ae9b-bf3303d90c02.jpg",
    "images": [
      "https://media.brand.dev/faf4b316-0582-4a7b-a140-d7cf91c70172.jpg",
      "https://media.brand.dev/b196a723-8592-429e-84b9-ddea23cb7c18.jpg",
      "https://media.brand.dev/e697c78e-5b5a-49af-8186-0047502e3611.jpg",
      "https://media.brand.dev/7c8511c5-8ecc-4b3f-9ec6-85888b23b070.jpg"
    ],
    "sku": "478550-09-003-000",
    "productCategory": "Men / Sweaters & Knitwear / Sweaters & Cardigans / Cardigans",
    "features": [
      "Refined silhouette",
      "Elegant knit fabric",
      "Suitable for business and casual wear",
      "Can be styled buttoned or unbuttoned",
      "Easy care fabric",
      "Hand-washable"
    ],
    "tags": [
      "cardigan",
      "knitwear",
      "recycled materials",
      "sustainable",
      "business casual",
      "regular fit"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "cardigan",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 5.5,
      "seasonTags": [
        "autumn",
        "winter",
        "spring"
      ],
      "weatherTags": [
        "cool",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "office",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK2-10160273-A_DK.BRW.html",
    "name": "Noane Side-Pocket Two-Way Bucket Bag",
    "description": "This Noane bucket bag in dark brown features a soft, slouchy silhouette, a geometric top flap with a magnetic closure, a polished silver-tone chain handle, two side pockets and detachable shoulder straps that allow the bag to be converted into a backpack. It is made of natural PU and designed for functional use with a stylish look.",
    "retailer": "Charleskeith",
    "price": 119,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/550cf0b5-c7e8-4190-a7b6-67c3c31c549e.jpg",
    "images": [],
    "sku": "CK2-10160273-A_DK.BRW",
    "productCategory": "Bags",
    "features": [
      "Soft, slouchy silhouette",
      "Geometric top flap with magnetic closure",
      "Polished silver-tone chain handle",
      "Two side pockets",
      "Detachable and adjustable shoulder straps",
      "Convertible into a backpack"
    ],
    "tags": [
      "bucket bag",
      "two-way",
      "dark brown",
      "convertible",
      "detachable strap",
      "magnetic closure",
      "natural PU"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "bag",
      "primaryColor": "silver",
      "secondaryColors": [
        "brown"
      ],
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "airport",
        "office",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.persol.com/en-us/products/0po3269s-11034e",
    "name": "Persol PO3269S with Opal Smoke Frame and Green Lenses",
    "description": "This sun frame is characterised by emblematic retro elements and an iconic appeal. Featuring the iconic Arrow, Meflecto System in a sophisticated soft champagne tone with opaline acetate effect offering the perfect seasonal colourway. Handmade in Italy. Frame color: Opal Smoke. Lenses color: Light Green.",
    "retailer": "Persol",
    "price": 363,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/f450c6f1-431a-429f-87f2-408ed813ae1f.png",
    "images": [
      "https://media.brand.dev/5db0c050-a080-4e65-91e3-7c1aa710b39d.png",
      "https://media.brand.dev/833fdb19-297d-4708-9a83-02e5c0c30381.png",
      "https://media.brand.dev/039ce0ef-8c19-40b4-9b6f-e38b6acfced9.png",
      "https://media.brand.dev/252c3d84-4b80-4b40-9597-41413072da83.png"
    ],
    "sku": "8056597409261",
    "productCategory": "Sun",
    "features": [
      "Handmade in Italy",
      "Iconic Arrow design",
      "Meflecto System for comfort",
      "Opaline acetate effect",
      "Retro style"
    ],
    "tags": [
      "sunglasses",
      "retro",
      "handmade",
      "Persol",
      "sun"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "sunglasses",
      "primaryColor": "green",
      "secondaryColors": [],
      "pattern": "solid",
      "styleTags": [
        "statement",
        "minimal",
        "mediterranean",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "rooftop-date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.danielwellington.com/products/petite-evergold-eggshell-white-gold",
    "name": "Petite Evergold",
    "description": "The Petite Evergold is a minimalist women's watch featuring an eggshell white dial and a gold-coloured mesh strap made from 316L stainless steel. It is available in diameters of 28 mm, 32 mm, and 36 mm. The watch has a slim case with PVD gold plating and a Japanese quartz movement, making it reliable for office, everyday wear, and festive occasions. It offers water resistance up to 3 ATM and interchangeable straps, combining functionality and versatility for daily use.",
    "retailer": "Danielwellington",
    "price": 145,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/aa5717fb-a72f-4ab7-8519-81d5172345da.png",
    "images": [],
    "sku": "DW00100350",
    "productCategory": "watch",
    "features": [
      "Eggshell white dial",
      "Gold-coloured mesh strap made from 316L stainless steel",
      "Slim case with PVD gold plating",
      "Japanese quartz movement",
      "Water resistance up to 3 ATM (rain resistant)",
      "Interchangeable straps"
    ],
    "tags": [
      "minimalist",
      "gold watch",
      "mesh strap",
      "stainless steel",
      "Japanese quartz",
      "water resistant",
      "interchangeable straps"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "white",
      "secondaryColors": [
        "silver",
        "gold"
      ],
      "material": "stainless steel",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487594-000/00",
    "name": "Pile Lined Fleece Combination Jacket",
    "description": "Outdoor sportswear-inspired women's jacket combining fleece and woven fabric, designed for everyday use. Features snap buttons for easy fastening and unfastening, bonded material for warmth and comfort, practical pockets on both sides and at the left chest, and raglan sleeves for ease of movement. Made from 100% polyester with recycled fibers, machine washable.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/da749a4e-a5ae-475d-8e1c-343d01685ff4.jpg",
    "images": [
      "https://media.brand.dev/5182a50e-845c-4485-b2a6-da8cf77d0bca.jpg",
      "https://media.brand.dev/39731cdc-4f10-4b06-a94c-b67b705621e0.jpg",
      "https://media.brand.dev/f95d6bc3-54aa-44d3-8aea-c17d1a99b566.jpg",
      "https://media.brand.dev/40490e61-7dba-4216-b136-fe4cbab775ef.jpg"
    ],
    "sku": "487594-01-003-000",
    "productCategory": "Women / T-Shirts, Sweats & Fleece / Fleece / Jackets",
    "features": [
      "Outdoor sportswear-inspired design combining fleece and woven fabric",
      "Snap buttons for easy fastening and unfastening",
      "Bonded material provides warmth and comfort",
      "Practical pockets on both sides and at the left chest",
      "Comfortable fit with raglan sleeves for ease of movement",
      "Made with 100% polyester (100% recycled polyester fiber)"
    ],
    "tags": [
      "fleece",
      "jacket",
      "women",
      "outdoor",
      "recycled polyester",
      "warm",
      "comfortable",
      "snap buttons"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort"
      ],
      "formalityScore": 4.2,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487608-000/00",
    "name": "Pile Lined Wide Sweatpants",
    "description": "Women's wide straight silhouette sweatpants with a special lining that provides instant warmth. Soft and warm with a smooth brushed feel. Features convenient side pockets, a sleek waist design with a comfortable fit, and a drawstring for easy adjustment. The fit is regular with a tapered silhouette and the fabric is not sheer.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/7bab3e8e-ef2c-40f6-ab03-3557eeb82403.jpg",
    "images": [
      "https://media.brand.dev/19278340-3527-4380-9774-9cee8b10d8ea.jpg",
      "https://media.brand.dev/c5e35aea-9b53-4540-ba1d-69d5494d49f5.jpg",
      "https://media.brand.dev/bb0c9f1a-20a6-4cc8-8ff5-d94424ae17fa.jpg",
      "https://media.brand.dev/467fa66c-dda5-40f4-94d5-6f81d297fcb3.jpg"
    ],
    "sku": "487608-03-003-000",
    "productCategory": "Women / Bottoms / Sweatpants",
    "features": [
      "Wide straight silhouette for a sleek look",
      "Special lining provides instant warmth",
      "Soft and warm with a smooth brushed feel",
      "Convenient side pockets",
      "Sleek waist design with comfortable fit",
      "Drawstring for easy adjustment"
    ],
    "tags": [
      "sweatpants",
      "warm",
      "lined",
      "wide",
      "comfortable",
      "drawstring",
      "pockets",
      "recycled polyester"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "joggers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "comfort",
        "athleisure",
        "minimal"
      ],
      "formalityScore": 1.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.persol.com/en-us/products/0po3019s-1196s3",
    "name": "PO3019S",
    "description": "This square-shaped style captures the essential values of the Persol brand's collections over time. Featuring the elegant arrow and Meflecto system, this model combines extreme functionality with impeccable elegance. The frame is Transparent Grey with Light Blue Gradient Dark Blue Polarized lenses. Handmade in Italy.",
    "retailer": "Persol",
    "price": 397,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/6e0bc003-fad4-4752-b5ff-cc6654a4a316.png",
    "images": [
      "https://media.brand.dev/4d3e41e8-d56a-4277-b20f-d6adfc889deb.png",
      "https://media.brand.dev/819e7b9b-e67f-4f8c-926f-7ed7965f72e9.png",
      "https://media.brand.dev/fdb9b26a-e417-41bd-b533-e8a85022fcbf.png",
      "https://media.brand.dev/f8d81b0b-180c-4c1f-9490-d637daff331b.png"
    ],
    "sku": "8056597995566",
    "productCategory": "Sun",
    "features": [
      "Polarized Lenses",
      "Handmade in Italy",
      "Elegant arrow design",
      "Meflecto system for flexibility and comfort",
      "Square-shaped frame"
    ],
    "tags": [
      "sunglasses",
      "polarized",
      "handmade",
      "italy",
      "transparent grey",
      "blue lenses",
      "square frame"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "sunglasses",
      "primaryColor": "light blue",
      "secondaryColors": [
        "grey",
        "blue"
      ],
      "pattern": "textured",
      "styleTags": [
        "statement",
        "minimal",
        "mediterranean",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.8,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "rooftop-date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.persol.com/en-us/products/0po3269s-181_r5",
    "name": "PO3269S",
    "description": "This sun frame is characterised by emblematic retro elements and an iconic appeal. Featuring the iconic Arrow, Meflecto System in a sophisticated soft champagne tone with opaline acetate effect offering the perfect seasonal colourway.",
    "retailer": "Persol",
    "price": 363,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/6515fa4d-9ba1-4e39-a7c6-72b849d0c594.png",
    "images": [
      "https://media.brand.dev/050782cf-7c96-4ccf-8b82-a4e5891fb776.png",
      "https://media.brand.dev/decf3007-c093-4335-9a52-96a604d878ec.png",
      "https://media.brand.dev/92cb0db8-fb1f-4c9b-8a01-813effe34380.png",
      "https://media.brand.dev/44a7a2a7-05d7-4ed0-8a3a-41b7a3b3f120.png"
    ],
    "sku": "8056262758328",
    "productCategory": "Sun",
    "features": [
      "Handmade in Italy",
      "Iconic Arrow design",
      "Meflecto System for comfort",
      "Soft champagne tone with opaline acetate effect"
    ],
    "tags": [
      "sunglasses",
      "retro",
      "handmade",
      "Persol",
      "PO3269S",
      "blue lenses",
      "cobalto frame"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "sunglasses",
      "primaryColor": "blue",
      "secondaryColors": [],
      "pattern": "solid",
      "styleTags": [
        "statement",
        "minimal",
        "mediterranean",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "rooftop-date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.persol.com/en-us/products/0po8001s-1242r5",
    "name": "PO8001S",
    "description": "Inspired by the understated elegance of the Italian Riviera, these panthos sunglasses are a sophisticated expression of Persol's dedication to craftsmanship, where form and function exist in perfect harmony. Each frame is handmade in Italy and presented in a dedicated tin case accompanied by an authenticity card. The featured model has a Red Havana frame with Blue lenses, size 51-19, suitable for most faces.",
    "retailer": "Persol",
    "price": 571,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1b8d35dc-04c4-469e-a01b-87b648ccf3f5.png",
    "images": [
      "https://media.brand.dev/a6ea8c11-dc10-494a-810a-558611b0113b.png",
      "https://media.brand.dev/b0e653a4-9191-4a90-8ffe-a073267edf12.png",
      "https://media.brand.dev/f8ef9518-2e41-4761-a844-9442eb5752c6.png",
      "https://media.brand.dev/5da7b616-35c3-4c58-ba0e-57f493af0a78.png"
    ],
    "sku": "8056262841846",
    "productCategory": "Sun",
    "features": [
      "Handmade in Italy",
      "Panthos style sunglasses",
      "Dedicated tin case included",
      "Authenticity card included",
      "Available with prescription lenses option",
      "Monogram engraving available (not with prescription lenses)"
    ],
    "tags": [
      "sunglasses",
      "panthos",
      "handmade",
      "Italian Riviera",
      "prescription lenses",
      "monogram"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "sunglasses",
      "primaryColor": "blue",
      "secondaryColors": [
        "red"
      ],
      "pattern": "solid",
      "styleTags": [
        "statement",
        "minimal",
        "mediterranean"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "rooftop-date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.danielwellington.com/products/quadro-5-link-evergold-eggshell-white-gold",
    "name": "Quadro 5-Link Evergold",
    "description": "The Daniel Wellington Quadro 5-Link Evergold is a rectangular ladies' watch featuring a minimalist design with a touch of luxury. It has a matte eggshell white dial and a 5-link bracelet made from 316L stainless steel with PVD gold coating. The watch includes a Japanese quartz movement, interchangeable straps, and is water resistant up to 3 ATM, making it suitable for everyday wear and formal occasions.",
    "retailer": "Danielwellington",
    "price": 219,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/62e0d091-6d3f-46f3-9f3d-d21eb606ad01.png",
    "images": [],
    "sku": "DW00100622",
    "productCategory": "watch",
    "features": [
      "Rectangular ladies' watch",
      "Matte eggshell white dial",
      "5-link bracelet made from 316L stainless steel with PVD gold coating",
      "Japanese quartz movement",
      "Interchangeable straps",
      "Water resistant up to 3 ATM (rain resistant)"
    ],
    "tags": [
      "gold",
      "watch",
      "minimalist",
      "5-link bracelet",
      "eggshell white dial",
      "Japanese quartz",
      "water resistant"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "white",
      "secondaryColors": [
        "silver",
        "gold"
      ],
      "material": "stainless steel",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored"
      ],
      "formalityScore": 6.5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.danielwellington.com/products/quadro-mini-evergold-g-champagne",
    "name": "Quadro Mini Evergold Champagne",
    "description": "The Quadro Mini Evergold Champagne is a minimalist ladies’ watch featuring a compact rectangular gold case (15.4 x 18.2 mm) and a champagne-coloured sunray dial with two index markers for a minimalist look. It has a fabric-like mesh bracelet made from stainless steel (316L) with PVD gold coating, which is infinitely adjustable (124-185 mm), interchangeable, and lightweight at 34 grams. The watch is powered by a reliable Japanese quartz movement and is water resistant up to 3 ATM, suitable for daily wear and formal occasions.",
    "retailer": "Danielwellington",
    "price": 149,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/2ce37608-b5f2-4033-aa60-11ee06b3d9ac.png",
    "images": [],
    "sku": "DW00100656",
    "productCategory": "watch",
    "features": [
      "Rectangular gold-coloured case",
      "Champagne sunray dial with two index markers",
      "Mesh strap made of stainless steel (316L) with PVD gold coating",
      "Infinitely adjustable and interchangeable strap",
      "Lightweight at 34 grams",
      "Japanese quartz movement"
    ],
    "tags": [
      "minimalist",
      "gold",
      "mesh strap",
      "ladies watch",
      "quartz movement",
      "water resistant",
      "interchangeable strap"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "silver",
      "secondaryColors": [
        "gold"
      ],
      "material": "stainless steel",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored"
      ],
      "formalityScore": 7.3,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.danielwellington.com/products/quadro-pressed-evergold-eggshell-white-gold",
    "name": "Quadro Pressed Evergold",
    "description": "The Daniel Wellington Quadro Pressed Evergold is a rectangular ladies’ watch in gold with a mesh strap made from stainless steel (316L) and a light eggshell white dial. It features a compact size of 20 x 26 mm, suitable for both professional everyday wear and festive occasions. The watch has a Japanese quartz movement for reliable accuracy and a PVD coating for long-lasting color retention. The delicate gold mesh watchband supports a square dial with sleek rounded edges and a simple white dial with a sunray index. The watch is water resistant up to 3 ATM (rain resistant) and has interchangeable straps for easy customization.",
    "retailer": "Danielwellington",
    "price": 165,
    "currency": "EUR",
    "imageUrl": "https://media.brand.dev/b39be6d1-217b-4092-acc4-da53a258baef.png",
    "images": [],
    "sku": "DW00100556",
    "productCategory": "watch",
    "features": [
      "Rectangular ladies’ watch",
      "Gold mesh watchband made of stainless steel (316L)",
      "Eggshell white square dial with sunray index",
      "Japanese quartz movement",
      "PVD coated for long-lasting color retention",
      "Water resistant up to 3 ATM (rain resistant)"
    ],
    "tags": [
      "gold",
      "women's watch",
      "mesh strap",
      "stainless steel",
      "Japanese quartz",
      "water resistant",
      "interchangeable straps"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "watch",
      "primaryColor": "white",
      "secondaryColors": [
        "silver",
        "gold"
      ],
      "material": "stainless steel",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "tailored",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.7,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "wedding",
        "casual"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488652-000/00",
    "name": "Relaxed Tailored Jacket",
    "description": "Sleek single-breasted women's jacket in a hip length that pairs well with voluminous bottoms. Made with contouring outer fabric for all-day comfort and features interior pockets. Fit is relaxed. Fabric details: Shell is 66% Polyester (66% recycled), 28% Rayon, 6% Spandex; Lining is 100% Polyester (40% recycled). Imported. Dry clean only.",
    "retailer": "Uniqlo",
    "price": 89.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/dd32b6ad-b5ae-4106-86f6-b096f920483d.jpg",
    "images": [
      "https://media.brand.dev/e7dd39e0-e173-4f9d-aa70-a4cb559f2076.jpg",
      "https://media.brand.dev/60e4b882-c31d-46d2-88d5-73beba6ff584.jpg",
      "https://media.brand.dev/3527efe2-0483-42f1-8f03-266077c93b55.jpg",
      "https://media.brand.dev/d022c876-5c1a-4772-bef9-e7eea2e2a23c.jpg"
    ],
    "sku": "488652-09-003-000",
    "productCategory": "Women / Outerwear / Blazers / Casual",
    "features": [
      "Sleek single-breasted design",
      "Hip length",
      "Contouring outer fabric for comfort",
      "Interior pockets",
      "Relaxed fit",
      "Made with recycled polyester fibers"
    ],
    "tags": [
      "jacket",
      "blazer",
      "outerwear",
      "relaxed fit",
      "recycled materials",
      "sustainable fashion"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "blazer",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "solid",
      "styleTags": [
        "tailored",
        "elevated",
        "business casual",
        "sharp",
        "minimal",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 8,
      "seasonTags": [
        "spring",
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "client-dinner",
        "office",
        "dinner",
        "gallery",
        "wedding",
        "date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E489025-000/00",
    "name": "Relaxed Tailored Jacket | Pattern",
    "description": "A sleek single-breasted women's jacket in a hip length that pairs well with voluminous bottoms. Features a micro-check pattern and is made with contouring outer fabric for all-day comfort. Includes interior pockets and has a relaxed fit.",
    "retailer": "Uniqlo",
    "price": 89.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/3fe40168-1140-44de-906b-bda2740664aa.jpg",
    "images": [
      "https://media.brand.dev/95944d42-ba88-4599-b8ef-12e46f8cfd35.jpg",
      "https://media.brand.dev/049f9e84-103b-4717-a046-5415f3125d74.jpg",
      "https://media.brand.dev/160c6522-f88e-4274-949a-a6e4b40475c3.jpg",
      "https://media.brand.dev/db260c90-8b2d-4d55-a56c-2b93ee69df0b.jpg"
    ],
    "sku": "489025-37-003-000",
    "productCategory": "Women / Outerwear / Blazers / Casual",
    "features": [
      "Sleek single-breasted design",
      "Hip length",
      "Micro-check pattern",
      "Outer fabric made with contouring material for all-day comfort",
      "Interior pockets",
      "Relaxed fit"
    ],
    "tags": [
      "jacket",
      "blazer",
      "relaxed fit",
      "micro-check",
      "outerwear",
      "casual"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "blazer",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "pattern": "checked",
      "styleTags": [
        "tailored",
        "elevated",
        "business casual",
        "sharp",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 8,
      "seasonTags": [
        "spring",
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "client-dinner",
        "office",
        "dinner",
        "gallery",
        "wedding",
        "date"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "navy-unstructured-blazer"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487595-000/00",
    "name": "Ribbed Knitted Fleece V-Neck T",
    "description": "Women's relaxed silhouette fleece top with a dropped shoulder design. Features a ribbed-looking surface texture that mimics knitwear with the warmth of fleece. Moderate V-neck for a balanced look, suitable for layering or wearing alone. Cuff design allows easy rolling up of sleeves. Not sheer, relaxed fit.",
    "retailer": "Uniqlo",
    "price": 29.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1867ad8c-bdc2-4817-bc88-9b20a11469ca.jpg",
    "images": [
      "https://media.brand.dev/5647075f-d4fc-48da-a3b8-ebf3f1931230.jpg",
      "https://media.brand.dev/02185d34-6e23-48a8-aa41-999a80256dbe.jpg",
      "https://media.brand.dev/24493380-d4e8-4fa5-938b-d29780b1cc9c.jpg",
      "https://media.brand.dev/3d31bf46-75d8-451a-95e7-5f0be76236b0.jpg"
    ],
    "sku": "487595-41-003-000",
    "productCategory": "Women / T-Shirts, Sweats & Fleece / T-Shirts and Tank Tops / Ribbed",
    "features": [
      "Relaxed silhouette with dropped shoulder design",
      "Ribbed-looking surface texture",
      "Moderate V-neck",
      "Cuff design for rolling up sleeves",
      "Not sheer",
      "Fabric composition: 61% Acrylic, 33% Rayon, 6% Polyester"
    ],
    "tags": [
      "fleece",
      "ribbed",
      "v-neck",
      "relaxed fit",
      "warm",
      "knitwear look"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 2.2,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/contents/feature/masterpiece/product/slim-straight-jeans-selvedge",
    "name": "Slim Straight Jeans/Selvedge",
    "description": "These Slim Straight Jeans feature a unique vintage texture with modern comfort. Crafted with an old-style shuttle, these selvedge jeans showcase a distinctive red thread along the edges, known as a \"red ear,\" visible when the hem is folded. They use rope dyeing technique on denim yarn, dyeing the outer surface rich indigo while leaving the inner white core intact, which becomes visible over time for a beautiful vintage effect. Made in collaboration with denim maker Kaihara, the fabric offers stretchable comfort while maintaining an authentic texture, combining traditional craftsmanship with modern comfort.",
    "retailer": "Uniqlo",
    "price": null,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1a466284-6497-46c9-9d7c-a1733b0646f2.jpg",
    "images": [],
    "sku": "slim-straight-jeans-selvedge",
    "productCategory": "Clothing",
    "features": [
      "Selvedge denim with red ear detail",
      "Rope dyeing technique for vintage effect",
      "Stretchable comfort fabric",
      "Crafted with traditional shuttle loom",
      "Collaboration with denim maker Kaihara"
    ],
    "tags": [
      "denim",
      "jeans",
      "selvedge",
      "vintage",
      "stretch",
      "classic",
      "indigo"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "jeans",
      "primaryColor": "denim",
      "secondaryColors": [
        "white",
        "red"
      ],
      "material": "denim",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 4.3,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "warm"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "night-out",
        "date",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E489415-000/00",
    "name": "Smart Wide Straight Pants | Check",
    "description": "Mid-rise design for a sleek fit at the waist. Lightweight tailored pants with two-tuck and center-pleat details and a wide straight silhouette. Micro-check pattern adds a stylish accent. Wrinkle-resistant after washing for easy care. Two-way stretch for freedom of movement. Not sheer, relaxed fit, straight silhouette, mid rise. Made from 66% Polyester (66% recycled), 28% Rayon, 6% Spandex. Imported from Vietnam.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/652d2b85-1432-4477-8d0b-d02d944ffe17.jpg",
    "images": [
      "https://media.brand.dev/dae48fdd-d037-4877-ad13-e79b0113d1a7.jpg",
      "https://media.brand.dev/895566c8-d821-49f6-aa06-35dfc20593f2.jpg",
      "https://media.brand.dev/ce100700-257d-4f24-9c06-7365447b51d6.jpg"
    ],
    "sku": "489415-37-003-000",
    "productCategory": "Women / Bottoms / Wide Leg Pants / Pleated",
    "features": [
      "Mid-rise design for a sleek fit at the waist",
      "Lightweight tailored pants with two-tuck and center-pleat details",
      "Wide straight silhouette",
      "Micro-check pattern",
      "Wrinkle-resistant after washing",
      "Two-way stretch for freedom of movement"
    ],
    "tags": [
      "pants",
      "wide leg",
      "check pattern",
      "wrinkle-resistant",
      "stretch",
      "tailored",
      "mid-rise"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "trousers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "checked",
      "styleTags": [
        "tailored",
        "minimal",
        "smart casual",
        "elevated",
        "relaxed",
        "comfort",
        "sharp"
      ],
      "formalityScore": 6.5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487939-000/00",
    "name": "Souffle Yarn Polo Sweater",
    "description": "Soft and non-itchy \"Souffle Yarn\" sweater made with finer yarn for a lightweight and comfortable feel. Features a half button-down polo style with a regular fit. Fabric composition is 62% Acrylic, 30% Polyester (30% recycled polyester fiber), 5% Wool, and 3% Spandex. Imported from Vietnam. Care instructions: hand wash cold or dry clean.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/60cb0177-aea1-4749-b61e-b32553f20f18.jpg",
    "images": [
      "https://media.brand.dev/be98ee71-dd13-4d3d-b159-9ded1a3b1e91.jpg",
      "https://media.brand.dev/77c6d7ba-3258-4553-9e28-687acb94d162.jpg",
      "https://media.brand.dev/63156b3c-4ef0-424b-b421-c7910c241d77.jpg",
      "https://media.brand.dev/0e30fa5f-d28a-4fab-84e6-b6777a634922.jpg"
    ],
    "sku": "487939-08-003-000",
    "productCategory": "Men / Sweaters & Knitwear / Sweaters & Cardigans / Souffle Yarn",
    "features": [
      "Soft and non-itchy Souffle Yarn",
      "Lightweight and comfortable feel",
      "Regular fit",
      "Not sheer",
      "Half button-down polo style",
      "Made with 30% recycled polyester fiber"
    ],
    "tags": [
      "sweater",
      "knitwear",
      "polo",
      "souffle yarn",
      "lightweight",
      "recycled polyester"
    ],
    "spec": {
      "category": "top",
      "subcategory": "polo",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "wool",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "spring",
        "summer"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E485340-000/00",
    "name": "Souffle Yarn Relaxed Cardigan",
    "description": "A women's cardigan featuring a longer length with a relaxed silhouette, made from soft brushed yarn. The fabric is sumptuously soft and non-itchy. Pilling may develop over time as part of the fabric's texture; to maintain appearance, remove pills with a lint remover or scissors without pulling. Made with recycled polyester fiber content.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/91e20f4b-36c6-4426-b7a0-e8aaa990c0e4.jpg",
    "images": [
      "https://media.brand.dev/2388edd9-7fa6-49c5-861c-928399cd7944.jpg",
      "https://media.brand.dev/20e2de7e-2c1d-4cba-9bf0-1a3dc43b0ffd.jpg",
      "https://media.brand.dev/8ddbf49e-adb1-4470-8368-b0d9d7ffced8.jpg",
      "https://media.brand.dev/15ba06d4-7730-404a-aede-d891fe1ff797.jpg"
    ],
    "sku": "485340-08-003-000",
    "productCategory": "Women / Sweaters & Knitwear / Sweaters / Souffle Yarn",
    "features": [
      "Longer length with a relaxed silhouette",
      "Made with soft brushed yarn",
      "Sumptuously soft and non-itchy",
      "Pilling may develop over time; remove pills with lint remover or scissors",
      "Contains recycled polyester fiber"
    ],
    "tags": [
      "cardigan",
      "souffle yarn",
      "relaxed fit",
      "soft",
      "non-itchy",
      "sweater",
      "knitwear"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "cardigan",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "comfort"
      ],
      "formalityScore": 4.7,
      "seasonTags": [
        "autumn",
        "winter",
        "spring"
      ],
      "weatherTags": [
        "cool",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "office",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E461420-000/00",
    "name": "Stretch Easy Ankle Pants | Denim",
    "description": "Men's Stretch Easy Ankle Pants made from authentic denim fabric with stretch for easy movement. Features a relaxed, tapered silhouette with an easy ankle length, elastic waistband with adjustable drawstring, and practical pockets. Designed for comfort and versatility across seasons, suitable for casual indoor and outdoor wear.",
    "retailer": "Uniqlo",
    "price": null,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1094d36d-331b-4fd5-864a-cb640a6990c7.jpg",
    "images": [],
    "sku": "481569",
    "productCategory": "Clothing",
    "features": [
      "Stretch denim fabric supports easy movement",
      "Authentic denim look",
      "Relaxed, tapered silhouette",
      "Easy ankle length",
      "Elastic waistband with adjustable drawstring",
      "Regular fit"
    ],
    "tags": [
      "denim",
      "stretch",
      "ankle pants",
      "elastic waist",
      "casual",
      "comfortable"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "trousers",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "denim",
      "pattern": "solid",
      "styleTags": [
        "tailored",
        "minimal",
        "smart casual",
        "elevated",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.7,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "navy-relaxed-trousers"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E455365-000/00",
    "name": "SUPIMA® Cotton T-Shirt",
    "description": "A unisex T-shirt made from 100% premium SUPIMA® cotton, offering a fine, smooth texture with long fibers for a polished surface and consistent color. Features a clean silhouette with balanced proportions, adjusted neckline, body width, and sleeve length for a refined everyday essential. The elegant collar width and precise stitching complement the fabric texture, making it suitable for warm weather wear or layering across seasons. Designed as a timeless wardrobe piece that pairs easily with denim, straight-leg pants, or tailored layers.",
    "retailer": "Uniqlo",
    "price": 24.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/48676deb-5d08-4f23-b300-0ebd04c78a45.jpg",
    "images": [
      "https://media.brand.dev/6fa0f10e-9223-4b20-9d8c-3b858378eb44.jpg",
      "https://media.brand.dev/d144484f-5ad1-4d8c-af85-73e672fcbff9.jpg",
      "https://media.brand.dev/b8c82d04-dc1d-48ef-aa3f-f1dbcd0b9422.jpg",
      "https://media.brand.dev/6560a145-c19b-440d-8416-da8d61bef452.jpg"
    ],
    "sku": "455365-68-003-000",
    "productCategory": "Clothing",
    "features": [
      "Made of premium 100% SUPIMA® cotton for a fine, smooth texture",
      "Elegant collar width and stitching complements the fabric texture",
      "Unisex design with a clean silhouette and balanced proportions",
      "Adjusted neckline, body width, and sleeve length for a balanced shape",
      "Suitable for warm weather wear or layered styling",
      "Timeless wardrobe piece that pairs easily with various outfits"
    ],
    "tags": [
      "cotton",
      "SUPIMA",
      "t-shirt",
      "unisex",
      "casual",
      "everyday wear"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 3,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK1-60280532_BURGUN.html",
    "name": "Two-Tone Metallic-Buckle Loafer Pumps",
    "description": "These loafer pumps in burgundy feature a two-tone design, a glossy finish, polished metallic buckles, chunky block heels, gently rounded toes and a clean-lined silhouette. Their comfort and versatility makes them perfect for all-day wear.",
    "retailer": "Charleskeith",
    "price": 89,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/59c16407-8093-43a5-add0-69f5fe9dd093.jpg",
    "images": [],
    "sku": "CK1-60280532_BURGUN",
    "productCategory": "Shoes",
    "features": [
      "Two-tone design",
      "Glossy finish",
      "Polished metallic buckles",
      "Chunky block heels",
      "Gently rounded toes",
      "Clean-lined silhouette"
    ],
    "tags": [
      "loafer",
      "pumps",
      "burgundy",
      "two-tone",
      "metallic buckle",
      "block heel",
      "shoes"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "loafers",
      "primaryColor": "burgundy",
      "secondaryColors": [],
      "material": "metal",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "tailored",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 7,
      "seasonTags": [
        "spring",
        "summer",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487962-000/00",
    "name": "Unisex Boxy Cropped T-Shirt",
    "description": "A trendy boxy silhouette cropped t-shirt made from 100% cotton with a natural soft texture. Features a short length and boxy fit for a modern vibe. Machine washable and imported from Vietnam.",
    "retailer": "Uniqlo",
    "price": 19.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/55144fc1-7ff6-4541-851a-127246ba6e87.jpg",
    "images": [
      "https://media.brand.dev/16e45e0c-f980-4377-8ee9-7a735b043d91.jpg",
      "https://media.brand.dev/0930df8d-8dbb-46da-9bda-b8bcb5c922ed.jpg",
      "https://media.brand.dev/28ef113e-6988-4b26-9f36-e22bc3fa52b8.jpg",
      "https://media.brand.dev/aa147b37-9bb9-4881-b358-6008fc450ef5.jpg"
    ],
    "sku": "487962-00-003-000",
    "productCategory": "Clothing",
    "features": [
      "100% cotton material with a natural soft texture",
      "Boxy silhouette",
      "Short length for a trendy vibe",
      "Machine wash cold, dry clean"
    ],
    "tags": [
      "boxy",
      "cropped",
      "t-shirt",
      "cotton",
      "unisex",
      "casual"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 1.8,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E422992-000/00",
    "name": "Unisex Crew Neck T-Shirt",
    "description": "A heavyweight cotton jersey fabric with a smooth texture and rugged look. Durable fabric built to last. Binding at the collar helps the neckline keep its shape. Neckline inspired by vintage military T-shirt designs. This unisex Crew Neck T-Shirt from the Uniqlo U collection is designed as a modern essential, balancing a clean silhouette with thoughtful fabric choice for everyday wear across seasons. Crafted from heavyweight cotton jersey made with thick yarn, it offers a smooth surface and a structured look that works well on its own in warm weather or as a reliable layering piece when temperatures drop. The mid-weight fabric makes this T-shirt adaptable for different weather, worn alone in ",
    "retailer": "Uniqlo",
    "price": 24.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/dd31f25a-4d1f-4e78-b936-19bfbb05c06b.jpg",
    "images": [
      "https://media.brand.dev/28b2e83c-7550-460a-8e01-79aada1dd803.jpg",
      "https://media.brand.dev/54ea89b8-67b9-4c5e-ab28-c08593b31aae.jpg",
      "https://media.brand.dev/b39a6452-6bb6-4073-b60a-01a5d9574d28.jpg",
      "https://media.brand.dev/64597c47-ba67-4266-8ded-095da2de8491.jpg"
    ],
    "sku": "422992-53-003-000",
    "productCategory": "Clothing",
    "features": [
      "Heavyweight cotton jersey fabric made with thick yarn",
      "Smooth finish and classic crew neck",
      "Binding at the collar maintains neckline shape",
      "Neckline inspired by vintage military T-shirt designs",
      "Unisex fit, not too loose or tight",
      "Mid-weight fabric adaptable for different weather"
    ],
    "tags": [
      "crew neck",
      "t-shirt",
      "heavyweight cotton",
      "Unisex",
      "casual wear",
      "layering",
      "Uniqlo U"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 3.3,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E470187-000/00",
    "name": "Unisex Flannel Checked Shirt",
    "description": "A unisex flannel checked shirt made from 100% cotton, brushed for a smooth feel on the outside and soft, cozy warmth on the inside. Features buttons with rounded edges for easy fastening, a shirt-tail hem with a well-balanced length that works tucked in or untucked, and a classic regular fit suitable for styling alone or layering. Machine washable and imported from Bangladesh.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1d6a3e89-70dc-4ab5-be4e-4b5c04918440.jpg",
    "images": [
      "https://media.brand.dev/f2c638fa-b155-4fc2-a38b-115db0cb3016.jpg",
      "https://media.brand.dev/0726047f-3d41-4deb-a7f6-073b27d39c85.jpg",
      "https://media.brand.dev/5562d731-5868-4952-a9c9-3dc540d6e825.jpg",
      "https://media.brand.dev/19890c70-167a-4b72-9e38-dc3bbb347991.jpg"
    ],
    "sku": "470187-15-003-000",
    "productCategory": "Clothing",
    "features": [
      "100% cotton fabric, brushed for smooth feel outside and soft warmth inside",
      "Buttons with rounded edges for easy fastening",
      "Shirt-tail hem suitable for tucked or untucked wear",
      "Classic regular fit",
      "Machine washable"
    ],
    "tags": [
      "flannel",
      "checked",
      "shirt",
      "cotton",
      "long sleeve",
      "casual"
    ],
    "spec": {
      "category": "top",
      "subcategory": "shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "minimal",
        "smart casual",
        "tailored",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "client-dinner",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E482766-000/00",
    "name": "Unisex Waffle Henley Neck T-Shirt | Long Sleeve",
    "description": "A unisex long sleeve waffle henley neck t-shirt made from a blend of 60% cotton and 40% polyester (with 40% recycled polyester fiber). Features a waffle texture fabric that is stylish and comfortable. Machine washable with gentle cycle. Imported from Cambodia. This product contains over 20% recycled materials by weight, supporting sustainability efforts.",
    "retailer": "Uniqlo",
    "price": 29.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/45b5e740-6608-4e04-a3fd-eeeba4bb826f.jpg",
    "images": [
      "https://media.brand.dev/bb5aa63d-0919-405d-85c3-34e951249beb.jpg",
      "https://media.brand.dev/fe836f0a-d8c8-49df-b28e-56c43e0d137a.jpg",
      "https://media.brand.dev/9f94fdb6-474c-4f55-b9e7-1d594d6ea726.jpg",
      "https://media.brand.dev/c039d80d-e8b7-412c-94cd-9cd198169c40.jpg"
    ],
    "sku": "482766-09-003-000",
    "productCategory": "Clothing",
    "features": [
      "Unisex long sleeve t-shirt",
      "Waffle texture fabric",
      "Henley neck design",
      "60% Cotton, 40% Polyester (40% recycled polyester fiber)",
      "Machine wash cold, gentle cycle",
      "Imported"
    ],
    "tags": [
      "long sleeve",
      "henley neck",
      "waffle texture",
      "recycled polyester",
      "sustainable",
      "t-shirt"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 3,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E481004-000/00",
    "name": "Unisex Washable Milano Ribbed Knitted T-Shirt",
    "description": "A unisex Milano ribbed knitted T-shirt designed in men's sizing, featuring a comfortable, non-clingy Milano ribbed knit fabric made with recycled materials. It offers a refined, structured appearance with a smooth surface that holds its shape better than typical cotton tees. The T-shirt is machine washable and suitable for layering or wearing alone in mild to warm conditions, bridging casual and smart-casual styles.",
    "retailer": "Uniqlo",
    "price": 39.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/703fa332-b0c1-4def-b56d-a03d31da87c4.jpg",
    "images": [
      "https://media.brand.dev/c9118af4-737a-4e86-a91e-2487668b8bd1.jpg",
      "https://media.brand.dev/47469c7d-6550-439b-8f5c-35e4961fd62c.jpg",
      "https://media.brand.dev/a0168553-cabc-41ee-88e5-df7359b38b48.jpg",
      "https://media.brand.dev/44cc2362-f0f5-4b86-b8ff-07aa949c1cde.jpg"
    ],
    "sku": "481004-09-003-000",
    "productCategory": "Clothing",
    "features": [
      "Made with recycled materials",
      "Comfortable, non-clingy Milano ribbed knit",
      "Machine washable (recommended inside out in mesh laundry bag)",
      "Regular, balanced silhouette for a cleaner look",
      "Thinner knit construction for ease of wear",
      "Knit fabric holds shape better than typical cotton tees"
    ],
    "tags": [
      "knitted",
      "ribbed",
      "t-shirt",
      "milano",
      "washable",
      "recycled materials",
      "unisex"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort",
        "tailored",
        "sharp",
        "elevated"
      ],
      "formalityScore": 3.3,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E482321-000/00",
    "name": "Washable 3D Knit Sweater",
    "description": "A unisex sweater featuring distinctive 3D Knit fabric and silhouette, perfect for casual styling. Made with a seamless knit for a gentle feel, the neckline is designed to keep its shape after extended wear. Machine-washable for easy care, recommended to wash inside out in a mesh laundry bag. Made using the special WHOLEGARMENT® technique. Fabric composition varies by color but generally 70% Acrylic and 30% Cotton. Regular fit, not sheer, no pockets.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/b56a37ca-847a-42af-a07d-4c55b6c6b716.jpg",
    "images": [
      "https://media.brand.dev/169be600-bac8-49d8-8c2e-fe2fcfe73256.jpg",
      "https://media.brand.dev/37707eaa-d086-4244-a7da-e5763619ae21.jpg",
      "https://media.brand.dev/6e6db5d8-dc19-4c8a-8e7f-0f38a2042623.jpg",
      "https://media.brand.dev/be62283c-c73d-444f-b121-5ad19bda1d6d.jpg"
    ],
    "sku": "482321-02-003-000",
    "productCategory": "Clothing",
    "features": [
      "Machine washable",
      "3D Knit fabric and silhouette",
      "Seamless knit for gentle feel",
      "Neckline designed to keep shape",
      "Made with WHOLEGARMENT® technique",
      "Regular fit"
    ],
    "tags": [
      "sweater",
      "knitwear",
      "machine washable",
      "3D knit",
      "casual",
      "unisex"
    ],
    "spec": {
      "category": "top",
      "subcategory": "knit",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "elevated",
        "comfort",
        "relaxed"
      ],
      "formalityScore": 5.2,
      "seasonTags": [
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "cool",
        "mild",
        "cold"
      ],
      "occasionTags": [
        "dinner",
        "date",
        "office",
        "casual",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E476997-000/00",
    "name": "Washable Knitted Polo Sweater | Short Sleeve",
    "description": "A unisex short sleeve polo sweater made from a smooth cotton-rayon fabric blend (49% Cotton, 38% Modal, 13% Nylon). Features a distinctive ribbed knit at the sleeves and hem, regular fit, and is machine washable (recommended to wash inside out in a mesh laundry bag). The sweater is not sheer except for the light gray color, and has no pockets. Imported, with care instructions for machine wash cold, gentle cycle, or dry clean.",
    "retailer": "Uniqlo",
    "price": 19.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/70b28abf-246c-48ac-9238-b3822e26ebb5.jpg",
    "images": [
      "https://media.brand.dev/7ff5300b-7a1c-4fda-897a-f247977c8843.jpg",
      "https://media.brand.dev/c6d4a243-2f47-467a-b667-6fe6a9e85d52.jpg",
      "https://media.brand.dev/11b15d6b-aeb7-4e1e-9341-014b78bd93d8.jpg",
      "https://media.brand.dev/0201f2d8-db2f-4b97-9778-0413bef3bf58.jpg"
    ],
    "sku": "476997-64-003-000",
    "productCategory": "Clothing",
    "features": [
      "Machine washable (recommended inside out in mesh laundry bag)",
      "Smooth cotton-rayon fabric",
      "Distinctive ribbed knit at sleeves and hem",
      "Regular fit",
      "Not sheer except light gray color",
      "No pockets"
    ],
    "tags": [
      "knitted",
      "polo",
      "sweater",
      "short sleeve",
      "machine washable",
      "cotton-rayon",
      "ribbed knit"
    ],
    "spec": {
      "category": "top",
      "subcategory": "polo",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "spring",
        "summer"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E482328-000/00",
    "name": "Washable Knitted Skipper Polo Sweater",
    "description": "A unisex washable knitted skipper polo sweater combining the polish of a polo with the ease of a lightweight knit, ideal for everyday wear in mild to transitional weather. Made from smooth cotton-rayon fabric with a soft texture and refined drape, featuring a skipper-style open collar for a relaxed yet elevated look. It has ribbed knit at the sleeves and hem for subtle structure, elevated stitching detail for a polished finish, and a regular fit for ease of movement. Machine washable and suitable for layering or wearing alone as a versatile alternative to traditional polo shirts.",
    "retailer": "Uniqlo",
    "price": 39.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/ad91d429-0954-4bfc-9ede-fbf976087cbf.jpg",
    "images": [
      "https://media.brand.dev/9d4fec6b-b7f7-4dcc-84b2-28ead2f03c10.jpg",
      "https://media.brand.dev/a4a8c8fb-7021-4f0a-a47c-f3705a890a3b.jpg",
      "https://media.brand.dev/79d31ca6-8b8f-47f7-afcf-9b38e41ab639.jpg",
      "https://media.brand.dev/a05e4b9f-efad-4dcf-b737-f6e06703731f.jpg"
    ],
    "sku": "482328-79-003-000",
    "productCategory": "Clothing",
    "features": [
      "Smooth cotton-rayon knit fabric (53% Cotton, 35% Modal, 12% Nylon)",
      "Skipper-style open collar",
      "Regular fit",
      "Ribbed knit at sleeves and hem",
      "Elevated stitching detail",
      "Lightweight knit suitable for spring, early fall, and indoor wear"
    ],
    "tags": [
      "knitted",
      "polo",
      "sweater",
      "washable",
      "cotton-rayon",
      "lightweight",
      "unisex",
      "casual"
    ],
    "spec": {
      "category": "top",
      "subcategory": "polo",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "relaxed",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "spring",
        "summer"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E482325-000/00",
    "name": "Washable Milano Ribbed Skipper Polo Sweater",
    "description": "Milano rib knit in a skipper design for a refined look. Classic knit appearance with easy-care material and details. Machine washable. Crisp knitted fabric for a comfortably fitted feel. Made from 42% Cotton, 30% Polyester, 28% Rayon (30% recycled polyester fiber). Imported. Recommended to wash inside out in a mesh laundry bag.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/af05279e-b80d-4f45-81ae-fbb7408d46d3.jpg",
    "images": [
      "https://media.brand.dev/de435049-ce1b-402f-91c1-d81fa86f0e6b.jpg",
      "https://media.brand.dev/b423bf66-1e99-4d64-8577-48738033f2dd.jpg",
      "https://media.brand.dev/0f2e7deb-dc0f-448a-a80e-45c969622b2a.jpg",
      "https://media.brand.dev/1a57b99e-4d2e-40ea-a533-cb196865f759.jpg"
    ],
    "sku": "482325-31-003-000",
    "productCategory": "Men / Sweaters & Knitwear / Sweaters & Cardigans / Milano Ribbed",
    "features": [
      "Milano rib knit",
      "Skipper design",
      "Classic knit appearance",
      "Easy-care material",
      "Machine washable",
      "Crisp knitted fabric"
    ],
    "tags": [
      "washable",
      "milano ribbed",
      "skipper polo sweater",
      "knitwear",
      "machine washable",
      "recycled polyester"
    ],
    "spec": {
      "category": "top",
      "subcategory": "polo",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "elevated",
        "smart casual",
        "relaxed",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 6.3,
      "seasonTags": [
        "spring",
        "summer"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "brunch",
        "office",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev",
    "archetypeId": "black-knit-polo"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E453754-000/00",
    "name": "Washable Milano Ribbed Sweater",
    "description": "A unisex Milano ribbed sweater made with recycled materials, featuring a refined silhouette and knit fabric suitable for both business and casual wear. It has a perfectly crisp feel with meticulous design details including a ribbed collar that joins seamlessly to the body for comfort. The sweater is machine washable (recommended to turn inside out and wash in a net) and contains 39% Cotton, 34% Polyester, and 27% Rayon, with 34% recycled polyester fiber. It is imported and produced in China, Cambodia, and Vietnam.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/1baa73e6-10f2-4fac-837a-4cc16ab95248.jpg",
    "images": [
      "https://media.brand.dev/e868d430-7a07-4eaa-9822-be3f8d418dad.jpg",
      "https://media.brand.dev/f4404aa3-2ec9-45a4-a69d-57d725f7a92e.jpg",
      "https://media.brand.dev/bf92e630-1fd0-47fc-a273-255516429715.jpg",
      "https://media.brand.dev/a89fd17e-9114-4562-8629-1381a7713d75.jpg"
    ],
    "sku": "453754-03-003-000",
    "productCategory": "Clothing",
    "features": [
      "Machine washable (recommend turning inside out and washing in a net)",
      "Perfectly crisp feel",
      "Ribbed collar joins seamlessly to body for comfort",
      "Refined silhouette suitable for business and casual wear",
      "Made with recycled materials (34% recycled polyester fiber)",
      "Fabric composition: 39% Cotton, 34% Polyester, 27% Rayon"
    ],
    "tags": [
      "sweater",
      "ribbed",
      "washable",
      "recycled materials",
      "knitwear",
      "unisex"
    ],
    "spec": {
      "category": "top",
      "subcategory": "knit",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "textured",
      "styleTags": [
        "minimal",
        "elevated",
        "comfort",
        "relaxed",
        "tailored",
        "sharp"
      ],
      "formalityScore": 6,
      "seasonTags": [
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "cool",
        "mild",
        "cold"
      ],
      "occasionTags": [
        "dinner",
        "date",
        "office",
        "casual",
        "gallery"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487603-000/00",
    "name": "Windproof Fleece Reversible Full-Zip Hoodie",
    "description": "Women's windproof fleece hoodie with a reversible design and water-repellent finish that repels light rain. Features an adjuster at the hem to keep cold air out. Made of 100% polyester face and back fabric. Relaxed fit, not sheer. Machine washable.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/a1964479-833c-4712-a5b4-d38da9ea285b.jpg",
    "images": [
      "https://media.brand.dev/cc0eec43-951c-4c3f-b0e9-23e42bed5e37.jpg",
      "https://media.brand.dev/7c7c0a24-b101-4426-b96f-7595d4af87dd.jpg",
      "https://media.brand.dev/b7757ca4-9c19-479d-a843-818dd4a32bd6.jpg",
      "https://media.brand.dev/ace92c40-c0a5-432d-923a-fb97e7765a4c.jpg"
    ],
    "sku": "487603-09-003-000",
    "productCategory": "Women / Outerwear / Jackets & Parkas / Jackets",
    "features": [
      "Water-repellent finish repels light rain (fabric coated with water-repellent agent, finish not permanent)",
      "Reversible design",
      "Adjuster at the hem to keep cold air out",
      "Relaxed fit",
      "Not sheer",
      "Made of 100% polyester face and back"
    ],
    "tags": [
      "windproof",
      "fleece",
      "reversible",
      "full-zip",
      "hoodie",
      "water-repellent",
      "outerwear",
      "jackets"
    ],
    "spec": {
      "category": "top",
      "subcategory": "hoodie",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "polyester",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "streetwear",
        "comfort",
        "minimal"
      ],
      "formalityScore": 1.7,
      "seasonTags": [
        "autumn",
        "winter"
      ],
      "weatherTags": [
        "cool",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E480054-000/00",
    "name": "Women's AIRism Cotton T-Shirt | Striped",
    "description": "A women's relaxed fit, short sleeve T-shirt made from smooth AIRism fabric that looks like cotton with quick-drying DRY technology. Features a slightly narrow ribbed neckline, boxy silhouette with side slits and asymmetric hem for style accents. The fabric is 70% cotton and 30% polyester, offering a sleek surface and comfortable contouring material ideal for everyday wear, commuting, and travel.",
    "retailer": "Uniqlo",
    "price": 14.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/6051cbec-e581-40c7-8997-70d5ec6cc653.jpg",
    "images": [
      "https://media.brand.dev/15572e9e-c6ec-435e-88b3-29425f078984.jpg",
      "https://media.brand.dev/0da8c17f-5118-4a4b-97bd-fb29d2641925.jpg",
      "https://media.brand.dev/2459ce47-3ea1-4af0-9974-1f78f9d88128.jpg",
      "https://media.brand.dev/e7b2b560-a6b5-458b-8c1f-da02b290c54d.jpg"
    ],
    "sku": "480054-39-003-000",
    "productCategory": "Clothing",
    "features": [
      "Smooth AIRism fabric with cotton look",
      "Quick-drying DRY technology",
      "Slightly narrow ribbed neckline",
      "Boxy silhouette with relaxed width and regular length",
      "Side slits and asymmetric hem",
      "70% Cotton, 30% Polyester"
    ],
    "tags": [
      "AIRism",
      "Cotton",
      "T-Shirt",
      "Striped",
      "Relaxed fit",
      "Short sleeve",
      "Crew neck"
    ],
    "spec": {
      "category": "top",
      "subcategory": "t-shirt",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "striped",
      "styleTags": [
        "relaxed",
        "minimal",
        "streetwear",
        "comfort"
      ],
      "formalityScore": 1.8,
      "seasonTags": [
        "summer",
        "spring"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E491201-000/00",
    "name": "Women's Barn Short Jacket",
    "description": "A relaxed fit women's short jacket made with pre-washed cotton-blend material that keeps a perfectly crisp silhouette. Features a contrast-color corduroy collar, checked lining and cuff facings for a casual look, gusseted pleats at the back creating a voluminous A-line silhouette, and double pockets accessible from the top or side. Short length for a well-balanced look. Imported from Vietnam.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/8b4f275b-d6ff-4ed8-b923-06e477b9b646.jpg",
    "images": [
      "https://media.brand.dev/bd44a64a-221d-403d-8030-8d81b8be8e3a.jpg",
      "https://media.brand.dev/2700c2e2-6c3a-44b0-968e-f3b8cb97dd60.jpg",
      "https://media.brand.dev/4a0d366f-f0fa-4e85-835f-389fc9603a53.jpg",
      "https://media.brand.dev/4b4aeded-cf8a-44a2-a4b4-063ec06ed6f7.jpg"
    ],
    "sku": "491201-09-003-000",
    "productCategory": "Clothing",
    "features": [
      "Pre-washed cotton-blend material",
      "Contrast-color corduroy collar",
      "Checked lining and cuff facings",
      "Gusseted pleats at the back for A-line silhouette",
      "Double pockets accessible from top or side",
      "Short length"
    ],
    "tags": [
      "jacket",
      "cotton-blend",
      "corduroy collar",
      "checked lining",
      "A-line silhouette",
      "relaxed fit",
      "short jacket"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort"
      ],
      "formalityScore": 4.2,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E483807-000/00",
    "name": "Women's Barn Short Jacket",
    "description": "A relaxed, easy-to-layer women's outerwear jacket made from pre-washed cotton fabric that creates a crisp, sharp look. Features gusseted back pleats for a voluminous A-line silhouette, contrast color corduroy collar and lining, checked pattern on cuff lining, and double-entry pockets accessible from top and side. The short length pairs well with high-rise bottoms or layered tops. Oversized fit for easy layering in cool-to-mild weather.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/5b4df8ff-efee-4e93-a651-d318d64436da.jpg",
    "images": [
      "https://media.brand.dev/c74c4314-3a22-4343-8641-c9b62ecd725d.jpg",
      "https://media.brand.dev/8c5512c3-857b-4187-a045-341471aea2a7.jpg",
      "https://media.brand.dev/33685f5f-ad08-40ef-aed8-ffd21df5b14e.jpg",
      "https://media.brand.dev/11ab4399-759f-4ed4-bbe2-0ac4d576ac35.jpg"
    ],
    "sku": "483807-33-003-000",
    "productCategory": "Clothing",
    "features": [
      "Pre-washed cotton fabric for crisp feel",
      "Gusseted back pleats for A-line shape",
      "Contrast color corduroy collar and lining",
      "Checked pattern on cuff lining",
      "Double-entry pockets accessible from top and side",
      "Short length"
    ],
    "tags": [
      "jacket",
      "cotton",
      "oversized",
      "outerwear",
      "casual",
      "spring",
      "fall"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 3.8,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E484664-000/00",
    "name": "Women's Barn Short Jacket | Denim",
    "description": "The Women's Barn Short Jacket in denim features pre-washed cotton fabric that maintains a crisp, structured silhouette. It has an oversized fit ideal for layering over mid-weight tops, fleece, or lightweight knits during transitional weather. Gusseted back pleats create a voluminous A-line shape, and the jacket includes a contrast corduroy collar and lining with a checked cuff lining for a casual, vintage-inspired look. Double-entry pockets accessible from the top and sides add practicality. The short length balances well with high-rise bottoms or wide-leg silhouettes.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/d4fc9b3b-24c7-4e24-a3fa-725b51a4a499.jpg",
    "images": [
      "https://media.brand.dev/cb716732-5c14-448a-b4c5-05db691bd53f.jpg",
      "https://media.brand.dev/6c88bea4-2ac2-43b7-bb71-c9c4b45cb1d0.jpg",
      "https://media.brand.dev/d5619607-a025-49fd-8d9c-e4c5f6a9e428.jpg",
      "https://media.brand.dev/71f4817b-fe5c-4cbf-8b58-c0744637a3fb.jpg"
    ],
    "sku": "484664-69-003-000",
    "productCategory": "Clothing",
    "features": [
      "Pre-washed cotton fabric for a crisp silhouette",
      "Oversized fit for easy layering",
      "Gusseted back pleats creating A-line shape",
      "Contrast corduroy collar and lining",
      "Checked cuff lining visible when sleeves are rolled",
      "Double-entry pockets accessible from top and sides"
    ],
    "tags": [
      "denim",
      "jacket",
      "oversized",
      "casual",
      "cotton",
      "barn jacket"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 4.1,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E489191-000/00",
    "name": "Women's Brushed Jersey Barrel Pants",
    "description": "Barrel silhouette in soft brushed jersey material designed for lasting comfort. Features back welt pockets and a minimal waist design for a polished look. The contouring jersey fabric may shrink slightly after washing; hem should be kept slightly long if altered. Fit is relaxed with a mid rise and barrel silhouette. Fabric composition is 48% Polyester, 38% Cotton, 14% Rayon (30% recycled polyester fiber). Machine wash cold, gentle cycle, or dry clean. Imported from Cambodia.",
    "retailer": "Uniqlo",
    "price": 49.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/e61d911b-8be7-49f3-9f5e-679bd522799a.jpg",
    "images": [
      "https://media.brand.dev/3eb5beae-ed1a-45b7-b96e-48edc5f5bc2e.jpg",
      "https://media.brand.dev/6c0aef47-ab13-4c75-b7f4-5b13e63f6eec.jpg",
      "https://media.brand.dev/0d815074-02c5-4035-8cfe-fc58f2973815.jpg",
      "https://media.brand.dev/ff58f2ab-d7de-4a31-9e7d-2ff34d8893a8.jpg"
    ],
    "sku": "489191-08-003-000",
    "productCategory": "Women / Bottoms / Barrel Pants / Regular Lengths",
    "features": [
      "Barrel silhouette",
      "Soft brushed jersey material",
      "Back welt pockets",
      "Minimal waist design",
      "Relaxed fit",
      "Mid rise"
    ],
    "tags": [
      "barrel pants",
      "brushed jersey",
      "relaxed fit",
      "mid rise",
      "recycled polyester",
      "comfortable",
      "UNIQLO"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "trousers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "tailored",
        "minimal",
        "smart casual",
        "elevated",
        "relaxed",
        "comfort"
      ],
      "formalityScore": 5.7,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "warm",
        "mild",
        "hot"
      ],
      "occasionTags": [
        "date",
        "rooftop-date",
        "dinner",
        "office",
        "client-dinner",
        "gallery",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488200-000/00",
    "name": "Women's Corduroy Short Jacket",
    "description": "A short length jacket with a boxy silhouette featuring double pockets at the front and additional front and side pockets for a utility-inspired look. Made from corduroy material with a natural texture. Part of the UNIQLO and COMPTOIR DES COTONNIERS special collaboration collection. Fit is regular.",
    "retailer": "Uniqlo",
    "price": 79.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/6154d4ff-49cf-4627-8a46-6f3766c81ee0.jpg",
    "images": [
      "https://media.brand.dev/2a9a5c9d-a6da-4fbb-8c0f-ab62025e4742.jpg",
      "https://media.brand.dev/fdb02605-1780-4d74-900a-796cf3f1d57f.jpg",
      "https://media.brand.dev/964e09b6-6092-40f3-b30a-4d21eba40ee7.jpg",
      "https://media.brand.dev/d1c1266b-5070-43f2-96f2-972cc6462de1.jpg"
    ],
    "sku": "488200-67-003-000",
    "productCategory": "Women / Special Collaborations / UNIQLO and COMPTOIR DES COTONNIERS / Outerwear",
    "features": [
      "Short length with boxy silhouette",
      "Double pockets at the front",
      "Front and side pockets for utility-inspired look",
      "Corduroy material with natural texture",
      "Fit: Regular"
    ],
    "tags": [
      "corduroy",
      "short jacket",
      "outerwear",
      "women",
      "UNIQLO",
      "COMPTOIR DES COTONNIERS",
      "special collaboration"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal"
      ],
      "formalityScore": 4.6,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487518-000/00",
    "name": "Women's Padded Utility Short Jacket",
    "description": "A short-length padded jacket inspired by a barn jacket, featuring a distinctive corduroy collar and a light, natural textured outer fabric. It has two-way pockets accessible from the side or top and a water-repellent finish that protects against light rain (finish is not permanent). The fit is relaxed for effortless styling.",
    "retailer": "Uniqlo",
    "price": 89.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/f148ce40-6cc9-46e4-919b-d143ae0d7d84.jpg",
    "images": [
      "https://media.brand.dev/6ecb88e1-99ea-418a-80e1-ddb4d3fb6e7e.jpg",
      "https://media.brand.dev/d8141fe5-d061-4da8-a891-b27e48f64d67.jpg",
      "https://media.brand.dev/5e23b9e5-ef86-47cc-b57a-2c6b5ec6a19f.jpg",
      "https://media.brand.dev/affdd408-a71f-43ed-a8b3-3ec5d6d5b5e5.jpg"
    ],
    "sku": "487518-32-003-000",
    "productCategory": "Women / Outerwear / Jackets & Parkas / Jackets",
    "features": [
      "Padded outer layer inspired by a barn jacket",
      "Distinctive corduroy collar",
      "Light, natural texture outer fabric",
      "Two-way pockets accessible from side or top",
      "Water-repellent finish protects against light rain",
      "Short length for effortless styling"
    ],
    "tags": [
      "padded",
      "utility",
      "short jacket",
      "outerwear",
      "water-repellent",
      "corduroy collar",
      "relaxed fit"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "pattern": "textured",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort"
      ],
      "formalityScore": 4.2,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E487408-000/00",
    "name": "Women's PUFFTECH Jacket",
    "description": "The Women's PUFFTECH Jacket features high-performance PUFFTECH padding made with advanced hollow fiber technology that is lightweight, warm, and retains heat even in high humidity. It has a water-repellent finish for light rain protection, a sleek front placket, and comes with a convenient storage pouch. The jacket uses a special double-weave fabric with no needle holes to keep padding inside and elements out, designed with a shorter length and anti-static lining. It is hand-washable and dries faster than natural down.",
    "retailer": "Uniqlo",
    "price": 79.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/6f695694-9237-4bcc-a662-68eb5d7c55a3.jpg",
    "images": [
      "https://media.brand.dev/4d490cf7-ebd5-451f-8d74-133f7c24bf78.jpg",
      "https://media.brand.dev/4644cc74-9d1a-4aa0-918a-3e900a523315.jpg",
      "https://media.brand.dev/9a4807a6-8848-4c9c-8c6b-0105aa9f690d.jpg",
      "https://media.brand.dev/43f93bbf-3f97-4e64-abcd-4295306cf524.jpg"
    ],
    "sku": "487408-35-003-000",
    "productCategory": "Outerwear",
    "features": [
      "High-performance PUFFTECH padding with hollow fibers about 1/5 thickness of human hair",
      "Lightweight and warm with excellent heat retention even in humidity above 90%",
      "Water-repellent finish protects against light rain (not permanent)",
      "Front placket for a sleek, refined look",
      "Comes with a convenient storage pouch",
      "Special double-weave fabric with no needle holes to keep padding inside and elements out"
    ],
    "tags": [
      "PUFFTECH",
      "jacket",
      "outerwear",
      "lightweight",
      "water-repellent",
      "warm",
      "hand-washable",
      "recycled materials"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "down",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "tailored",
        "sharp",
        "elevated",
        "athleisure"
      ],
      "formalityScore": 5.8,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.allbirds.com/products/womens-tree-runner-nz-medium-grey",
    "name": "Women's Tree Runner NZ",
    "description": "The Women's Tree Runner NZ is a stylish and comfortable sneaker designed for all-day wear and travel. It features a breathable canvas upper made from a blend of hemp and TENCEL™ Lyocell (tree fiber), a Merino wool blend lining for softness, and a sugarcane-based SweetFoam® midsole that provides sturdy yet soft cushioning with responsive energy return. The shoe includes a plush Featherbed™ dual-density memory foam insole for extra comfort and bounce. It is lightweight, supportive, and responsibly sourced, making it an ideal choice for everyday use, commuting, walking, and warm weather.",
    "retailer": "Allbirds",
    "price": 100,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/45fc3446-2495-434d-ade6-1615d37022d0.png",
    "images": [
      "https://media.brand.dev/4ed61b12-120c-44eb-84b0-bc431eae3b58.png"
    ],
    "sku": "WOMENS_TREE_RUNNER_NZ",
    "productCategory": "Footwear",
    "features": [
      "Breathable canvas upper made from hemp and TENCEL™ Lyocell blend",
      "Merino wool blend lining for softness and comfort",
      "Sugarcane-based SweetFoam® midsole cushioning with energy return",
      "Plush Featherbed™ dual-density memory foam insole",
      "Lightweight and supportive design",
      "Machine washable (remove insoles and hand wash separately)"
    ],
    "tags": [
      "sneakers",
      "breathable",
      "lightweight",
      "sustainable",
      "Merino wool",
      "SweetFoam",
      "memory foam",
      "travel"
    ],
    "spec": {
      "category": "shoes",
      "subcategory": "sneakers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "merino wool",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "streetwear",
        "smart casual",
        "comfort"
      ],
      "formalityScore": 3.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "warm",
        "cool",
        "hot",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "brunch",
        "airport",
        "night-out",
        "date"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E481248-000/00",
    "name": "Women's Wide Sweatpants | Short",
    "description": "Women's Wide Sweatpants | Short feature an on-trend gathered elasticated waist with an inner drawstring for adjustable comfort. Made from soft fleece-lined fabric (86% Cotton, 14% Polyester with recycled polyester fiber), these sweatpants have a moderately wide straight silhouette and side pockets, suitable for cool to mild weather. They offer a loose, comfortable fit and a shorter length alternative to regular wide-leg sweatpants, ideal for indoor or outdoor casual wear.",
    "retailer": "Uniqlo",
    "price": 39.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/22e5e537-a499-45ed-9e29-67c511ed0425.jpg",
    "images": [
      "https://media.brand.dev/173500f6-7701-4334-9c17-b18c6a9d7d5f.jpg",
      "https://media.brand.dev/28717609-c091-441b-8584-5bafb36cc0ac.jpg",
      "https://media.brand.dev/8c41a300-eaa2-4e41-b73f-7316ae753a1e.jpg",
      "https://media.brand.dev/e569fc17-237b-45db-b767-77ba71105647.jpg"
    ],
    "sku": "481248-69-003-000",
    "productCategory": "Clothing",
    "features": [
      "On-trend gathered elasticated waist",
      "Inner waist drawstring for size adjustment",
      "Soft fleece-lined fabric",
      "Side pockets",
      "Loose, straight silhouette",
      "Shorter length than regular wide-leg sweatpants"
    ],
    "tags": [
      "sweatpants",
      "wide",
      "short",
      "fleece-lined",
      "casual",
      "comfortable",
      "elastic waist",
      "side pockets"
    ],
    "spec": {
      "category": "bottom",
      "subcategory": "joggers",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "comfort",
        "athleisure"
      ],
      "formalityScore": 1.2,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "airport"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E479208-000/00",
    "name": "Women's Zip-Up Short Jacket",
    "description": "A modern everyday outer layer inspired by vintage barn jackets, featuring a relaxed, oversized silhouette for easy layering in cool-to-mild weather. Made from a moderately crisp cotton blend fabric that maintains a structured shape, with corduroy accents at the collar and cuffs. Includes chest and side pockets for functional storage. The short length pairs well with high-rise bottoms, mid-weight fleece, or lightweight knits for transitional styling. Product-washed for a casual, lived-in look.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/4e13254b-8994-4b82-9bba-33ddbe9b9c3c.jpg",
    "images": [
      "https://media.brand.dev/745b41a6-0519-44bd-b058-685ece9c6227.jpg",
      "https://media.brand.dev/403a2657-1b53-418f-a0a8-69806eb62377.jpg",
      "https://media.brand.dev/6c697f5b-d4d6-4eb7-b965-6507e6d8c41a.jpg",
      "https://media.brand.dev/83222828-e963-46ff-a446-614b0e2b4d32.jpg"
    ],
    "sku": "479208-32-003-000",
    "productCategory": "Clothing",
    "features": [
      "Oversized silhouette for comfortable layering",
      "Moderately crisp cotton blend fabric maintains shape",
      "Corduroy collar and cuffs add soft accent",
      "Chest and side pockets for storage",
      "Short length pairs well with various bottoms",
      "Vintage-inspired design"
    ],
    "tags": [
      "jacket",
      "zip-up",
      "cotton blend",
      "corduroy",
      "oversized",
      "outerwear",
      "casual",
      "transitional"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort",
        "tailored",
        "sharp"
      ],
      "formalityScore": 4.1,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.charleskeith.com/us/CK2-30671782-1_STO.GR.html",
    "name": "XL Calla Tote Bag",
    "description": "This XL Calla tote bag is made with faux suede and features double handles, a detachable pouch, a magnetic closure and a capacious interior. It contains recycled material and is designed for a striking yet understated look when paired with tonal separates.",
    "retailer": "Charleskeith",
    "price": 159,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/db1816a0-eaa8-4bf0-aeff-6d86172b5a02.jpg",
    "images": [],
    "sku": "CK2-30671782-1_STO.GR",
    "productCategory": "Bags",
    "features": [
      "Made with faux suede",
      "Double handles",
      "Detachable pouch",
      "Magnetic closure",
      "Capacious interior",
      "Contains recycled material"
    ],
    "tags": [
      "tote bag",
      "faux suede",
      "recycled material",
      "magnetic closure",
      "detachable pouch",
      "XL size",
      "stone grey"
    ],
    "spec": {
      "category": "accessory",
      "subcategory": "bag",
      "primaryColor": "beige",
      "secondaryColors": [
        "grey"
      ],
      "material": "suede",
      "pattern": "solid",
      "styleTags": [
        "minimal",
        "relaxed",
        "statement"
      ],
      "formalityScore": 5,
      "seasonTags": [
        "all-season"
      ],
      "weatherTags": [
        "hot",
        "warm",
        "mild",
        "cool",
        "cold"
      ],
      "occasionTags": [
        "casual",
        "airport",
        "office",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488787-000/00",
    "name": "Zip-Up Short Jacket | Denim",
    "description": "Women's oversized zip-up short jacket made from washed denim fabric with a crisp material that keeps its shape well. Features corduroy accents at the collar and cuffs, chest and side pockets, and a horizontal seam detail at the back for a sleek look. Suitable for casual wear with rolled-up sleeves style.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/032d2d99-fee3-4050-aa0b-07a1841c6568.jpg",
    "images": [
      "https://media.brand.dev/b41fb5ad-f30c-4d52-a328-8a32c6e6ec72.jpg",
      "https://media.brand.dev/4159b666-6796-47c6-8da7-4839f5c4a16e.jpg",
      "https://media.brand.dev/a2b84734-505c-4eb7-b836-bc0190a29d9b.jpg",
      "https://media.brand.dev/da4ee86b-41ba-426f-a1e4-adb466e1bbbf.jpg"
    ],
    "sku": "488787-69-003-000",
    "productCategory": "Women / Outerwear / Jackets & Parkas / Jackets",
    "features": [
      "Made from 100% cotton washed denim fabric",
      "Crisp material keeps its shape",
      "Corduroy accents at collar and cuffs",
      "Chest and side pockets",
      "Horizontal seam detail at the back",
      "Oversized fit"
    ],
    "tags": [
      "denim",
      "jacket",
      "zip-up",
      "outerwear",
      "oversized",
      "cotton"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "denim",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "solid",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal"
      ],
      "formalityScore": 3.8,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  },
  {
    "url": "https://www.uniqlo.com/us/en/products/E488785-000/00",
    "name": "Zip-Up Short Jacket | Pattern",
    "description": "Women's zip-up short jacket featuring a micro-check pattern with horizontal seam detail at the back for a sleek look. Made from a crisp cotton-blend material that keeps its shape well and is pre-washed for a vintage look. Includes corduroy accents at the collar and cuffs, chest and side pockets, and an oversized fit. Easy to layer like a shirt jacket.",
    "retailer": "Uniqlo",
    "price": 59.9,
    "currency": "USD",
    "imageUrl": "https://media.brand.dev/5323b34d-1b8a-4e63-9157-4ac13fe32d42.jpg",
    "images": [
      "https://media.brand.dev/4441fa1d-608d-4bf1-a2d9-58f645990de2.jpg",
      "https://media.brand.dev/09d602ae-6a5c-430a-84bc-62cd1c9299ef.jpg",
      "https://media.brand.dev/b4dcbb84-6b9a-4b19-b6ae-c06c3dabcd88.jpg",
      "https://media.brand.dev/2f6b2c8d-0b92-4462-a1a9-1895f86960f8.jpg"
    ],
    "sku": "488785-34-003-000",
    "productCategory": "Women / Outerwear / Jackets & Parkas / Jackets",
    "features": [
      "Crisp cotton-blend material",
      "Pre-washed for vintage look",
      "Corduroy accents at collar and cuffs",
      "Chest and side pockets",
      "Horizontal seam detail at back",
      "Oversized fit"
    ],
    "tags": [
      "zip-up",
      "short jacket",
      "pattern",
      "cotton-blend",
      "corduroy",
      "oversized",
      "outerwear",
      "jackets"
    ],
    "spec": {
      "category": "layer",
      "subcategory": "jacket",
      "primaryColor": "neutral",
      "secondaryColors": [],
      "material": "cotton",
      "pattern": "checked",
      "styleTags": [
        "relaxed",
        "streetwear",
        "minimal",
        "comfort"
      ],
      "formalityScore": 3.8,
      "seasonTags": [
        "spring",
        "autumn"
      ],
      "weatherTags": [
        "mild",
        "cool"
      ],
      "occasionTags": [
        "casual",
        "night-out",
        "airport",
        "brunch"
      ]
    },
    "provenance": "cached-context.dev"
  }
];

/** Look up the cached product chosen to represent a wardrobe gap. */
export function cachedProductForArchetype(archetypeId: string): CachedProduct | undefined {
  return CACHED_PRODUCTS.find((p) => p.archetypeId === archetypeId);
}
