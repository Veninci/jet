import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { Photo } from "@/components/Photo";
import { media } from "@/content/media";

export const metadata: Metadata = {
  title: "Vol privé sur mesure",
  description: "Décrivez votre trajet : un conseiller recherche les Empty Legs et vols privés compatibles et vous recontacte. Gratuit et sans engagement.",
  alternates: { canonical: "/demande" },
};

type SP = Record<string, string | undefined>;

export default async function RequestPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <main className="relative isolate min-h-dvh">
      <div className="absolute inset-x-0 top-0 -z-10 h-[70svh]">
        <Photo photo={media.jetApron} priority className="opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/80 to-night" />
      </div>
      <SiteHeader overlay />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-36 pb-24 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="lx-eyebrow">Vol sur mesure</p>
          <h1 className="font-display mt-5 text-5xl leading-[1.02] font-light sm:text-7xl">Dites-nous où vous allez.</h1>
          <p className="mt-6 max-w-md leading-relaxed text-smoke">
            Nous recherchons les Empty Legs compatibles avec votre trajet et, si aucun ne convient, un affrètement classique.
          </p>
          <ul className="mt-10 space-y-4 text-[15px] text-pearl/85">
            {["Un conseiller, pas un robot", "Opérateur nommé avant tout engagement", "Aucun paiement à cette étape"].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="h-px w-6 bg-champagne" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="lx-card bg-night-2/85 p-6 backdrop-blur-xl sm:p-10">
          <LeadForm prefill={{ departure: sp.from, arrival: sp.to, departureDate: sp.date, passengers: sp.pax ? Number(sp.pax) : undefined }} />
        </div>
      </div>
    </main>
  );
}
