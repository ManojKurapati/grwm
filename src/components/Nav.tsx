"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { clsx } from "clsx";

const LINKS = [
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/ask", label: "Ask GRWM" },
  { href: "/buy", label: "Should I buy this?" },
];

export function Nav() {
  const pathname = usePathname();
  const me = useQuery(api.users.current);
  const isLanding = pathname === "/";

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 backdrop-blur-md",
        isLanding ? "bg-paper/70" : "bg-paper/85 rule border-t-0",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="display text-[1.65rem] leading-none tracking-tight">GRWM</span>
          <span className="label hidden sm:inline">AI</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative rounded-full px-3 py-2 text-[0.8rem] transition-colors sm:px-4",
                  active ? "text-ink" : "text-ash hover:text-ink",
                )}
              >
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.label.split(" ")[0]}</span>
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-ink sm:inset-x-4" />
                )}
              </Link>
            );
          })}
        </nav>

        {me && me.itemCount > 0 && (
          <div className="hidden items-center gap-2 border-l border-clay/40 pl-5 md:flex">
            <span className="label nums">{me.itemCount} pieces</span>
          </div>
        )}
      </div>
    </header>
  );
}
