import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Wrench } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { cities } from "@/content/cities";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            HomePro Appliances
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">{business.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
            Repair Services
          </h3>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                >
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Book a Repair →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
            Service Areas
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {cities.slice(0, 12).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/service-areas/${c.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li className="col-span-2">
              <Link
                href="/service-areas"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                All service areas →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-500">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={business.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
                {business.address.street}, {business.address.city}, {business.address.province}{" "}
                {business.address.postalCode}
              </a>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={business.phoneHref} className="font-medium text-ink-900 hover:text-brand-700">
                {business.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={`mailto:${business.email}`} className="hover:text-brand-700">
                {business.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <div>
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

      <div className="border-t border-ink-100">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-sm text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {business.legalName} All rights reserved.
          </p>
          <p>
            Family-owned & operated in {business.address.city}, {business.address.province}
          </p>
        </Container>
      </div>
    </footer>
  );
}
