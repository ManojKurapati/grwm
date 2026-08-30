/**
 * Garment illustrations.
 *
 * A deliberate design decision: the pieces you *own* are rendered as a single,
 * consistent illustrated system, while products from the internet are shown as
 * real photography (extracted by Context.dev). That contrast is doing work —
 * it makes "your wardrobe" instantly distinguishable from "the shops", and it
 * means the wardrobe renders identically offline, every time, on stage.
 *
 * Each silhouette is drawn once on a 200x240 grid and tinted from the garment's
 * actual colour, so a cream linen shirt and a black shirt are the same shape in
 * different fabric — exactly how a real wardrobe reads.
 */

const SWATCHES: Record<string, string> = {
  black: "#1b1a18",
  charcoal: "#3a3d40",
  grey: "#95968f",
  "light grey": "#c8c7c0",
  white: "#fbfaf6",
  "off-white": "#f3f0e8",
  cream: "#eae0cd",
  ecru: "#e3d9c4",
  beige: "#d8c8ac",
  sand: "#d4c2a0",
  taupe: "#b6a58f",
  camel: "#bb8f5c",
  tan: "#c59c6d",
  brown: "#6d4c33",
  chocolate: "#4b3425",
  navy: "#232f43",
  denim: "#4d6a88",
  "light blue": "#abc3d8",
  blue: "#3c6194",
  olive: "#6c6c46",
  green: "#405f48",
  teal: "#30706c",
  burgundy: "#5e2432",
  rust: "#9e5432",
  red: "#a22e2e",
  orange: "#ca6c2d",
  yellow: "#d9b64c",
  pink: "#db9ca8",
  purple: "#614574",
  silver: "#c2c5c8",
  gold: "#c4a44f",
  neutral: "#b0a898",
};

function swatch(color: string): string {
  return SWATCHES[color.trim().toLowerCase()] ?? SWATCHES.neutral;
}

