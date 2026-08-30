"use client";

import { clsx } from "clsx";
import { Garment } from "./Garment";

export type GarmentLike = {
  _id: string;
  name: string;
  imageSrc: string | null;
  wearCount: number;
  availability: string;
  spec: {
    category: string;
    subcategory: string;
    primaryColor: string;
    material?: string;
    pattern?: string;
    formalityScore: number;
    styleTags: string[];
  };
};

/**
 * A single wardrobe piece.
 *
 * Photography where we have a clean shot of the real garment, the illustrated
 * system otherwise. Both share the same frame and the same paper ground so the
 * grid stays visually even.
 */
export function GarmentCard({
  item,
  onClick,
  slot,
  size = "default",
}: {
  item: GarmentLike;
  onClick?: () => void;
  /** when rendered as part of an outfit */
  slot?: string;
  size?: "default" | "large";
}) {
  const unavailable = item.availability !== "available";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        "group relative block w-full overflow-hidden bg-paper-2 text-left transition-all duration-500",
        onClick && "hover:bg-bone/70",
        unavailable && "opacity-45",
        !onClick && "cursor-default",
      )}
    >
      <div className={clsx("relative", size === "large" ? "aspect-[3/4]" : "aspect-[4/5]")}>
        {item.imageSrc ? (
          // Photography — either a user upload or a seeded product shot. Plain
          // <img> because these are Convex signed storage URLs / remote CDN
          // images with no fixed host allowlist.
          //
          // `mix-blend-multiply` is doing real work: product photography arrives
          // on white or pale grey, which would sit as bright rectangles beside
          // the illustrated pieces. Multiplying against the paper ground turns
          // that white into the same warm tone the illustrations sit on, so a
          // grid of both media reads as one wardrobe rather than two sources.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageSrc}
            alt={item.name}
            className="size-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <Garment
            subcategory={item.spec.subcategory}
            category={item.spec.category}
            color={item.spec.primaryColor}
            pattern={item.spec.pattern}
            className={clsx(
              "size-full transition-transform duration-700 group-hover:scale-[1.04]",
              size === "large" ? "p-8" : "p-6",
            )}
          />
        )}

        {slot && (
          <span className="label absolute left-4 top-4 text-[0.6rem]">{slot}</span>
        )}

        {unavailable && (
          <span className="label absolute right-4 top-4 text-[0.6rem] label-ink">
            {item.availability}
          </span>
        )}
      </div>

      {/*
        Deliberately just the name. Material and a formality score out of ten
        are what the engine reasons about, not what someone deciding what to
        wear wants to read on every tile — that detail lives in the item sheet.
      */}
      <div className="px-4 pb-5 pt-1">
        <p className="truncate text-[0.9rem] leading-tight">{item.name}</p>
      </div>
    </button>
  );
}
