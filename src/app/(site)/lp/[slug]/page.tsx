import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { HowItWorks } from "@/components/HowItWorks";
import { getLanding, landings } from "@/content/landings";

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
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{l.headline}</h1>
          <p className="mt-4 leading-relaxed text-ink-soft">{l.sub}</p>
          <ul className="mt-6 space-y-2 text-sm text-ink-soft">
            <li>✓ Opérateurs titulaires d&apos;un certificat de transporteur aérien</li>
            <li>✓ Prix total et conditions annoncés avant engagement</li>
            <li>✓ Demande gratuite, sans paiement</li>
          </ul>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 sm:p-8"><LeadForm prefill={l.prefill} /></div>
      </section>
      <HowItWorks />
    </main>
  );
}
