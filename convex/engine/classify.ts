/**
 * Normalize an arbitrary Context.dev product record into a GRWM GarmentSpec.
 *
 * Context.dev gives us clean, structured commerce data (name, description,
 * category, features, tags). It does not know what "formality 7" means or that
 * suede should not be worn in the rain — that is GRWM's domain model. This
 * module is the bridge: a deterministic, auditable classifier over the
 * extracted text, so the same product always yields the same spec.
 */

import { COLORS, clamp, type GarmentSpec, unique } from "./taxonomy";

export type ExtractedProduct = {
  name: string;
  description: string;
  category?: string | null;
  features?: string[];
  tags?: string[];
  targetAudience?: string[];
};

type SubcategoryRule = {
  subcategory: string;
  category: "top" | "bottom" | "shoes" | "layer" | "accessory";
  patterns: RegExp[];
  formality: number;
  styleTags: string[];
  occasionTags: string[];
  weatherTags: string[];
  seasonTags: string[];
};

/** Ordered most-specific first; the first match wins. */
const SUBCATEGORY_RULES: SubcategoryRule[] = [
  // --- shoes -------------------------------------------------------------
  { subcategory: "loafers", category: "shoes", patterns: [/loafer/, /moccasin/, /penny\b/, /driving shoe/], formality: 7, styleTags: ["minimal", "elevated", "smart casual", "tailored"], occasionTags: ["date", "rooftop-date", "dinner", "brunch", "office", "client-dinner", "gallery"], weatherTags: ["mild", "warm", "hot"], seasonTags: ["spring", "summer", "autumn"] },
  { subcategory: "derby", category: "shoes", patterns: [/derby/, /oxford shoe/, /brogue/, /dress shoe/, /monk strap/], formality: 9, styleTags: ["tailored", "formal", "sharp"], occasionTags: ["wedding", "client-dinner", "office", "gallery"], weatherTags: ["mild", "cool", "cold"], seasonTags: ["autumn", "winter", "spring"] },
  { subcategory: "chelsea boots", category: "shoes", patterns: [/chelsea boot/, /chukka/, /\bboot/], formality: 7, styleTags: ["sharp", "minimal", "tailored", "streetwear"], occasionTags: ["night-out", "date", "office", "casual", "gallery"], weatherTags: ["cool", "cold", "mild"], seasonTags: ["autumn", "winter"] },
  { subcategory: "sneakers", category: "shoes", patterns: [/sneaker/, /trainer/, /runner/, /tennis shoe/, /court shoe/, /\bshoe.*(mesh|knit)\b/], formality: 4, styleTags: ["minimal", "relaxed", "streetwear", "smart casual"], occasionTags: ["casual", "brunch", "airport", "night-out", "date"], weatherTags: ["mild", "warm", "cool", "hot"], seasonTags: ["all-season"] },
  { subcategory: "sandals", category: "shoes", patterns: [/sandal/, /slide/, /flip[- ]?flop/, /espadrille/], formality: 3, styleTags: ["relaxed", "mediterranean", "comfort"], occasionTags: ["casual", "brunch"], weatherTags: ["hot", "warm"], seasonTags: ["summer"] },

  // --- layers ------------------------------------------------------------
  { subcategory: "blazer", category: "layer", patterns: [/blazer/, /sport coat/, /suit jacket/], formality: 8, styleTags: ["tailored", "elevated", "business casual", "sharp"], occasionTags: ["client-dinner", "office", "dinner", "gallery", "wedding", "date"], weatherTags: ["mild", "cool", "warm"], seasonTags: ["spring", "autumn", "winter"] },
  { subcategory: "coat", category: "layer", patterns: [/overcoat/, /trench/, /\bcoat\b/, /parka/, /puffer/], formality: 7, styleTags: ["tailored", "minimal", "elevated"], occasionTags: ["office", "dinner", "casual", "gallery"], weatherTags: ["cold", "cool"], seasonTags: ["winter", "autumn"] },
  { subcategory: "overshirt", category: "layer", patterns: [/overshirt/, /chore (jacket|coat)/, /shacket/, /work jacket/], formality: 5, styleTags: ["relaxed", "minimal", "smart casual", "streetwear"], occasionTags: ["casual", "brunch", "airport", "date", "office"], weatherTags: ["mild", "cool", "warm"], seasonTags: ["spring", "autumn"] },
  { subcategory: "cardigan", category: "layer", patterns: [/cardigan/, /zip[- ]?through knit/], formality: 5.5, styleTags: ["relaxed", "minimal", "comfort"], occasionTags: ["casual", "brunch", "office", "airport"], weatherTags: ["cool", "mild"], seasonTags: ["autumn", "winter", "spring"] },
  { subcategory: "jacket", category: "layer", patterns: [/bomber/, /denim jacket/, /\bjacket\b/, /gilet/, /vest\b/], formality: 5, styleTags: ["relaxed", "streetwear", "minimal"], occasionTags: ["casual", "night-out", "airport", "brunch"], weatherTags: ["mild", "cool"], seasonTags: ["spring", "autumn"] },

  // --- tops --------------------------------------------------------------
  { subcategory: "polo", category: "top", patterns: [/polo/], formality: 6, styleTags: ["minimal", "elevated", "smart casual"], occasionTags: ["date", "rooftop-date", "dinner", "brunch", "office", "gallery"], weatherTags: ["warm", "mild", "hot"], seasonTags: ["spring", "summer"] },
  { subcategory: "knit", category: "top", patterns: [/sweater/, /jumper/, /knitwear/, /\bknit\b/, /turtleneck/, /roll neck/], formality: 6, styleTags: ["minimal", "elevated", "comfort"], occasionTags: ["dinner", "date", "office", "casual", "gallery"], weatherTags: ["cool", "mild", "cold"], seasonTags: ["autumn", "winter"] },
  { subcategory: "shirt", category: "top", patterns: [/shirt/, /button[- ]?(down|up)/, /oxford/], formality: 6, styleTags: ["minimal", "smart casual", "tailored"], occasionTags: ["date", "rooftop-date", "dinner", "brunch", "office", "client-dinner", "gallery"], weatherTags: ["warm", "mild", "hot"], seasonTags: ["all-season"] },
  { subcategory: "t-shirt", category: "top", patterns: [/t[- ]?shirt/, /\btee\b/, /tank top/], formality: 3, styleTags: ["relaxed", "minimal", "streetwear"], occasionTags: ["casual", "brunch", "airport", "night-out"], weatherTags: ["hot", "warm", "mild"], seasonTags: ["summer", "spring"] },
  { subcategory: "hoodie", category: "top", patterns: [/hoodie/, /sweatshirt/, /crewneck/], formality: 2.5, styleTags: ["relaxed", "streetwear", "comfort"], occasionTags: ["casual", "airport"], weatherTags: ["cool", "mild"], seasonTags: ["autumn", "winter"] },

  // --- bottoms -----------------------------------------------------------
  { subcategory: "jeans", category: "bottom", patterns: [/\bjean/, /\bdenim (pant|trouser)/], formality: 4, styleTags: ["relaxed", "minimal", "streetwear"], occasionTags: ["casual", "brunch", "night-out", "date", "airport"], weatherTags: ["mild", "cool", "warm"], seasonTags: ["all-season"] },
  { subcategory: "shorts", category: "bottom", patterns: [/\bshorts\b/], formality: 2.5, styleTags: ["relaxed", "mediterranean", "comfort"], occasionTags: ["casual", "brunch"], weatherTags: ["hot", "warm"], seasonTags: ["summer"] },
  { subcategory: "trousers", category: "bottom", patterns: [/trouser/, /\bchino/, /\bpants\b/, /slacks/, /\bpant\b/], formality: 6.5, styleTags: ["tailored", "minimal", "smart casual", "elevated"], occasionTags: ["date", "rooftop-date", "dinner", "office", "client-dinner", "gallery", "brunch"], weatherTags: ["warm", "mild", "hot"], seasonTags: ["all-season"] },
  { subcategory: "joggers", category: "bottom", patterns: [/jogger/, /sweatpant/, /track pant/], formality: 2, styleTags: ["relaxed", "comfort", "athleisure"], occasionTags: ["casual", "airport"], weatherTags: ["mild", "cool"], seasonTags: ["all-season"] },

  // --- accessories -------------------------------------------------------
  { subcategory: "watch", category: "accessory", patterns: [/watch\b/, /timepiece/, /chronograph/], formality: 6.5, styleTags: ["minimal", "elevated", "tailored"], occasionTags: ["date", "rooftop-date", "dinner", "office", "client-dinner", "gallery", "wedding", "casual"], weatherTags: ["hot", "warm", "mild", "cool", "cold"], seasonTags: ["all-season"] },
  { subcategory: "chain", category: "accessory", patterns: [/chain/, /necklace/, /pendant/], formality: 5.5, styleTags: ["statement", "minimal", "streetwear"], occasionTags: ["date", "night-out", "casual", "rooftop-date", "gallery"], weatherTags: ["hot", "warm", "mild", "cool", "cold"], seasonTags: ["all-season"] },
  { subcategory: "ring", category: "accessory", patterns: [/\bring\b/, /signet/], formality: 6, styleTags: ["statement", "elevated", "minimal"], occasionTags: ["date", "rooftop-date", "night-out", "dinner", "gallery"], weatherTags: ["hot", "warm", "mild", "cool", "cold"], seasonTags: ["all-season"] },
  { subcategory: "belt", category: "accessory", patterns: [/\bbelt\b/], formality: 7, styleTags: ["minimal", "tailored", "business casual"], occasionTags: ["office", "client-dinner", "dinner", "date", "wedding"], weatherTags: ["hot", "warm", "mild", "cool", "cold"], seasonTags: ["all-season"] },
  { subcategory: "sunglasses", category: "accessory", patterns: [/sunglass/, /eyewear/, /shades\b/], formality: 5, styleTags: ["statement", "minimal", "mediterranean"], occasionTags: ["casual", "brunch", "airport", "rooftop-date"], weatherTags: ["hot", "warm", "mild"], seasonTags: ["summer", "spring"] },
  { subcategory: "bag", category: "accessory", patterns: [/\bbag\b/, /tote/, /backpack/, /holdall/], formality: 5, styleTags: ["minimal", "relaxed"], occasionTags: ["casual", "airport", "office", "brunch"], weatherTags: ["hot", "warm", "mild", "cool", "cold"], seasonTags: ["all-season"] },
  { subcategory: "cap", category: "accessory", patterns: [/\bcap\b/, /\bhat\b/, /beanie/], formality: 3, styleTags: ["relaxed", "streetwear"], occasionTags: ["casual", "airport"], weatherTags: ["warm", "mild", "cool"], seasonTags: ["all-season"] },
];

