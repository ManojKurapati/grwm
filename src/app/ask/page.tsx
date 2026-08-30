"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button, Reveal, Thinking } from "@/components/primitives";
import { OutfitResult } from "@/components/OutfitResult";

const SUGGESTIONS = [
  "Rooftop date in Dubai tonight. Smart casual. I want to look effortless, not overdressed.",
  "Client dinner, need to look sharp",
  "Sunday brunch",
  "Airport fit, long haul",
  "Night out",
];

const SUGGESTION_LABELS = [
  "Rooftop date tonight",
  "Client dinner",
  "Sunday brunch",
  "Airport fit",
  "Night out",
];

const ENERGIES = [
  { id: "main-character", label: "Main Character" },
  { id: "clean", label: "Clean" },
  { id: "dangerous", label: "Dangerous" },
  { id: "low-key", label: "Low-key" },
  { id: "serious", label: "Serious" },
  { id: "surprise", label: "Surprise Me" },
];

const THINKING_LINES = [
  "Reading the occasion and dress code…",
  "Checking the weather where you're going…",
  "Filtering out what doesn't work tonight…",
  "Scoring every combination in your wardrobe…",
  "Ranking the strongest fits…",
];

export default function AskPage() {
  const [prompt, setPrompt] = useState("");
  const [energy, setEnergy] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<Id<"recommendationSessions"> | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useAction(api.recommend.generate);
  const latest = useQuery(api.recommend.latestSession);
  const me = useQuery(api.users.current);

  // Restore the last result so returning to this page isn't a dead end.
  const activeSession = sessionId ?? latest ?? null;

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(null);
    setSessionId(null);
    try {
      const result = await generate({
        prompt: trimmed,
        energy: energy ?? undefined,
      });
      setSessionId(result.sessionId);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message.replace(/^\[.*?\]\s*/, "")
          : "Something went wrong.",
      );
    } finally {
      setPending(false);
    }
  }

  const wardrobeEmpty = me !== undefined && me !== null && me.itemCount === 0;

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      {/* ------------------------------------------------------------- prompt */}
      <section className="pt-12 lg:pt-20">
        <Reveal>
          <span className="label">Ask GRWM</span>
          <h1 className="display mt-5 text-[clamp(2.6rem,7vw,4.8rem)]">
            Where are we going?
          </h1>
        </Reveal>

        <Reveal delay={90}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(prompt);
            }}
            className="mt-9 max-w-3xl"
          >
            <div className="flex items-end gap-4 border-b border-ink/25 pb-3 focus-within:border-ink">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask(prompt);
                  }
                }}
                rows={2}
                placeholder="Rooftop date in Dubai tonight. Smart casual."
                className="min-h-[3.2rem] flex-1 resize-none bg-transparent text-[1.15rem] leading-snug outline-none placeholder:text-clay"
              />
              <Button type="submit" disabled={pending || !prompt.trim()}>
                {pending ? "Thinking…" : "Build the fit"}
              </Button>
            </div>
          </form>
        </Reveal>

        <Reveal delay={160}>
          <div className="hide-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setPrompt(suggestion);
                  void ask(suggestion);
                }}
                className="shrink-0 rounded-full border border-clay/45 px-4 py-2 text-[0.8rem] text-slate transition-colors hover:border-ink/40 hover:text-ink"
              >
                {SUGGESTION_LABELS[i]}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="label text-[0.62rem]">Energy</span>
            <div className="flex flex-wrap gap-1.5">
              {ENERGIES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setEnergy(energy === option.id ? null : option.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[0.78rem] transition-colors ${
                    energy === option.id
                      ? "bg-ink text-paper"
                      : "text-ash hover:bg-bone hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------- result */}
      {error && (
        <div className="rule mt-14 pt-8">
          <p className="text-[0.95rem] text-bad">{error}</p>
        </div>
      )}

      {wardrobeEmpty && (
        <div className="rule mt-14 pt-8">
          <p className="text-[0.95rem] text-slate">
            Your wardrobe is empty — add a few pieces first.
          </p>
        </div>
      )}

      {pending && (
        <div className="rule mt-14 pt-10">
          <Thinking lines={THINKING_LINES} />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton aspect-[3/4]" />
            ))}
          </div>
        </div>
      )}

      {!pending && activeSession && (
        <OutfitResult sessionId={activeSession} key={activeSession} />
      )}
    </div>
  );
}
