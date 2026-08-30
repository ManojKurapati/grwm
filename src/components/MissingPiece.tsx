"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { CountUp, Reveal, ScoreBar, SectionLabel, Thinking } from "./primitives";
import { Garment } from "./Garment";
import type { GapResult } from "../../convex/shopping";

const THINKING = [
  "Simulating additions to your wardrobe…",
  "Measuring which outfits each one unlocks…",
  "Checking what you already own that does the same job…",
  "Finding real products with Context.dev…",
];

/**
 * The Missing Piece Engine, surfaced.
 *
 * This runs *after* the outfit is on screen, deliberately: the point being made
 * is "here is the best your wardrobe can do — and here is the one thing that
 * would raise that ceiling", which only lands once you've seen the fit.
 */
export function MissingPiece({
  sessionId,
  baselineScore,
}: {
  sessionId: Id<"recommendationSessions">;
  baselineScore: number;
}) {
  const findGaps = useAction(api.shopping.missingPiece);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; gaps: GapResult[] }
    | { status: "empty" }
    | { status: "error"; message: string }
  >({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    findGaps({ sessionId })
      .then((result) => {
        if (cancelled) return;
        // Only show a gap we can put a real product behind — otherwise it's
        // just shopping advice. We deliberately do NOT also require
        // `newOutfitsUnlocked > 0`: that number is a deterministic estimate and
        // is legitimately 0 for accessories, and hiding a real, well-reasoned
        // product because of it left this section blank. Redundant gaps are
        // filtered upstream in `recommend.ts` instead, which is the right place.
        const usable = result.gaps.filter((gap) => gap.product !== null);
        setState(
          usable.length > 0 ? { status: "done", gaps: usable } : { status: "empty" },
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Couldn't check for gaps.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, findGaps]);

  if (state.status === "error") return null;

  if (state.status === "empty") {
    return (
      <section className="rule mt-16 pt-10">
        <SectionLabel>Wardrobe gaps</SectionLabel>
        <p className="display mt-6 max-w-[38ch] text-[1.5rem] leading-snug">
          Nothing to buy. Your wardrobe already covers this.
        </p>
      </section>
    );
  }

  return (
    <section className="rule mt-16 pt-10">
      <SectionLabel>Your wardrobe could make this even better</SectionLabel>

      {state.status === "loading" && (
        <div className="mt-8">
          <Thinking lines={THINKING} />
        </div>
      )}

      {state.status === "done" && (
        <div className="mt-8 flex flex-col gap-16">
          {state.gaps.map((gap, index) => (
            <GapBlock key={gap.productType} gap={gap} baselineScore={baselineScore} rank={index} />
          ))}
        </div>
      )}
    </section>
  );
}

function GapBlock({
  gap,
  baselineScore,
  rank,
}: {
  gap: GapResult;
  baselineScore: number;
  rank: number;
}) {
  const c = gap.compatibility;

  // Whose number wins.
  //
  // The deterministic engine measures redundancy by role, so it scores a taupe
  // suede loafer against an owned black leather one as a near-duplicate: 38%,
  // "unlocks 0". Gemini, which can tell those two shoes apart, scored the same
  // product in the 80s. Showing the deterministic figure next to Gemini's
  // enthusiastic reasoning read as the app arguing with itself, so the stylist's
  // judgement leads and the measured figures stay as supporting detail.
  const score = gap.stylistScore ?? c.wardrobeCompatibility;
  const unlocked = gap.stylistOutfitsUnlocked ?? c.newOutfitsUnlocked;
  // Only call something a duplicate if the stylist agrees it is one.
  const duplicates = gap.meaningfullyExpands === false ? c.redundantWith : [];

  return (
    <Reveal delay={rank * 120}>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        {/* ------------------------------------------------------- the gap */}
        <div>
          {rank === 0 && (
            <>
              <span className="label text-[0.62rem]">Current outfit score</span>
              <p className="display nums mt-1 text-[3.4rem] leading-none">{baselineScore}%</p>
            </>
          )}

          <p className="mt-7 text-[0.9rem] text-slate">
            {rank === 0 ? "Your wardrobe is missing one thing:" : "Also worth adding:"}
          </p>
          <h3 className="display mt-2 text-[clamp(1.9rem,4.4vw,2.9rem)]">{gap.label}</h3>

          <p className="mt-5 max-w-[44ch] text-[0.92rem] leading-relaxed text-slate">
            {gap.reason}
          </p>
        </div>

        {/* --------------------------------------------------- the product */}
        {gap.product ? (
          <div className="grid gap-7 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <a
              href={gap.product.url}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-[4/5] overflow-hidden bg-paper-2"
            >
              {gap.product.imageUrl ? (
                // Real product photography extracted by Context.dev.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gap.product.imageUrl}
                  alt={gap.product.name}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <Garment
                  subcategory={gap.label}
                  category="shoes"
                  color="brown"
                  className="size-full p-8"
                />
              )}
            </a>

            <div className="flex flex-col">
              <span className="label text-[0.62rem]">{gap.product.retailer}</span>
              <a
                href={gap.product.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-[1.05rem] leading-snug underline decoration-clay decoration-1 underline-offset-4 hover:decoration-ink"
              >
                {gap.product.name}
              </a>
              {gap.product.price !== null && (
                <p className="nums mt-2 text-[1.05rem]">
                  {formatPrice(gap.product.price, gap.product.currency)}
                </p>
              )}

              {/* the headline metrics */}
              <div className="mt-7">
                <span className="label text-[0.62rem]">Wardrobe compatibility</span>
                <div className="mt-1 flex items-baseline gap-3">
                  <CountUp
                    value={score}
                    className="display text-[2.8rem] leading-none"
                    suffix="%"
                  />
                </div>
                <div className="mt-3">
                  <ScoreBar value={score} delay={300} />
                </div>
              </div>

              {unlocked > 0 && (
                <p className="display mt-5 text-[1.4rem] leading-snug">
                  Unlocks {unlocked} outfit{unlocked === 1 ? "" : "s"}
                </p>
              )}

              {/* Why this specific product, in the stylist's own words. */}
              {gap.why && (
                <p className="mt-4 max-w-[46ch] text-[0.92rem] leading-relaxed text-slate">
                  {gap.why}
                </p>
              )}

              <dl className="mt-6 flex flex-col gap-2 text-[0.85rem]">
                <Metric
                  label="Works with"
                  value={`${c.pairsWithCount} of ${c.pairsWithTotal} pieces you own`}
                />
                {c.occasionCoverageGain.length > 0 && (
                  <Metric label="Raises" value={c.occasionCoverageGain.join(", ")} />
                )}
                {duplicates.length > 0 && (
                  <Metric label="Duplicates" value={duplicates.join(", ")} />
                )}
              </dl>

              <p className="label mt-6 text-[0.58rem]">
                {gap.product.provenance === "context.dev"
                  ? "Extracted live via Context.dev"
                  : "Context.dev extraction · cached for demo reliability"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <p className="text-[0.9rem] text-ash">
              No live product available for this gap right now — the gap itself still stands.
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-clay/25 pb-2">
      <dt className="text-ash">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

export function formatPrice(price: number, currency: string | null): string {
  const code = currency ?? "USD";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${code} ${price}`;
  }
}