/** Perceptual lightness, used to decide whether details should be light or dark. */
function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clampByte(((n >> 16) & 255) * (1 - amount));
  const g = clampByte(((n >> 8) & 255) * (1 - amount));
  const b = clampByte((n & 255) * (1 - amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

type ShapeProps = {
  fill: string;
  /** line colour for seams, plackets, stitching */
  line: string;
  /** subtle shadow tone for folds */
  fold: string;
  pattern?: string;
};

// ---------------------------------------------------------------------------
// Silhouettes
// ---------------------------------------------------------------------------

function Shirt({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      {/* sleeves */}
      <path d="M62 46 L28 62 L20 150 L47 158 L58 82 Z" fill={shade(fill, 0.06)} />
      <path d="M138 46 L172 62 L180 150 L153 158 L142 82 Z" fill={shade(fill, 0.06)} />
      {/* body */}
      <path d="M62 46 L100 62 L138 46 L146 200 Q100 210 54 200 Z" fill={fill} />
      {/* collar */}
      <path d="M78 38 L100 62 L84 44 Z" fill={shade(fill, 0.18)} />
      <path d="M122 38 L100 62 L116 44 Z" fill={shade(fill, 0.18)} />
      <path d="M78 38 Q100 30 122 38 L116 44 Q100 38 84 44 Z" fill={shade(fill, 0.26)} />
      {/* placket + buttons */}
      <path d="M100 62 L102 200" stroke={line} strokeWidth="1.2" fill="none" opacity="0.5" />
      {[86, 112, 138, 164, 188].map((y) => (
        <circle key={y} cx="101" cy={y} r="1.9" fill={line} opacity="0.55" />
      ))}
      {/* fold */}
      <path d="M60 196 Q80 186 92 200" stroke={fold} strokeWidth="1" fill="none" opacity="0.5" />
    </g>
  );
}

function TShirt({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M64 52 L26 72 L38 118 L62 108 Z" fill={shade(fill, 0.06)} />
      <path d="M136 52 L174 72 L162 118 L138 108 Z" fill={shade(fill, 0.06)} />
      <path d="M64 52 Q100 74 136 52 L144 196 Q100 205 56 196 Z" fill={fill} />
      {/* crew neck */}
      <path
        d="M78 46 Q100 66 122 46 Q100 56 78 46 Z"
        fill={shade(fill, 0.24)}
      />
      <path d="M78 46 Q100 68 122 46" stroke={line} strokeWidth="2.4" fill="none" opacity="0.5" />
      <path d="M62 190 Q84 180 100 192" stroke={fold} strokeWidth="1" fill="none" opacity="0.45" />
    </g>
  );
}

function Polo({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M64 52 L26 72 L38 118 L62 108 Z" fill={shade(fill, 0.06)} />
      <path d="M136 52 L174 72 L162 118 L138 108 Z" fill={shade(fill, 0.06)} />
      <path d="M64 52 Q100 74 136 52 L144 196 Q100 205 56 196 Z" fill={fill} />
      <path d="M82 44 L100 74 L92 46 Z" fill={shade(fill, 0.2)} />
      <path d="M118 44 L100 74 L108 46 Z" fill={shade(fill, 0.2)} />
      <path d="M100 74 L101 108" stroke={line} strokeWidth="1.2" opacity="0.5" fill="none" />
      <circle cx="100" cy="84" r="1.8" fill={line} opacity="0.55" />
      <circle cx="100" cy="98" r="1.8" fill={line} opacity="0.55" />
      <path d="M62 190 Q84 180 100 192" stroke={fold} strokeWidth="1" fill="none" opacity="0.45" />
    </g>
  );
}

function Knit({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M60 48 L24 66 L18 152 L46 160 L56 86 Z" fill={shade(fill, 0.07)} />
      <path d="M140 48 L176 66 L182 152 L154 160 L144 86 Z" fill={shade(fill, 0.07)} />
      <path d="M60 48 Q100 68 140 48 L148 198 Q100 208 52 198 Z" fill={fill} />
      {/* rolled neck */}
      <path d="M76 40 Q100 60 124 40 Q100 52 76 40 Z" fill={shade(fill, 0.22)} />
      <path d="M76 40 Q100 62 124 40" stroke={line} strokeWidth="3" fill="none" opacity="0.45" />
      {/* rib texture */}
      {[70, 84, 98, 112, 126].map((x) => (
        <path
          key={x}
          d={`M${x} 76 L${x} 194`}
          stroke={fold}
          strokeWidth="0.9"
          opacity="0.3"
          fill="none"
        />
      ))}
      {/* hem rib */}
      <path d="M52 186 Q100 196 148 186" stroke={fold} strokeWidth="1.4" fill="none" opacity="0.4" />
    </g>
  );
}

function Overshirt({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M58 46 L22 62 L16 152 L44 160 L54 84 Z" fill={shade(fill, 0.07)} />
      <path d="M142 46 L178 62 L184 152 L156 160 L146 84 Z" fill={shade(fill, 0.07)} />
      {/* open boxy body, two panels */}
      <path d="M58 46 L98 60 L96 202 Q72 202 52 198 Z" fill={fill} />
      <path d="M142 46 L102 60 L104 202 Q128 202 148 198 Z" fill={shade(fill, 0.04)} />
      {/* collar */}
      <path d="M74 38 Q100 30 126 38 L118 50 Q100 42 82 50 Z" fill={shade(fill, 0.24)} />
      {/* centre opening */}
      <path d="M100 60 L100 202" stroke={line} strokeWidth="1.4" opacity="0.45" fill="none" />
      {/* patch pockets */}
      <rect x="62" y="118" width="26" height="30" rx="2" fill="none" stroke={fold} strokeWidth="1.2" opacity="0.5" />
      <rect x="112" y="118" width="26" height="30" rx="2" fill="none" stroke={fold} strokeWidth="1.2" opacity="0.5" />
    </g>
  );
}

function Blazer({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M58 46 L22 64 L18 156 L46 162 L56 86 Z" fill={shade(fill, 0.08)} />
      <path d="M142 46 L178 64 L182 156 L154 162 L144 86 Z" fill={shade(fill, 0.08)} />
      <path d="M58 46 L96 58 L92 204 Q68 202 50 196 Z" fill={fill} />
      <path d="M142 46 L104 58 L108 204 Q132 202 150 196 Z" fill={shade(fill, 0.05)} />
      {/* lapels */}
      <path d="M78 40 L96 58 L92 112 L70 62 Z" fill={shade(fill, 0.2)} />
      <path d="M122 40 L104 58 L108 112 L130 62 Z" fill={shade(fill, 0.2)} />
      <path d="M100 112 L100 204" stroke={line} strokeWidth="1.2" opacity="0.4" fill="none" />
      <circle cx="100" cy="132" r="2.4" fill={line} opacity="0.6" />
      <path d="M66 150 L86 154" stroke={fold} strokeWidth="1.2" opacity="0.5" fill="none" />
      <path d="M134 150 L114 154" stroke={fold} strokeWidth="1.2" opacity="0.5" fill="none" />
    </g>
  );
}

function Trousers({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      {/* waistband */}
      <path d="M58 34 L142 34 L142 52 L58 52 Z" fill={shade(fill, 0.16)} />
      {/* legs */}
      <path d="M58 52 L96 52 L92 214 L62 214 Z" fill={fill} />
      <path d="M104 52 L142 52 L138 214 L108 214 Z" fill={shade(fill, 0.05)} />
      {/* rise */}
      <path d="M96 52 L100 96 L104 52 Z" fill={shade(fill, 0.2)} />
      <path d="M100 96 L100 52" stroke={line} strokeWidth="1" opacity="0.4" fill="none" />
      {/* creases */}
      <path d="M77 60 L75 210" stroke={fold} strokeWidth="1" opacity="0.32" fill="none" />
      <path d="M123 60 L125 210" stroke={fold} strokeWidth="1" opacity="0.32" fill="none" />
      {/* belt loops */}
      <path d="M70 34 L70 52" stroke={line} strokeWidth="1.4" opacity="0.35" fill="none" />
      <path d="M130 34 L130 52" stroke={line} strokeWidth="1.4" opacity="0.35" fill="none" />
    </g>
  );
}

function Jeans({ fill, line, fold }: ShapeProps) {
  const stitch = "#d8bd82";
  return (
    <g>
      <path d="M58 34 L142 34 L142 54 L58 54 Z" fill={shade(fill, 0.18)} />
      <path d="M58 54 L96 54 L91 214 L61 214 Z" fill={fill} />
      <path d="M104 54 L142 54 L139 214 L109 214 Z" fill={shade(fill, 0.06)} />
      <path d="M96 54 L100 100 L104 54 Z" fill={shade(fill, 0.22)} />
      {/* topstitching */}
      <path d="M58 54 L142 54" stroke={stitch} strokeWidth="1" opacity="0.5" fill="none" />
      <path d="M100 54 L100 100" stroke={stitch} strokeWidth="1" opacity="0.45" fill="none" />
      {/* pockets */}
      <path d="M64 56 Q78 74 90 58" stroke={stitch} strokeWidth="1" opacity="0.45" fill="none" />
      <path d="M136 56 Q122 74 110 58" stroke={stitch} strokeWidth="1" opacity="0.45" fill="none" />
      {/* fades */}
      <path d="M74 90 Q78 140 74 200" stroke={tint(fill, 0.28)} strokeWidth="5" opacity="0.35" fill="none" />
      <path d="M126 90 Q122 140 126 200" stroke={tint(fill, 0.28)} strokeWidth="5" opacity="0.35" fill="none" />
      <path d="M100 100 L100 214" stroke={line} strokeWidth="0.8" opacity="0.25" fill="none" />
    </g>
  );
}

function Shorts({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M58 48 L142 48 L142 66 L58 66 Z" fill={shade(fill, 0.16)} />
      <path d="M58 66 L96 66 L92 164 L60 164 Z" fill={fill} />
      <path d="M104 66 L142 66 L140 164 L108 164 Z" fill={shade(fill, 0.05)} />
      <path d="M96 66 L100 108 L104 66 Z" fill={shade(fill, 0.2)} />
      <path d="M78 74 L76 160" stroke={fold} strokeWidth="1" opacity="0.3" fill="none" />
      <path d="M122 74 L124 160" stroke={fold} strokeWidth="1" opacity="0.3" fill="none" />
    </g>
  );
}

function Sneaker({ fill, line, fold }: ShapeProps) {
  const sole = "#f2efe6";
  return (
    <g>
      {/* upper */}
      <path
        d="M34 150 Q36 112 62 104 Q86 98 104 112 Q124 128 158 134 Q172 137 172 150 L34 150 Z"
        fill={fill}
      />
      {/* toe cap */}
      <path d="M158 134 Q172 137 172 150 L148 150 Q148 138 158 134 Z" fill={shade(fill, 0.1)} />
      {/* heel tab */}
      <path d="M34 150 Q36 118 56 106 L64 118 Q46 128 46 150 Z" fill={shade(fill, 0.12)} />
      {/* laces */}
      {[
        "M78 110 L94 122",
        "M88 106 L104 120",
        "M98 106 L116 122",
        "M110 110 L128 126",
      ].map((d) => (
        <path key={d} d={d} stroke={line} strokeWidth="2" opacity="0.45" fill="none" strokeLinecap="round" />
      ))}
      {/* sole */}
      <path d="M30 150 L176 150 Q178 166 168 168 L38 168 Q28 166 30 150 Z" fill={sole} />
      <path d="M30 158 L176 158" stroke="#cfc9bb" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function Runner({ fill, line, fold }: ShapeProps) {
  const sole = "#eae5da";
  return (
    <g>
      <path
        d="M32 148 Q34 114 60 104 Q88 96 108 114 Q128 132 160 138 Q174 141 174 148 L32 148 Z"
        fill={fill}
      />
      {/* knit texture */}
      {[
        "M52 116 L58 142",
        "M64 110 L70 142",
        "M78 108 L84 142",
        "M92 112 L98 142",
        "M108 120 L112 142",
        "M124 128 L128 142",
        "M140 134 L143 142",
      ].map((d) => (
        <path key={d} d={d} stroke={fold} strokeWidth="1.1" opacity="0.35" fill="none" />
      ))}
      <path d="M32 148 Q34 118 56 106 L62 116 Q44 126 44 148 Z" fill={shade(fill, 0.1)} />
      {/* chunky foam sole */}
      <path d="M26 148 L178 148 Q182 172 168 174 L36 174 Q22 172 26 148 Z" fill={sole} />
      <path d="M26 160 Q100 166 178 158" stroke="#cec8ba" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function Loafer({ fill, line, fold }: ShapeProps) {
  const light = isLight(fill);
  const sole = light ? "#b9ae9b" : "#2a241d";
  return (
    <g>
      {/* body */}
      <path
        d="M32 152 Q34 126 58 118 Q84 110 106 120 Q132 132 162 138 Q176 141 176 152 L32 152 Z"
        fill={fill}
      />
      {/* vamp / apron seam */}
      <path
        d="M66 122 Q92 138 122 142"
        stroke={shade(fill, 0.28)}
        strokeWidth="1.6"
        fill="none"
        opacity="0.8"
      />
      {/* penny strap */}
      <path d="M74 126 Q92 136 108 140 L106 148 Q88 144 72 134 Z" fill={shade(fill, 0.18)} />
      <path d="M86 133 L96 137" stroke={light ? "#8f8474" : "#0f0d0a"} strokeWidth="2.4" opacity="0.65" fill="none" strokeLinecap="round" />
      {/* heel */}
      <path d="M32 152 Q34 130 54 120 L60 130 Q44 138 44 152 Z" fill={shade(fill, 0.14)} />
      {/* sole */}
      <path d="M28 152 L180 152 Q182 164 172 166 L36 166 Q26 164 28 152 Z" fill={sole} />
      <path d="M160 152 L176 152 L174 166 L158 166 Z" fill={shade(sole, 0.2)} />
    </g>
  );
}

function DressShoe({ fill, line, fold }: ShapeProps) {
  const sole = isLight(fill) ? "#b0a593" : "#241f19";
  return (
    <g>
      <path
        d="M32 152 Q34 124 60 116 Q86 108 108 120 Q134 134 164 140 Q178 142 178 152 L32 152 Z"
        fill={fill}
      />
      <path d="M96 118 Q120 134 146 140" stroke={shade(fill, 0.3)} strokeWidth="1.6" fill="none" />
      {[
        "M74 120 L86 128",
        "M84 116 L96 126",
        "M94 116 L106 126",
      ].map((d) => (
        <path key={d} d={d} stroke={isLight(fill) ? "#7d7364" : "#e6e0d4"} strokeWidth="1.6" opacity="0.5" fill="none" strokeLinecap="round" />
      ))}
      <path d="M32 152 Q34 128 54 118 L60 128 Q44 136 44 152 Z" fill={shade(fill, 0.14)} />
      <path d="M28 152 L182 152 Q184 163 174 165 L36 165 Q26 163 28 152 Z" fill={sole} />
    </g>
  );
}

function Boot({ fill, line, fold }: ShapeProps) {
  const sole = isLight(fill) ? "#ada393" : "#221d17";
  return (
    <g>
      <path d="M52 66 Q86 60 96 70 L104 142 L48 142 Z" fill={fill} />
      <path
        d="M48 142 Q60 132 96 136 Q130 140 160 144 Q174 146 174 156 L44 156 Z"
        fill={shade(fill, 0.05)}
      />
      {/* elastic gusset */}
      <path d="M96 74 L104 138 L114 138 L106 76 Z" fill={shade(fill, 0.3)} />
      <path d="M52 66 Q86 60 96 70" stroke={shade(fill, 0.24)} strokeWidth="2" fill="none" />
      <path d="M40 156 L178 156 Q180 168 170 170 L48 170 Q38 168 40 156 Z" fill={sole} />
    </g>
  );
}

function Sandal({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M34 146 Q100 138 172 144 Q178 158 168 162 L44 164 Q30 160 34 146 Z" fill={shade(fill, 0.1)} />
      <path d="M56 146 Q90 118 128 142" stroke={fill} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M98 132 Q118 128 140 142" stroke={fill} strokeWidth="9" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Watch({ fill, line }: ShapeProps) {
  const metal = fill;
  const face = isLight(fill) ? "#f7f5ef" : "#1c1a17";
  return (
    <g>
      {/* bracelet */}
      {[36, 52, 68, 156, 172, 188].map((y) => (
        <rect key={y} x="86" y={y} width="28" height="13" rx="3.5" fill={shade(metal, 0.12)} />
      ))}
      <rect x="88" y="80" width="24" height="80" fill={shade(metal, 0.06)} />
      {/* case */}
      <circle cx="100" cy="120" r="42" fill={shade(metal, 0.05)} />
      <circle cx="100" cy="120" r="35" fill={face} />
      <circle cx="100" cy="120" r="35" fill="none" stroke={shade(metal, 0.2)} strokeWidth="1.5" />
      {/* markers */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={100 + Math.cos(rad) * 27}
            y1={120 + Math.sin(rad) * 27}
            x2={100 + Math.cos(rad) * 31}
            y2={120 + Math.sin(rad) * 31}
            stroke={isLight(fill) ? "#3a352d" : "#e8e2d6"}
            strokeWidth="2"
          />
        );
      })}
      {/* hands */}
      <line x1="100" y1="120" x2="100" y2="100" stroke={isLight(fill) ? "#26221c" : "#f0eade"} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="100" y1="120" x2="116" y2="128" stroke={isLight(fill) ? "#26221c" : "#f0eade"} strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="120" r="2.4" fill={isLight(fill) ? "#26221c" : "#f0eade"} />
      {/* crown */}
      <rect x="140" y="115" width="7" height="10" rx="2" fill={shade(metal, 0.15)} />
    </g>
  );
}

function Chain({ fill }: ShapeProps) {
  const links: Array<{ x: number; y: number; r: number }> = [];
  const steps = 17;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    // a shallow catenary across the frame
    const x = 40 + t * 120;
    const y = 82 + Math.sin(t * Math.PI) * 68;
    links.push({ x, y, r: 6.4 });
  }
  return (
    <g>
      {links.map((l, i) => (
        <circle
          key={i}
          cx={l.x}
          cy={l.y}
          r={l.r}
          fill="none"
          stroke={i % 2 === 0 ? fill : shade(fill, 0.18)}
          strokeWidth="3.4"
        />
      ))}
    </g>
  );
}

function Ring({ fill }: ShapeProps) {
  return (
    <g>
      <circle cx="100" cy="128" r="46" fill="none" stroke={shade(fill, 0.12)} strokeWidth="13" />
      <circle cx="100" cy="128" r="46" fill="none" stroke={tint(fill, 0.3)} strokeWidth="4" opacity="0.6" />
      {/* signet face */}
      <ellipse cx="100" cy="80" rx="26" ry="19" fill={fill} />
      <ellipse cx="100" cy="80" rx="26" ry="19" fill="none" stroke={shade(fill, 0.25)} strokeWidth="1.5" />
      <ellipse cx="100" cy="78" rx="15" ry="10" fill={tint(fill, 0.22)} opacity="0.5" />
    </g>
  );
}

function Belt({ fill, line }: ShapeProps) {
  return (
    <g>
      <path d="M28 96 Q100 76 150 96 Q100 116 28 116 Z" fill={fill} />
      <path d="M28 116 Q100 116 150 96 L150 108 Q100 128 28 128 Z" fill={shade(fill, 0.18)} />
      {/* buckle */}
      <rect x="146" y="84" width="34" height="40" rx="5" fill="none" stroke="#c2c5c8" strokeWidth="6" />
      <line x1="163" y1="84" x2="163" y2="124" stroke="#c2c5c8" strokeWidth="4" />
      {/* holes */}
      {[48, 64, 80].map((x) => (
        <circle key={x} cx={x} cy="106" r="2.6" fill={shade(fill, 0.45)} />
      ))}
    </g>
  );
}

function Sunglasses({ fill }: ShapeProps) {
  const lens = shade(fill, 0.05);
  return (
    <g>
      {/* temples */}
      <path d="M40 106 L18 92" stroke={fill} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M160 106 L182 92" stroke={fill} strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* frames */}
      <path
        d="M38 96 Q40 132 66 136 Q92 140 94 106 Q94 96 88 94 L44 92 Q38 92 38 96 Z"
        fill={lens}
        stroke={fill}
        strokeWidth="6"
      />
      <path
        d="M162 96 Q160 132 134 136 Q108 140 106 106 Q106 96 112 94 L156 92 Q162 92 162 96 Z"
        fill={lens}
        stroke={fill}
        strokeWidth="6"
      />
      {/* bridge */}
      <path d="M94 100 Q100 94 106 100" stroke={fill} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* highlight */}
      <path d="M50 102 L62 122" stroke="#ffffff" strokeWidth="3" opacity="0.28" fill="none" />
      <path d="M118 102 L130 122" stroke="#ffffff" strokeWidth="3" opacity="0.28" fill="none" />
    </g>
  );
}

function Bag({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M52 96 L148 96 L158 196 Q100 206 42 196 Z" fill={fill} />
      <path d="M52 96 L148 96 L146 110 L54 110 Z" fill={shade(fill, 0.14)} />
      <path d="M74 96 Q78 56 100 56 Q122 56 126 96" stroke={shade(fill, 0.2)} strokeWidth="6" fill="none" />
      <path d="M60 176 Q100 186 142 176" stroke={fold} strokeWidth="1.2" opacity="0.4" fill="none" />
    </g>
  );
}

function Cap({ fill, line, fold }: ShapeProps) {
  return (
    <g>
      <path d="M48 132 Q52 74 100 74 Q148 74 152 132 Q100 142 48 132 Z" fill={fill} />
      <path d="M100 74 L100 132" stroke={fold} strokeWidth="1.2" opacity="0.35" fill="none" />
      <path d="M48 132 Q100 142 152 132 Q176 138 172 152 Q100 162 44 150 Q44 136 48 132 Z" fill={shade(fill, 0.14)} />
      <circle cx="100" cy="76" r="4" fill={shade(fill, 0.25)} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const SHAPES: Record<string, (p: ShapeProps) => React.ReactElement> = {
  shirt: Shirt,
  "t-shirt": TShirt,
  polo: Polo,
  knit: Knit,
  hoodie: Knit,
  cardigan: Knit,
  overshirt: Overshirt,
  jacket: Overshirt,
  blazer: Blazer,
  coat: Blazer,
  trousers: Trousers,
  jeans: Jeans,
  joggers: Trousers,
  shorts: Shorts,
  sneakers: Sneaker,
  runners: Runner,
  trainers: Runner,
  loafers: Loafer,
  derby: DressShoe,
  oxford: DressShoe,
  boots: Boot,
  "chelsea boots": Boot,
  sandals: Sandal,
  watch: Watch,
  chain: Chain,
  ring: Ring,
  belt: Belt,
  sunglasses: Sunglasses,
  bag: Bag,
  cap: Cap,
};

/** Fall back by broad category when a subcategory is unknown. */
const CATEGORY_FALLBACK: Record<string, string> = {
  top: "t-shirt",
  bottom: "trousers",
  shoes: "sneakers",
  layer: "overshirt",
  accessory: "watch",
};

export function resolveShape(subcategory: string, category: string): string {
  const key = subcategory.trim().toLowerCase();
  if (SHAPES[key]) return key;
  for (const name of Object.keys(SHAPES)) {
    if (key.includes(name)) return name;
  }
  return CATEGORY_FALLBACK[category.trim().toLowerCase()] ?? "t-shirt";
}

export type GarmentProps = {
  subcategory: string;
  category: string;
  color: string;
  pattern?: string;
  className?: string;
};

export function Garment({ subcategory, category, color, pattern, className }: GarmentProps) {
  const shapeKey = resolveShape(subcategory, category);
  const Shape = SHAPES[shapeKey];
  const fill = swatch(color);
  const light = isLight(fill);
  const line = light ? "#8f8779" : "#efe9dc";
  const fold = light ? "#a29a8b" : "#ffffff";

  // Note: `pattern` is intentionally not rendered. Each silhouette derives its
  // seam and fold tones from `fill` arithmetically, so a pattern paint server
  // there would break the colour maths, and an unclipped overlay would bleed
  // outside the garment. Pattern still drives *scoring* in the engine (two
  // patterns in one outfit is penalised) — it just doesn't drive the drawing.
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={`${color} ${subcategory}`}
    >
      <Shape fill={fill} line={line} fold={fold} pattern={pattern} />
    </svg>
  );
}

export { swatch as garmentSwatch };
