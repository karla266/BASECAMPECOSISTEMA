import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Trip Smoke Shop | Cristalería Pyrex, blunts y vaporizadores",
  description:
    "Cristalería Pyrex, blunts y vaporizadores en The Trip Smoke Shop, Orizaba. Precios en MXN y pedido en mostrador.",
  alternates: { canonical: "https://www.basecamp420.com/thetrip" },
  openGraph: {
    title: "The Trip Smoke Shop | Cristalería Pyrex, blunts y vaporizadores",
    description: "Tienda de Basecamp 420: cristalería, blunts y vaporizadores.",
    url: "https://www.basecamp420.com/thetrip",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

export default function TheTripLayout({ children }: { children: React.ReactNode }) {
  return children;
}
