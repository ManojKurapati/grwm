"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Garment } from "./Garment";
import { Button, SectionLabel } from "./primitives";

const CATEGORIES = ["top", "bottom", "shoes", "layer", "accessory"];
const AVAILABILITY = ["available", "laundry", "packed"];

/**
 * Item detail / edit.
 *
 * Editing matters more than it looks: the attributes here are exactly what the
 * scoring engine reasons over, so correcting a formality score visibly changes
 * what GRWM recommends next.
 */
export function ItemSheet({
  itemId,
  onClose,
}: {
  itemId: Id<"wardrobeItems">;
  onClose: () => void;
}) {
  const item = useQuery(api.wardrobe.get, { id: itemId });
  const update = useMutation(api.wardrobe.update);
  const remove = useMutation(api.wardrobe.remove);

  const [draft, setDraft] = useState<{
    name: string;
    category: string;
    subcategory: string;
    primaryColor: string;
    material: string;
    formalityScore: number;
    availability: string;
  } | null>(null);

  useEffect(() => {
    if (!item || draft) return;
    setDraft({
      name: item.name,
      category: item.spec.category,
      subcategory: item.spec.subcategory,
      primaryColor: item.spec.primaryColor,
      material: item.spec.material ?? "",
      formalityScore: item.spec.formalityScore,
      availability: item.availability,
    });
  }, [item, draft]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function save() {
    if (!item || !draft) return;
    await update({
      id: itemId,
      name: draft.name,
      availability: draft.availability,
      spec: {
        ...item.spec,
        category: draft.category,
        subcategory: draft.subcategory,
        primaryColor: draft.primaryColor,
        material: draft.material || undefined,
        formalityScore: draft.formalityScore,
      },
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
      />

      <div className="rise relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-y-auto bg-paper sm:max-h-[86dvh]">
        {item === undefined || !draft ? (
          <div className="skeleton h-[60dvh] w-full" />
        ) : item === null ? (
          <div className="p-10 text-center">Item not found.</div>
        ) : (
          <div className="grid gap-0 sm:grid-cols-[0.95fr_1.05fr]">
            {/* --- image ------------------------------------------------- */}
            <div className="relative aspect-square bg-paper-2 sm:aspect-auto">
              {item.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageSrc} alt={item.name} className="size-full object-cover" />
              ) : (
                <Garment
                  subcategory={draft.subcategory}
                  category={draft.category}
                  color={draft.primaryColor}
                  pattern={item.spec.pattern}
                  className="size-full p-10"
                />
              )}
              {item.analysis === "pending" && (
                <span className="label absolute bottom-4 left-5">Analysing…</span>
              )}
            </div>

            {/* --- fields ----------------------------------------------- */}
            <div className="flex flex-col gap-7 p-6 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="label">{item.source === "seed" ? "Seeded" : "Uploaded"}</span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="display mt-2 w-full bg-transparent text-[1.9rem] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="label -mr-2 -mt-1 rounded-full p-2 hover:text-ink"
                >
                  Close
                </button>
              </div>

              {item.aiDescription && (
                <p className="text-[0.92rem] leading-relaxed text-slate">{item.aiDescription}</p>
              )}

              <div className="grid grid-cols-2 gap-5">
                <Field label="Category">
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="w-full border-b border-clay/50 bg-transparent py-1.5 text-[0.9rem] outline-none focus:border-ink"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Type">
                  <input
                    value={draft.subcategory}
                    onChange={(e) => setDraft({ ...draft, subcategory: e.target.value })}
                    className="w-full border-b border-clay/50 bg-transparent py-1.5 text-[0.9rem] outline-none focus:border-ink"
                  />
                </Field>
                <Field label="Colour">
                  <input
                    value={draft.primaryColor}
                    onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })}
                    className="w-full border-b border-clay/50 bg-transparent py-1.5 text-[0.9rem] outline-none focus:border-ink"
                  />
                </Field>
                <Field label="Material">
                  <input
                    value={draft.material}
                    placeholder="linen, cotton…"
                    onChange={(e) => setDraft({ ...draft, material: e.target.value })}
                    className="w-full border-b border-clay/50 bg-transparent py-1.5 text-[0.9rem] outline-none placeholder:text-clay focus:border-ink"
                  />
                </Field>
              </div>

              <Field label={`Formality — ${draft.formalityScore}/10`}>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={draft.formalityScore}
                  onChange={(e) =>
                    setDraft({ ...draft, formalityScore: Number(e.target.value) })
                  }
                  className="w-full accent-ink"
                />
                <div className="label mt-1 flex justify-between text-[0.6rem]">
                  <span>Gym</span>
                  <span>Smart casual</span>
                  <span>Black tie</span>
                </div>
              </Field>

              <Field label="Availability">
                <div className="flex gap-2">
                  {AVAILABILITY.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDraft({ ...draft, availability: option })}
                      className={`rounded-full border px-3.5 py-1.5 text-[0.78rem] transition-colors ${
                        draft.availability === option
                          ? "border-ink bg-ink text-paper"
                          : "border-clay/45 text-slate hover:border-ink/40"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Field>

              <div>
                <SectionLabel>Signals</SectionLabel>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[
                    ...item.spec.styleTags,
                    ...item.spec.weatherTags.map((t) => `${t} weather`),
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-bone px-3 py-1 text-[0.72rem] text-slate"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="label mt-4 text-[0.62rem]">
                  Worn {item.wearCount} times · suits{" "}
                  {item.spec.occasionTags.slice(0, 4).join(", ")}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-3 pt-2">
                <Button onClick={() => void save()}>Save</Button>
                {item.source === "upload" && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      void remove({ id: itemId });
                      onClose();
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label text-[0.62rem]">{label}</span>
      <div className="mt-2">{children}</div>
    </div>
  );
}
