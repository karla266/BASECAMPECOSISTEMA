export default function SchemaCimaDigital() {
  const datos = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Cima Digital",
    slogan: "Tú preocúpate por tu trabajo, nosotros hacemos el resto",
    description:
      "División B2B de Basecamp 420. Inteligencia artificial empresarial, automatización de procesos y desarrollo de software llave en mano.",
    url: "https://www.basecamp420.com/cima-digital",
    telephone: "+522727258748",
    areaServed: "MX",
    parentOrganization: {
      "@type": "Organization",
      name: "Basecamp 420",
      url: "https://www.basecamp420.com",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Oriente 27 y Norte 10",
      addressLocality: "Orizaba",
      addressRegion: "Veracruz",
      addressCountry: "MX",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de tecnología empresarial",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Agentes de inteligencia artificial empresarial" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automatización de procesos" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Desarrollo de software llave en mano" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bots omnicanal de WhatsApp con cobro automático" } },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
