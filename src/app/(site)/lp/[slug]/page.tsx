import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { getLanding, landings } from "@/content/landings";

export function generateStaticParams() {
  return landings.map((l) => ({ slug: l.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = getLanding((await params).slug);
  return l ? { title: l.headline, description: l.sub, robots: { index: false, follow: false } } : {};
}

/** Pages Google Ads : volontairement légères (pas de 3D) pour un affichage immédiat. */
export default async function LandingPage({ params }: Props) {
  const l = getLanding((await params).slug);
  if (!l) notFound();
  return (
    <main>
      <SiteHeader />
      <section className="sky pt-32 pb-20">
        <div className="wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:pt-6">
            <h1 className="t-display text-[44px] sm:text-[63px]">{l.headline}</h1>
            <p className="t-body mt-5 max-w-md text-ink/75">{l.sub}</p>
            <ul className="mt-8">
              {["Opérateurs certifiés (CTA)", "Prix total écrit avant engagement", "Demande gratuite, sans paiement"].map((t) => (
                <li key={t} className="border-t border-ink/15 py-4 text-[20px] font-bold">{t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 sm:p-10"><LeadForm prefill={l.prefill} /></div>
        </div>
      </section>
    </main>
  );
}
