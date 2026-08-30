"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, CountUp, Reveal, ScoreBar, SectionLabel, Thinking } from "@/components/primitives";
import { formatPrice } from "@/components/MissingPiece";
import { GarmentCard } from "@/components/GarmentCard";
import type { BuyVerdict } from "../../../convex/shopping";
import { clsx } from "clsx";

const THINKING = [
  "Extracting the product with Context.dev…",
  "Working out what kind of garment it is…",
  "Pairing it against every piece you own…",
  "Checking whether you already own its job…",
  "Counting the outfits it would genuinely unlock…",
];

const VERDICT_COPY = {
  buy: { title: "BUY IT", tone: "text-good" },
  maybe: { title: "MAYBE", tone: "text-warn" },
  skip: { title: "SKIP IT", tone: "text-bad" },
} as const;

export default function BuyPage() {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BuyVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useAction(api.shopping.evaluateUrl);
  const examples = useQuery(api.shopping.exampleUrls);
  const wardrobe = useQuery(api.wardrobe.list, {});

  async function run(target: string) {
    const trimmed = target.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      setResult(await evaluate({ url: trimmed }));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message.replace(/^\[.*?\]\s*/, "").replace(/^Uncaught Error:\s*/, "")
          : "Couldn't evaluate that product.",
      );
    } finally {
      setPending(false);
    }
  }

  // A few pieces the product would actually pair with, for a visual receipt.
  const previewItems =
    result && wardrobe
      ? wardrobe
          .filter((item) => result.compatibility.redundantWith.includes(item.name))
          .slice(0, 5)
      : [];

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="pt-12 lg:pt-20">
        <Reveal>
          <span className="label">Before you buy</span>
          <h1 className="display mt-5 text-[clamp(2.6rem,7vw,4.8rem)]">
            Should I buy this?
          </h1>
          <p className="mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-slate">
            Paste any product URL. GRWM extracts it with Context.dev, then judges it against
            everything already in your wardrobe.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(url);
            }}
            className="mt-9 max-w-3xl"
          >
            <div className="flex items-center gap-4 border-b border-ink/25 pb-3 focus-within:border-ink">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                inputMode="url"
                placeholder="https://…"
                className="flex-1 bg-transparent text-[1.05rem] outline-none placeholder:text-clay"
              />
              <Button type="submit" disabled={pending || !url.trim()}>
                {pending ? "Reading…" : "Judge it"}
              </Button>
            </div>
          </form>
        </Reveal>

        {examples && examples.length > 0 && (
          <Reveal delay={170}>
            <div className="mt-6 flex flex-col gap-2">
              <span className="label text-[0.6rem]">Try one of these — really extracted</span>
              <div className="flex flex-wrap gap-2">
                {examples.map(
                  (example) =>
                    example && (
                      <button
                        key={example.url}
                        type="button"
                        onClick={() => {
                          setUrl(example.url);
                          void run(example.url);
                        }}
                        className="rounded-full border border-clay/45 px-4 py-2 text-[0.8rem] text-slate transition-colors hover:border-ink/40 hover:text-ink"
                      >
                        {example.label}
                      </button>
                    ),
                )}
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {error && (
        <section className="rule mt-14 pt-8">
          <p className="text-[0.95rem] text-bad">{error}</p>
        </section>
      )}

      {pending && (
        <section className="rule mt-14 pt-10">
          <Thinking lines={THINKING} />
        </section>
      )}

      {result && !pending && <Verdict result={result} previewItems={previewItems} />}

      <RecentVerdicts />
    </div>
  );
}

