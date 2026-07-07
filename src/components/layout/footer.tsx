import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Wrench } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { cities } from "@/content/cities";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="bg-night-900 text-ink-300">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold leading-none text-white">
              HomePro
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                Appliances
              </span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-ink-500">{business.description}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
            Repair Services
          </h3>
          <ul className="mt-5 space-y-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-ink-300 transition-colors hover:text-white"
                >
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="text-sm font-bold text-accent-400 hover:text-accent-200">
                Book a Repair →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
            Service Areas
          </h3>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {cities.slice(0, 12).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/service-areas/${c.slug}`}
                  className="text-sm text-ink-300 transition-colors hover:text-white"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li className="col-span-2">
              <Link
                href="/service-areas"
                className="text-sm font-bold text-accent-400 hover:text-accent-200"
              >
                All service areas →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Contact</h3>
          <ul className="mt-5 space-y-3.5 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              <a href={business.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {business.address.street}, {business.address.city}, {business.address.province}{" "}
                {business.address.postalCode}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              <a href={business.phoneHref} className="font-bold text-white hover:text-accent-200">
                {business.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              <a href={`mailto:${business.email}`} className="hover:text-white">
                {business.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              <div className="text-ink-300">
                {business.hours.map((h) => (
                  <p key={h.days}>
                    {h.days}: {h.open} – {h.close}
                  </p>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-sm text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {business.legalName} All rights reserved.
          </p>
          <p>
            Family-owned &amp; operated in {business.address.city}, {business.address.province}
          </p>
        </Container>
      </div>
    </footer>
  );
}
