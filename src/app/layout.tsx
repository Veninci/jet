import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/config";
import { ConsentAndAnalytics } from "@/components/ConsentAndAnalytics";
import { AttributionTracker } from "@/components/AttributionTracker";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Empty Legs et vols en jet privé à prix réduit`, template: `%s · ${site.name}` },
  description:
    "Trouvez un vol Empty Leg en jet privé : des trajets de repositionnement proposés à tarif réduit par des opérateurs certifiés. Demande gratuite, réponse d'un conseiller.",
  openGraph: { type: "website", locale: "fr_FR", siteName: site.name },
  robots: process.env.APP_ENV === "production" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0f1a2a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <AttributionTracker />
        <ConsentAndAnalytics />
      </body>
    </html>
  );
}
