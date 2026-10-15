import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { Split } from "@/components/motion/Split";

export const metadata: Metadata = {
  title: "Vol privé sur mesure",
  description: "Décrivez votre trajet : un conseiller recherche les Empty Legs et vols privés compatibles et vous recontacte. Gratuit et sans engagement.",
  alternates: { canonical: "/demande" },
};

type SP = Record<string, string | undefined>;

export default async function RequestPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <main>
      <SiteHeader />
      <section className="sky pt-36 pb-16">
        <div className="wrap">
          <Split as="h1" className="t-hero text-[19vw] sm:text-[150px]" text={"Sur\nmesure."} />
          <p data-reveal="" className="t-body mt-8 max-w-xl text-ink/75">
            Dites-nous où vous allez. Nous recherchons les Empty Legs compatibles et, si aucun ne convient, un affrètement classique.
          </p>
        </div>
      </section>
      <div className="wrap grid gap-14 py-16 lg:grid-cols-[0.6fr_1.4fr]">
        <ul data-reveal-group="" className="space-y-0 self-start">
          {["Un conseiller, pas un robot", "Opérateur nommé avant tout engagement", "Aucun paiement à cette étape"].map((t) => (
            <li key={t} data-reveal-item="" className="border-t hair py-5 text-[20px] font-bold">{t}</li>
          ))}
        </ul>
        <div data-reveal=""><LeadForm prefill={{ departure: sp.from, arrival: sp.to, departureDate: sp.date, passengers: sp.pax ? Number(sp.pax) : undefined }} /></div>
      </div>
    </main>
  );
}
