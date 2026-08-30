"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Whether the visitor asked for reduced motion.
 *
 * Uses `useSyncExternalStore` rather than an effect so the value is available on
 * the first render: setting it from an effect would mean every animation starts,
 * then stops, which is precisely what the preference asks us not to do.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    // Server render: assume motion is fine, matching the CSS default.
    () => false,
  );
}

/** Editorial section label with a hairline rule. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <span className="label whitespace-nowrap">{children}</span>
      <span className="h-px flex-1 bg-clay/35" />
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.85rem] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" &&
          "bg-ink text-paper hover:bg-ink-soft active:scale-[0.985]",
        variant === "secondary" &&
          "border border-ink/20 text-ink hover:border-ink/50 hover:bg-bone/60 active:scale-[0.985]",
        variant === "ghost" && "text-ash hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * A number that counts up when it first appears.
 * Used for scores, because a score landing feels like a verdict.
 */
export function CountUp({
  value,
  duration = 900,
  className,
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reduce) return;

    const start = performance.now();
    const origin = from.current;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo — fast arrival, gentle settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(origin + (value - origin) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduce]);

  return (
    <span className={clsx("nums", className)}>
      {reduce ? value : display}
      {suffix}
    </span>
  );
}

/** Thin horizontal score meter used in the "why this works" breakdown. */
export function ScoreBar({
  value,
  delay = 0,
  tone = "ink",
}: {
  value: number;
  delay?: number;
  tone?: "ink" | "good" | "warn" | "bad";
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="h-[3px] w-full overflow-hidden bg-clay/25">
      <div
        className={clsx(
          "h-full transition-[width] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          tone === "ink" && "bg-ink",
          tone === "good" && "bg-good",
          tone === "warn" && "bg-warn",
          tone === "bad" && "bg-bad",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/** Reveal children once, on mount, with an optional stagger. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={clsx("rise", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Pill({
  children,
  active,
  onClick,
  count,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[0.8rem] transition-all",
        active
          ? "border-ink bg-ink text-paper"
          : "border-clay/45 text-slate hover:border-ink/40 hover:text-ink",
      )}
    >
      {children}
      {count !== undefined && (
        <span className={clsx("nums text-[0.7rem]", active ? "text-paper/60" : "text-ash")}>
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Staged progress that explains the reasoning without narrating it.
 *
 * Each stage resolves to a tick, so by the time the fit lands the user has been
 * told — quickly — that the wardrobe, the weather and the occasion were all
 * considered. The final line stays unresolved: it is the one still running.
 */
export function Thinking({ lines, interval = 520 }: { lines: string[]; interval?: number }) {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1 < lines.length ? i + 1 : i));
    }, interval);
    return () => clearInterval(timer);
  }, [lines.length, interval, reduce]);

  // Reduced motion: show the whole sequence at once rather than animating it.
  const current = reduce ? lines.length - 1 : index;

  return (
    <ol className="flex flex-col gap-3.5">
      {lines.slice(0, current + 1).map((line, i) => {
        const done = i < current;
        return (
          <li
            key={line}
            className={clsx(
              "fade flex items-center gap-3 text-[0.9rem]",
              done ? "text-ash" : "text-ink",
            )}
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              {done ? (
                <span className="text-[0.8rem] leading-none text-ink">✓</span>
              ) : (
                <span className="size-1.5 animate-pulse rounded-full bg-ink" />
              )}
            </span>
            {line}
          </li>
        );
      })}
    </ol>
  );
}
