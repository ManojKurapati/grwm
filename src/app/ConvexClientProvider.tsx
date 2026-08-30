"use client";

import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Ensures the demo wardrobe exists before anything renders.
 *
 * Seeding is idempotent, so this is safe on every load, and it means the app can
 * never open onto an empty closet — the single most likely way a live demo
 * embarrasses you.
 */
function Seeder({ children }: { children: React.ReactNode }) {
  const me = useQuery(api.users.current);
  const seed = useMutation(api.seed.ensureSeeded);
  const attempted = useRef(false);

  useEffect(() => {
    if (me === undefined) return; // still loading
    if (me && me.itemCount > 0) return;
    if (attempted.current) return;
    attempted.current = true;
    void seed({});
  }, [me, seed]);

  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <Seeder>{children}</Seeder>
    </ConvexProvider>
  );
}
