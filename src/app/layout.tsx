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

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Active les états initiaux des animations avant le premier rendu (évite le flash),
            sauf si l'utilisateur réduit les mouvements. Filet de sécurité : tout redevient visible après 4 s. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('js-motion');setTimeout(function(){if(!window.__motionReady)d.classList.remove('js-motion')},4000)}}catch(e){}})();` }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <AttributionTracker />
        <ConsentAndAnalytics />
      </body>
    </html>
  );
}
