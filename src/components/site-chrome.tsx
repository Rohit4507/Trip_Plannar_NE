"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#planner", label: "Plan a trip" },
  { href: "/destinations", label: "Destinations" },
  { href: "/permits", label: "Permits" },
  { href: "/seasons", label: "Seasons" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-white/5 py-2.5" : "py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-rust-500 to-gold-500 shadow-lg shadow-rust-600/25">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M12 2 22 12 12 22 2 12z" fill="none" stroke="white" strokeWidth="1.4" />
              <path d="M12 6.5 17.5 12 12 17.5 6.5 12z" fill="white" fillOpacity=".85" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold tracking-tight text-mist-50">Northeaster</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-mist-400">Seven Sisters</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-mist-200 transition hover:bg-white/5 hover:text-mist-50"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#planner"
            className="ml-2 rounded-full bg-mist-50 px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-white active:scale-[0.97]"
          >
            Build my itinerary
          </Link>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl card-edge bg-white/5 md:hidden"
        >
          <span className="flex flex-col gap-[5px]">
            <span className={`h-[1.5px] w-4 bg-mist-100 transition ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`h-[1.5px] w-4 bg-mist-100 transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-[1.5px] w-4 bg-mist-100 transition ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-400 md:hidden ${open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="glass mx-4 mt-3 rounded-2xl card-edge p-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-[15px] font-medium text-mist-100 transition active:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#planner"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl bg-mist-50 px-4 py-3 text-center text-[15px] font-semibold text-ink-900"
          >
            Build my itinerary
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-ink-950/60 px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-rust-500 to-gold-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M12 2 22 12 12 22 2 12z" fill="none" stroke="white" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </span>
            <span className="font-display text-base font-semibold">Northeaster</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-400">
            An independent route engine for Northeast India — 8 states, {70}+ destinations, real road distances, permit
            rules and 2025–26 ground costs. Built for the region, not adapted to it.
          </p>
          <p className="mt-4 text-xs text-mist-500">
            Not a booking agency. Support homestays and community tourism wherever you go.
          </p>
        </div>
        <FooterCol
          title="Plan"
          links={[
            { href: "/#planner", label: "AI trip planner" },
            { href: "/destinations", label: "All destinations" },
            { href: "/seasons", label: "When to go" },
          ]}
        />
        <FooterCol
          title="Practical"
          links={[
            { href: "/permits", label: "ILP & PAP permits" },
            { href: "/#transport", label: "Getting around" },
            { href: "/#budget", label: "Costs" },
          ]}
        />
        <FooterCol
          title="Circuits"
          links={[
            { href: "/destinations?state=ML", label: "Meghalaya" },
            { href: "/destinations?state=AR", label: "Arunachal" },
            { href: "/destinations?state=NL", label: "Nagaland" },
          ]}
        />
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/5 pt-6 text-xs text-mist-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Northeaster. Travel responsibly in indigenous lands.</p>
        <p className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-jade-400" />
          Route data refreshed for the 2025–26 season
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-mist-300 transition hover:text-mist-50">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
