import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { HowItWorks } from "@/components/HowItWorks";
import { Photo } from "@/components/Photo";
import { getLanding, landings } from "@/content/landings";
import { media } from "@/content/media";

export function generateStaticParams() {
  return landings.map((l) => ({ slug: l.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = getLanding((await params).slug);
  return l ? { title: l.headline, description: l.sub, robots: { index: false, follow: false } } : {};
}

export default async function LandingPage({ params }: Props) {
  const l = getLanding((await params).slug);
  if (!l) notFound();
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <Photo photo={media.heroJet} priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/40" />
        <SiteHeader overlay />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pt-32 pb-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:pb-24">
          <div className="lg:pt-10">
            <h1 className="font-display text-5xl leading-[1] font-light sm:text-6xl">{l.headline}</h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-pearl/80">{l.sub}</p>
            <ul className="mt-8 space-y-3 text-[15px] text-pearl/85">
              {["Opérateurs certifiés (CTA)", "Prix total écrit avant engagement", "Demande gratuite, sans paiement"].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="text-champagne">✓</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="lx-card bg-night-2/90 p-6 backdrop-blur-xl sm:p-9"><LeadForm prefill={l.prefill} /></div>
        </div>
      </section>
      <HowItWorks />
    </main>
  );
}
