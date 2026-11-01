export default function SchemaParapente() {
  const datos = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsActivityLocation",
        name: "Vuelo en parapente tándem — Cerro de las Antenas",
        description:
          "Vuelo en parapente tándem con despegue en Cerro de las Antenas, Fortín, y aterrizaje en Coapichapa. Salidas desde Basecamp 420 en Orizaba, Veracruz.",
        url: "https://www.basecamp420.com/parapente",
        sport: "Paragliding",
        telephone: "+522727258748",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Oriente 27 y Norte 10",
          addressLocality: "Orizaba",
          addressRegion: "Veracruz",
          addressCountry: "MX",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 18.8506,
          longitude: -97.1036,
        },
        priceRange: "$1,650–$2,800 MXN",
      },
      {
        "@type": "LocalBusiness",
        name: "Basecamp 420 Orizaba",
        url: "https://www.basecamp420.com/parapente",
        telephone: "+522727258748",
        image: "https://www.basecamp420.com/favicon.ico",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Oriente 27 y Norte 10",
          addressLocality: "Orizaba",
          addressRegion: "Veracruz",
          postalCode: "94300",
          addressCountry: "MX",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 18.8506,
          longitude: -97.1036,
        },
        priceRange: "$$",
        currenciesAccepted: "MXN",
        areaServed: ["Orizaba", "Fortín", "Cumbres de Orizaba"],
        makesOffer: {
          "@type": "AggregateOffer",
          name: "Vuelo en parapente tándem",
          priceCurrency: "MXN",
          lowPrice: "1650.00",
          highPrice: "2800.00",
          url: "https://www.basecamp420.com/parapente",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
