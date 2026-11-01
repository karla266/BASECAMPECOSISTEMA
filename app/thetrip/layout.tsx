import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Trip Smoke Shop | Cristalería Pyrex, blunts y vaporizadores",
  description:
    "Blunt Wrap 2X Double Platinum, sobre individual a $30 MXN y 24 sabores. Cristalería y vaporizadores en The Trip Smoke Shop, Orizaba.",
  alternates: { canonical: "https://www.basecamp420.com/thetrip" },
  openGraph: {
    title: "The Trip Smoke Shop | Cristalería Pyrex, blunts y vaporizadores",
    description: "Sobre individual de Blunt Wrap 2X Double Platinum a $30 MXN, 24 sabores, en The Trip Smoke Shop.",
    url: "https://www.basecamp420.com/thetrip",
    siteName: "Basecamp 420",
    locale: "es_MX",
    type: "website",
  },
};

export default function TheTripLayout({ children }: { children: React.ReactNode }) {
  return children;
}
