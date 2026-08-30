"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Garment } from "@/components/Garment";
import { Reveal, SectionLabel } from "@/components/primitives";

/** A few pieces from the real wardrobe, used as the hero composition. */
const HERO_ORDER = ["Cream linen shirt", "Black relaxed trousers", "Black loafers", "Silver watch"];

export default function Landing() {
  const items = useQuery(api.wardrobe.list, {});
  const productStats = useQuery(api.products.stats);

  const hero = HERO_ORDER.map((name) => items?.find((i) => i.name === name)).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* ---------------------------------------------------------------- hero */}
      <section className="grid items-center gap-12 pt-10 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-20">
        <div>
          <Reveal>
            <span className="label">Personal wardrobe intelligence</span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="display mt-6 text-[clamp(2.9rem,8.2vw,5.6rem)]">
              Stop wondering
              <br />
              what to wear.
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-7 max-w-[34ch] text-[1.05rem] leading-relaxed text-slate">
              GRWM knows your wardrobe, your plans and your world — and builds the fit.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/wardrobe"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[0.85rem] text-paper transition-colors hover:bg-ink-soft"
              >
                Build my wardrobe
              </Link>
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 text-[0.85rem] transition-colors hover:border-ink/50"
              >
                Ask GRWM
              </Link>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <p className="display mt-14 max-w-[28ch] text-[1.35rem] italic leading-snug text-ash">
              Shop your wardrobe before shopping the internet.
            </p>
          </Reveal>
        </div>

        {/* hero composition — the actual seeded outfit */}
        <Reveal delay={200} className="order-first lg:order-none">
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(hero.length === 4 ? hero : (items ?? []).slice(0, 4)).map((item, i) => (
                <div
                  key={item._id}
                  className="relative aspect-[4/5] overflow-hidden bg-paper-2"
                  style={{
                    transform: i % 2 === 0 ? "translateY(-10px)" : "translateY(10px)",
                  }}
                >
                  <Garment
                    subcategory={item.spec.subcategory}
                    category={item.spec.category}
                    color={item.spec.primaryColor}
                    pattern={item.spec.pattern}
                    className="size-full p-5"
                  />
                  <span className="label absolute bottom-3 left-4 text-[0.6rem]">
                    {item.spec.subcategory}
                  </span>
                </div>
              ))}
              {items === undefined &&
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="skeleton aspect-[4/5]" />
                ))}
            </div>

            {hero.length === 4 && (
              <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2 text-[0.72rem] tracking-wide text-paper">
                <span className="nums">93%</span> match · rooftop date, Dubai
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ how it works */}
      <section className="pb-28">
        <SectionLabel>How it thinks</SectionLabel>
        <div className="mt-10 grid gap-px bg-clay/30 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "It reads the situation",
              body: "Occasion, dress code, time of day and live weather become hard constraints — not suggestions.",
            },
            {
              n: "02",
              title: "It shops your wardrobe",
              body: "Every plausible combination is scored across seven dimensions, then ranked. Nothing is invented.",
            },
            {
              n: "03",
              title: "It finds the one gap",
              body: "If a single piece would make everything you own more useful, GRWM finds it — and prices it.",
            },
          ].map((step) => (
            <div key={step.n} className="bg-paper p-7 sm:p-8">
              <span className="label nums">{step.n}</span>
              <h3 className="display mt-5 text-[1.6rem]">{step.title}</h3>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-slate">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- the pitch */}
      <section className="rule pt-16 pb-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>Wardrobe compatibility</SectionLabel>
            <h2 className="display mt-8 text-[clamp(2rem,4.6vw,3.2rem)]">
              Buying this makes
              <br />
              the clothes you
              <br />
              already own
              <br />
              <span className="italic">more useful.</span>
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <p className="max-w-[46ch] text-[1.02rem] leading-relaxed text-slate">
              GRWM scores every product against your entire wardrobe: how many pieces it pairs
              with, which occasions it covers, and — crucially — whether you already own
              something doing the same job. Redundancy divides the score. That is why it will
              tell you to skip things.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-[0.85rem] transition-colors hover:border-ink/50"
              >
                Test a product URL
              </Link>
            </div>
            {productStats && productStats.total > 0 && (
              <p className="label">
                {productStats.total} products extracted via Context.dev
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
