import { business } from "@/content/business";
import { cities } from "@/content/cities";
import type { Service } from "@/content/services";
import type { Faq } from "@/content/faqs";

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide LocalBusiness schema — rendered once in the root layout. */
export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "@id": `${business.siteUrl}/#business`,
        name: business.name,
        legalName: business.legalName,
        description: business.description,
        url: business.siteUrl,
        telephone: business.phone,
        email: business.email,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address.street,
          addressLocality: business.address.city,
          addressRegion: business.address.province,
          postalCode: business.address.postalCode,
          addressCountry: business.address.country,
        },
        openingHoursSpecification: business.hoursSchema.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.dayOfWeek,
          opens: h.opens,
          closes: h.closes,
        })),
        areaServed: cities.map((c) => ({
          "@type": "City",
          name: `${c.name}, BC`,
        })),
      }}
    />
  );
}

/** Service schema for /services/[slug] pages. */
export function ServiceJsonLd({ service }: { service: Service }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.name,
        description: service.summary,
        url: `${business.siteUrl}/services/${service.slug}`,
        serviceType: service.name,
        provider: { "@id": `${business.siteUrl}/#business` },
        areaServed: cities.map((c) => ({ "@type": "City", name: `${c.name}, BC` })),
      }}
    />
  );
}

/** FAQPage schema for any page with an FAQ section. */
export function FaqJsonLd({ faqs }: { faqs: Faq[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}