const MATERIALS = [
  "linen blend", "linen", "merino wool", "cashmere", "wool", "tweed", "cotton twill",
  "organic cotton", "cotton", "poplin", "oxford", "chambray", "silk", "viscose",
  "tencel", "lyocell", "jersey", "denim", "canvas", "suede", "nubuck", "leather",
  "nylon", "polyester", "fleece", "down", "recycled polyester", "stainless steel",
  "sterling silver", "gold", "metal",
];

const PATTERNS: Array<[string, RegExp]> = [
  ["striped", /strip(e|ed|y)/],
  ["checked", /check|gingham|plaid|tartan/],
  ["printed", /print(ed)?|graphic|floral|paisley/],
  ["herringbone", /herringbone|houndstooth/],
  ["textured", /textur|ribbed|cable|waffle|boucl/],
];

/** Colour words mapped onto our palette vocabulary. */
const COLOR_ALIASES: Record<string, string> = {
  ivory: "cream", oatmeal: "cream", stone: "beige", khaki: "beige", chino: "beige",
  sandstone: "sand", greige: "taupe", mushroom: "taupe", "light beige": "beige",
  "natural grey": "grey", "light grey": "light grey", "dark grey": "charcoal",
  graphite: "charcoal", slate: "charcoal", ink: "navy", midnight: "navy",
  "off white": "off-white", offwhite: "off-white", "optic white": "white",
  ecru: "ecru", bone: "cream", chocolate: "chocolate", espresso: "chocolate",
  cognac: "tan", caramel: "camel", coffee: "brown", walnut: "brown",
  indigo: "denim", "mid blue": "denim", "light wash": "light blue",
  bordeaux: "burgundy", maroon: "burgundy", wine: "burgundy",
  terracotta: "rust", "burnt orange": "rust", forest: "green", sage: "olive",
  "silver-tone": "silver", "gold-tone": "gold", steel: "silver",
};

