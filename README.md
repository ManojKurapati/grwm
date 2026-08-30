# GRWM AI

**Shop your wardrobe before shopping the internet.**

GRWM turns the clothes you already own into an intelligent personal styling
system. Ask it where you are going, and it builds the outfit from your actual
wardrobe — then, only if there is a genuine gap, it goes and finds the one thing
worth buying.

---

## Problem

People often own enough clothes but still struggle to decide what to wear for a
specific occasion. The default response from most fashion technology is to sell
you something else. That leaves you with a fuller wardrobe and the same problem.

## Solution

GRWM reasons about the wardrobe you have.

1. It understands every garment you own as structured attributes: colour,
   material, formality, the weather it suits, the occasions it fits.
2. Gemini interprets the occasion, the live weather and your style context.
3. GRWM builds an outfit from clothes you already own, and explains why.
4. Only if a real gap exists does the **Missing Piece Engine** look outward.
5. Context.dev extracts real product data from real retailers.
6. Gemini decides which product creates the most value for *your* wardrobe.

## How it works

```
prompt ──> intent + weather ──> Gemini stylist ──> validation ──> outfit
                                     │                              │
                            (deterministic engine)                  ▼
                             fallback if Gemini fails       Missing Piece Engine
                                                                    │
                                                     Context.dev product discovery
                                                                    │
                                                    Gemini evaluates vs wardrobe
                                                                    │
                                              Wardrobe Compatibility + outfits unlocked
```

The important detail: **the recommendation is never invented.** Gemini selects
from real wardrobe item IDs, and every selection is validated against the
database before it reaches the interface. If Gemini returns an ID that does not
exist, malformed JSON, or nothing at all, the deterministic engine produces the
recommendation instead and the experience continues.

## Key differentiator — the Missing Piece Engine

GRWM does not immediately recommend more products.

It first maximises the clothes you already own. Only then does it recommend the
smallest addition that meaningfully expands the wardrobe, scored on:

- **Wardrobe Compatibility** — how well it works with what you own
- **Outfits unlocked** — how much new range it actually creates
- **Redundancy** — whether you already own something doing the same job

Redundancy divides the score, which is why GRWM will tell you to skip things.
That is the whole point: `Should I buy this?` frequently answers **SKIP IT**.

---

## Technology

### Devin by Cognition
Used as the AI engineering agent to build, integrate, test and debug the
application, including browser-driven verification of the demo flow.

### Convex
Backend and persistent wardrobe memory: wardrobe items, garment images, profile,
recommendations, recommendation history, feedback, and cached product
extractions. All server functions, scheduling and file storage live here.

### Gemini
The multimodal styling and reasoning engine: garment understanding from photos,
outfit selection, contextual styling, missing-piece reasoning and external
product evaluation. Gemini is deliberately *not* used for deterministic facts
such as price comparison or checking whether an ID exists.

### Context.dev
Live product intelligence. Extracts real product data (name, retailer, price,
image, URL, attributes) from real retailer pages. All calls are server-side; the
API key is never exposed to the browser.

---

## Architecture

| Layer | Responsibility |
| --- | --- |
| `src/app` | Next.js App Router pages: ask, wardrobe, buy |
| `convex/recommend.ts` | Orchestrates a recommendation end to end |
| `convex/gemini.ts` | Structured Gemini calls, schema-validated, with a model fallback chain |
| `convex/engine/` | Deterministic scoring, validation and hard constraints (fallback only) |
| `convex/shopping.ts` | Missing Piece Engine and product evaluation |
| `convex/contextDev.ts` | Context.dev extraction and live product discovery |
| `convex/weather.ts` | Open-Meteo lookup with seasonal fallback |
| `convex/schema.ts` | Convex data model |

Design principle: **Gemini for judgement, deterministic code for facts.**
Budgets, ID existence, redundancy counting and schema validation are all handled
in code, never delegated to the model.

### Resilience

Every external dependency has a defined failure path:

- **Gemini** — quota (429), capacity (503), timeout, invalid JSON, schema
  violation or an invalid wardrobe ID all fall back to the deterministic
  recommendation engine. Free-tier quota is metered per model per day, so
  `convex/gemini.ts` walks an ordered model chain before giving up.
- **Context.dev** — API error, timeout, zero products or a malformed extraction
  fall back to product data captured from earlier *real* Context.dev calls.
  Live retrieval is always preferred; nothing is fabricated.
- **Weather** — Open-Meteo failure falls back to seasonal averages for the city.
- **Convex** — empty wardrobe, loading and missing-profile states are all
  handled explicitly. No spinners without end, no raw errors on screen.

---

## Local setup

Requires Node 20+ and a Convex account.

```bash
git clone <this repo>
cd grwm
npm install
```

Start Convex (this writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into
`.env.local` for you, and keeps functions deployed as you edit):

```bash
npx convex dev
```

Set the server-side secrets on the Convex deployment — not in `.env.local`,
because that is where the code using them runs:

```bash
npx convex env set GEMINI_API_KEY       <your-key>
npx convex env set CONTEXT_DEV_API_KEY  <your-key>
```

Seed the demo wardrobe:

```bash
npx convex run seed:ensureSeeded '{}'
```

Then, in a second terminal:

```bash
npm run dev
```

Open http://localhost:3000.

### Checks

```bash
npx tsc --noEmit     # types
npm run lint         # lint
npm run build        # production build
node scripts/verify-ui.mjs   # drives the real demo flow in a browser
```

`scripts/verify-ui.mjs` loads each screen in Chromium, runs the demo query end
to end, captures console errors and writes screenshots to `.screenshots/`.

### Recording the demo

```bash
node scripts/record-demo.mjs   # -> .demo/grwm-demo.mp4
```

Drives the same real flow in Chrome with captions overlaid and writes a captioned
1440×900 MP4. Nothing is staged: the outfit, the missing piece and the verdict all
come from live Convex, Gemini and Context.dev calls, so the raw runtime moves with
latency — the encode step compresses it to `TARGET_SECONDS` (82 by default).
Requires the dev server running and Google Chrome plus `ffmpeg` installed.

---

## Environment variables

Only `NEXT_PUBLIC_CONVEX_URL` is needed by the frontend. Every secret lives on
the Convex deployment. See `.env.example`.

| Variable | Where it is set | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local`, Vercel | yes | Convex endpoint for the browser |
| `CONVEX_DEPLOYMENT` | `.env.local` (written by CLI) | local only | Which deployment `npx convex` targets |
| `GEMINI_API_KEY` | Convex deployment | yes | Stylist and reasoning engine |
| `GEMINI_MODEL` | Convex deployment | no | Pins a model; otherwise a fallback chain is used |
| `CONTEXT_DEV_API_KEY` | Convex deployment | yes | Live product extraction |

Weather requires no key.

---

## Demo

The primary demo query:

> Rooftop date in Dubai tonight. Smart casual. Make me look effortless, not overdressed.

What to look for:

1. **Wardrobe** — 16 coherent pieces loaded from Convex.
2. **Ask GRWM** — submit the query above.
3. **Context** — Dubai, 34°C, hot and humid, read as an evening rooftop date
   with a smart-casual dress code.
4. **The fit** — built from real wardrobe items, with a match score, a concise
   explanation, and a per-factor breakdown (weather, occasion, style, colour).
5. **Missing Piece** — a genuine gap, then a real product from a real retailer
   with its image, price and link, scored for Wardrobe Compatibility and the
   number of outfits it unlocks.
6. **Should I buy this?** — paste any product URL and GRWM will often say
   **SKIP IT**, because you already own something doing that job.
