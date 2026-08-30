"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { GarmentCard } from "@/components/GarmentCard";
import { Button, Pill, Reveal, SectionLabel } from "@/components/primitives";
import { ItemSheet } from "@/components/ItemSheet";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
  { id: "layer", label: "Layers" },
  { id: "accessory", label: "Accessories" },
] as const;

export default function WardrobePage() {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Id<"wardrobeItems"> | null>(null);
  const [uploading, setUploading] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const items = useQuery(api.wardrobe.list, filter === "all" ? {} : { category: filter });
  const counts = useQuery(api.wardrobe.counts);

  const generateUploadUrl = useMutation(api.wardrobe.generateUploadUrl);
  const addUploaded = useMutation(api.wardrobe.addUploaded);
  const analyze = useAction(api.uploads.analyze);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, 8);
    setUploading(list.length);

    for (const file of list) {
      try {
        const url = await generateUploadUrl({});
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) throw new Error(`upload failed: ${response.status}`);
        const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };

        const itemId = await addUploaded({
          storageId,
          name: prettifyFilename(file.name),
        });
        // Vision analysis runs in the background; the card is already visible.
        void analyze({ itemId });
      } catch (error) {
        console.error("upload failed", error);
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-6 pt-10 pb-10 lg:pt-14">
        <div>
          <span className="label">Your wardrobe</span>
          <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4rem)]">
            {counts ? `${counts.all} pieces` : "Loading"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            {uploading > 0 ? `Uploading ${uploading}…` : "Add pieces"}
          </Button>
          <Link
            href="/ask"
            className="inline-flex items-center rounded-full bg-ink px-6 py-3 text-[0.85rem] text-paper transition-colors hover:bg-ink-soft"
          >
            Ask GRWM
          </Link>
        </div>
      </header>

      <div className="hide-scrollbar sticky top-[61px] z-30 -mx-5 flex gap-2 overflow-x-auto bg-paper/90 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        {FILTERS.map((f) => (
          <Pill
            key={f.id}
            active={filter === f.id}
            onClick={() => setFilter(f.id)}
            count={counts?.[f.id as keyof typeof counts]}
          >
            {f.label}
          </Pill>
        ))}
      </div>

      <section className="pt-8">
        {items === undefined ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="skeleton aspect-[4/5]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => fileInput.current?.click()} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item, i) => (
              <Reveal key={item._id} delay={Math.min(i * 22, 240)}>
                <GarmentCard item={item} onClick={() => setSelected(item._id)} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {items && items.length > 0 && (
        <section className="rule mt-20 pt-10">
          <SectionLabel>What GRWM knows</SectionLabel>
          <p className="mt-6 max-w-[62ch] text-[0.95rem] leading-relaxed text-slate">
            Every piece carries structured attributes — colour, material, formality, the weather
            and occasions it suits. That is what lets GRWM reason about your wardrobe instead of
            guessing. Tap any item to see and edit what it knows.
          </p>
        </section>
      )}

      {selected && <ItemSheet itemId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rule flex flex-col items-center gap-6 py-28 text-center">
      <h2 className="display text-[2rem]">Nothing here yet.</h2>
      <p className="max-w-[36ch] text-[0.95rem] leading-relaxed text-slate">
        Add a few photos and GRWM will read the colour, fabric and formality of each piece.
      </p>
      <Button onClick={onAdd}>Add pieces</Button>
    </div>
  );
}

/** "cream-linen-shirt.jpg" -> "Cream linen shirt" */
function prettifyFilename(filename: string): string {
  const base = filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
  if (!base) return "New piece";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
