import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Demande de vol en jet privé",
  description: "Décrivez votre trajet : un conseiller recherche les Empty Legs et vols privés compatibles et vous recontacte. Gratuit et sans engagement.",
  alternates: { canonical: "/demande" },
};

type SP = Record<string, string | undefined>;

export default async function RequestPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="eyebrow">Demande de vol</p>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl">Votre vol privé, au meilleur moment</h1>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Indiquez votre trajet et votre flexibilité. Nous recherchons les Empty Legs compatibles et, si aucun ne
            convient, une solution d&apos;affrètement classique.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-soft">
            <li>— Réponse d&apos;un conseiller, pas d&apos;un robot</li>
            <li>— Opérateur identifié avant tout engagement</li>
            <li>— Aucun paiement à cette étape</li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 sm:p-8">
          <LeadForm prefill={{ departure: sp.from, arrival: sp.to, departureDate: sp.date, passengers: sp.pax ? Number(sp.pax) : undefined }} />
        </div>
      </div>
    </main>
  );
}
