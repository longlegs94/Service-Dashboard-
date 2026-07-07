"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Menu, Phone, Wrench, X } from "lucide-react";
import { business } from "@/content/business";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/services", label: "Repair Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/diagnose", label: "AI Diagnosis" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Utility bar */}
      <div className="hidden bg-night-900 text-xs text-ink-300 lg:block">
        <div className="mx-auto flex h-8 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-accent-400" aria-hidden="true" />
            {business.address.street}, {business.address.city}, {business.address.province}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-accent-400" aria-hidden="true" />
            {business.hours[0].days} {business.hours[0].open}–{business.hours[0].close} ·{" "}
            {business.hours[1].days} {business.hours[1].open}–{business.hours[1].close}
          </p>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`border-b bg-white/95 backdrop-blur transition-all duration-300 ${
          scrolled ? "border-ink-200 shadow-soft" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${business.name} — home`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold leading-none text-ink-900">
              HomePro
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                Appliances
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className={`nav-link py-1 text-sm font-semibold transition-colors ${
                    active ? "text-ink-900" : "text-ink-700 hover:text-ink-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={business.phoneHref}
              className="hidden items-center gap-2 text-sm font-bold text-ink-900 transition-colors hover:text-brand-700 md:flex"
            >
              <Phone className="h-4 w-4 text-accent-500" aria-hidden="true" />
              {business.phone}
            </a>
            <Button href="/book" size="sm" className="hidden sm:inline-flex">
              Book Now
            </Button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-900 hover:bg-ink-50 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-ink-100 bg-white lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="space-y-1 px-4 py-4">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 font-semibold text-ink-900 hover:bg-ink-50"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-3">
                  <Button href="/book">Book a Repair</Button>
                  <Button href={business.phoneHref} variant="outline">
                    <Phone className="h-4 w-4" aria-hidden="true" /> {business.phone}
                  </Button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