const COLOR_VOCAB = unique([...Object.keys(COLORS), ...Object.keys(COLOR_ALIASES)]).sort(
  (a, b) => b.length - a.length,
);

function haystack(product: ExtractedProduct): string {
  return [
    product.name,
    product.category ?? "",
    (product.tags ?? []).join(" "),
    (product.features ?? []).join(" "),
    product.description,
  ]
    .join(" \n ")
    .toLowerCase();
}

function findColors(text: string, name: string): { primary: string; secondary: string[] } {
  const found: string[] = [];
  // The product *name* is the strongest colour signal ("Natural Grey").
  for (const source of [name.toLowerCase(), text]) {
    for (const word of COLOR_VOCAB) {
      if (new RegExp(`\\b${word.replace(/[-]/g, "[- ]?")}\\b`).test(source)) {
        found.push(COLOR_ALIASES[word] ?? word);
      }
    }
    if (found.length > 0 && source === name.toLowerCase()) break;
  }
  const ordered = unique(found);
  return {
    primary: ordered[0] ?? "neutral",
    secondary: ordered.slice(1, 3),
  };
}

function findMaterial(text: string): string | undefined {
  for (const material of MATERIALS) {
    if (text.includes(material)) return material;
  }
  return undefined;
}

function findPattern(text: string): string {
  for (const [name, pattern] of PATTERNS) {
    if (pattern.test(text)) return name;
  }
  return "solid";
}

