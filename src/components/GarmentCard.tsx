"use client";

import { clsx } from "clsx";
import { Garment, garmentSwatch } from "./Garment";

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
 * Uploaded items show their photograph; seeded items show their illustration.
 * Both share the same frame so the grid stays visually even.
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
  const swatch = garmentSwatch(item.spec.primaryColor);
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
          // Uploaded photography. Plain <img> because these are Convex signed
          // storage URLs / remote CDN images with no fixed host allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageSrc}
            alt={item.name}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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

      <div className="flex items-start justify-between gap-3 px-4 pb-5 pt-1">
        <div className="min-w-0">
          <p className="truncate text-[0.9rem] leading-tight">{item.name}</p>
          <p className="label mt-1.5 text-[0.6rem]">
            {[item.spec.material, `${item.spec.formalityScore}/10`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span
          className="mt-1 size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-ink/15"
          style={{ background: swatch }}
          aria-hidden
        />
      </div>
    </button>
  );
}