function Verdict({
  result,
  previewItems,
}: {
  result: BuyVerdict;
  previewItems: Array<React.ComponentProps<typeof GarmentCard>["item"]>;
}) {
  const copy = VERDICT_COPY[result.verdict];
  const c = result.compatibility;

  return (
    <section className="rule mt-14 pt-12">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* ------------------------------------------------------- the verdict */}
        <div>
          <Reveal>
            <h2 className={clsx("display text-[clamp(3.6rem,13vw,8rem)] leading-[0.85]", copy.tone)}>
              {copy.title}
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-9 flex flex-wrap items-end gap-x-12 gap-y-6">
              <div>
                <span className="label text-[0.62rem]">Wardrobe compatibility</span>
                <CountUp
                  value={c.wardrobeCompatibility}
                  className="display mt-1 block text-[3.2rem] leading-none"
                  suffix="%"
                />
              </div>
              <div>
                <span className="label text-[0.62rem]">Outfits unlocked</span>
                <CountUp
                  value={c.newOutfitsUnlocked}
                  className="display mt-1 block text-[3.2rem] leading-none"
                />
              </div>
            </div>
            <div className="mt-5 max-w-md">
              <ScoreBar
                value={c.wardrobeCompatibility}
                delay={350}
                tone={result.verdict === "buy" ? "good" : result.verdict === "maybe" ? "warn" : "bad"}
              />
            </div>
          </Reveal>

          <Reveal delay={220}>
            <p className="display mt-9 max-w-[42ch] text-[clamp(1.3rem,2.6vw,1.8rem)] leading-snug">
              {result.headline}
            </p>
            <ul className="mt-6 flex max-w-[52ch] flex-col gap-3">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex gap-3 text-[0.95rem] leading-relaxed text-slate">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-clay" />
                  {reason}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* the receipts */}
          <Reveal delay={300}>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-x-10 gap-y-3 text-[0.85rem]">
              <Row label="Pairs with" value={`${c.pairsWithCount}/${c.pairsWithTotal} pieces`} />
              <Row label="Style fit" value={`${c.components.styleAlignment}%`} />
              <Row label="Climate fit" value={`${c.components.weatherFit}%`} />
              <Row
                label="Redundancy"
                value={
                  c.redundantWith.length === 0
                    ? "none"
                    : `×${c.components.redundancyMultiplier}`
                }
              />
            </div>
          </Reveal>

          {result.alternative && (
            <Reveal delay={380}>
              <div className="mt-10 border-l-2 border-ink pl-5">
                <span className="label text-[0.62rem]">Buy this instead</span>
                <p className="display mt-1.5 text-[1.5rem]">{result.alternative.label}</p>
                <p className="mt-2 max-w-[44ch] text-[0.88rem] leading-relaxed text-slate">
                  {result.alternative.rationale}
                </p>
              </div>
            </Reveal>
          )}
        </div>

        {/* ------------------------------------------------------- the product */}
        <Reveal delay={160}>
          <div className="sticky top-24">
            <a
              href={result.product.url}
              target="_blank"
              rel="noreferrer"
              className="group block aspect-[4/5] overflow-hidden bg-paper-2"
            >
              {result.product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.product.imageUrl}
                  alt={result.product.name}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              )}
            </a>
            <div className="mt-5">
              <span className="label text-[0.62rem]">{result.product.retailer}</span>
              <p className="mt-2 text-[1.05rem] leading-snug">{result.product.name}</p>
              {result.product.price !== null && (
                <p className="nums mt-1.5 text-[1.05rem]">
                  {formatPrice(result.product.price, result.product.currency)}
                </p>
              )}
              {/*
                The classifier's raw read used to be printed here. It is
                internal detail, and when the classifier is wrong it is wrong in
                public: a suede loafer came back as "black leather t-shirt ·
                formality 2.2/10". The verdict and the reasons beside it already
                show what GRWM understood.
              */}
              <p className="label mt-4 text-[0.58rem]">
                {result.product.provenance === "context.dev"
                  ? "Extracted live via Context.dev"
                  : "Context.dev extraction · cached"}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {previewItems.length > 0 && (
        <div className="mt-16">
          <SectionLabel>You already own this role</SectionLabel>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {previewItems.map((item) => (
              <GarmentCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-clay/25 pb-2">
      <span className="text-ash">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function RecentVerdicts() {
  const recent = useQuery(api.shopping.recentEvaluations);
  if (!recent || recent.length === 0) return null;

  return (
    <section className="rule mt-20 pt-10">
      <SectionLabel>Recent verdicts</SectionLabel>
      <div className="mt-6 flex flex-col">
        {recent.map(({ evaluation, product }) =>
          product ? (
            <div
              key={evaluation._id}
              className="flex items-center gap-5 border-b border-clay/25 py-4"
            >
              <div className="size-14 shrink-0 overflow-hidden bg-paper-2">
                {product.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9rem]">{product.name}</p>
                <p className="label mt-1 text-[0.58rem]">{product.retailer}</p>
              </div>
              <span className="nums text-[0.9rem] text-slate">
                {evaluation.wardrobeCompatibility}%
              </span>
              <span
                className={clsx(
                  "w-16 text-right text-[0.75rem] uppercase tracking-wider",
                  VERDICT_COPY[evaluation.verdict as keyof typeof VERDICT_COPY]?.tone,
                )}
              >
                {evaluation.verdict}
              </span>
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}