function matchRule(text: string, name: string): SubcategoryRule {
  // Match on the name first — it is the least noisy field.
  for (const source of [name.toLowerCase(), text]) {
    for (const rule of SUBCATEGORY_RULES) {
      if (rule.patterns.some((p) => p.test(source))) return rule;
    }
  }
  // Unknown garment: treat it as a mid-formality top rather than failing.
  return SUBCATEGORY_RULES.find((r) => r.subcategory === "t-shirt")!;
}

/** Signals in the copy that shift formality up or down from the rule default. */
const FORMALITY_MODIFIERS: Array<[RegExp, number]> = [
  [/tailor|formal|dress\b|smart|refined|elegant|luxur/, 0.8],
  [/relaxed|casual|easy|everyday|lounge|sport|athletic|technical/, -0.8],
  [/oversized|baggy|boxy|drop shoulder/, -0.4],
  [/slim|fitted|structured/, 0.3],
  [/unstructured|unlined/, -0.2],
];

const STYLE_SIGNALS: Array<[RegExp, string[]]> = [
  [/minimal|clean|understated|essential/, ["minimal"]],
  [/relaxed|easy|comfort|soft/, ["relaxed", "comfort"]],
  [/tailor|structured|sharp|refined/, ["tailored", "sharp"]],
  [/luxur|premium|elevated|refined/, ["elevated"]],
  [/street|skate|utility/, ["streetwear"]],
  [/resort|holiday|vacation|beach|riviera/, ["mediterranean"]],
  [/statement|bold|striking/, ["statement"]],
  [/technical|performance|active|training/, ["athleisure"]],
];

export function classifyProduct(product: ExtractedProduct): GarmentSpec {
  const text = haystack(product);
  const rule = matchRule(text, product.name);
  const { primary, secondary } = findColors(text, product.name);
  const material = findMaterial(text);
  const pattern = findPattern(text);

  let formality = rule.formality;
  for (const [regex, shift] of FORMALITY_MODIFIERS) {
    if (regex.test(text)) formality += shift;
  }
  if (material === "linen" || material === "linen blend") formality -= 0.3;
  if (material === "leather" && rule.category === "shoes") formality += 0.4;
  if (material === "suede" && rule.category === "shoes") formality -= 0.2;
  formality = clamp(Math.round(formality * 10) / 10, 1, 10);

  const styleTags = [...rule.styleTags];
  for (const [regex, tags] of STYLE_SIGNALS) {
    if (regex.test(text)) styleTags.push(...tags);
  }

  // Fabric weight adjusts which weather this really belongs in.
  const weatherTags = [...rule.weatherTags];
  if (material && /linen|chambray|poplin/.test(material)) weatherTags.push("hot", "warm");
  if (material && /wool|cashmere|tweed|fleece|down/.test(material)) {
    weatherTags.push("cool", "cold");
  }

  return {
    category: rule.category,
    subcategory: rule.subcategory,
    primaryColor: primary,
    secondaryColors: secondary,
    material,
    pattern,
    styleTags: unique(styleTags),
    formalityScore: formality,
    seasonTags: unique(rule.seasonTags),
    weatherTags: unique(weatherTags),
    occasionTags: unique(rule.occasionTags),
  };
}

/** Short, human description of what GRWM decided this product is. */
export function describeSpec(spec: GarmentSpec): string {
  const bits = [
    spec.primaryColor !== "neutral" ? spec.primaryColor : null,
    spec.material,
    spec.subcategory,
  ].filter(Boolean);
  return `${bits.join(" ")} · formality ${spec.formalityScore}/10 · ${spec.styleTags.slice(0, 3).join(", ")}`;
}

export function retailerFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const name = host.split(".")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Unknown";
  }
}
