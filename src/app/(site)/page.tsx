import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroArt } from "@/components/HeroArt";
import { SearchBox } from "@/components/SearchBox";
import { HowItWorks } from "@/components/HowItWorks";
import { Faq } from "@/components/Faq";
import { FlightCard } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { DemoBanner } from "@/components/DemoBanner";
import { searchPublic } from "@/connectors/registry";
import { site } from "@/lib/config";

export const dynamic = "force-dynamic";

const advantages = [
  { t: "Opérateurs certifiés", d: "Uniquement des compagnies titulaires d'un certificat de transporteur aérien, identifiées dans chaque proposition." },
  { t: "Transparence", d: "Prix total, conditions d'annulation et contraintes d'horaire annoncés avant tout engagement." },
  { t: "Un interlocuteur", d: "Un conseiller suit votre demande, de la recherche jusqu'au jour du vol." },
  { t: "Alternatives étudiées", d: "Aéroports proches, dates voisines, affrètement classique si aucun Empty Leg ne convient." },
];

export default async function HomePage() {
  const now = new Date();
  const { legs } = await searchPublic({ earliest: now, latest: new Date(now.getTime() + 30 * 86_400_000) });
  const featured = legs.slice(0, 3);
  const hasDemo = featured.some((l) => l.isDemo);

  return (
    <main>
      <section className="relative isolate flex min-h-[92svh] flex-col overflow-hidden bg-ink">
        <HeroArt />
        <SiteHeader tone="dark" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-14 sm:px-6 sm:pb-20">
          <p className="eyebrow text-gold">Empty Legs · Jets privés</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.02] text-ivory sm:text-7xl">
            Le luxe du jet privé, à un prix plus accessible
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
            Lorsqu&apos;un jet doit se repositionner à vide, son opérateur peut proposer ce trajet à tarif réduit. Nous
            identifions ces vols et vérifions leur disponibilité pour vous.
          </p>
          <div className="mt-10 max-w-5xl"><SearchBox /></div>
          <p className="mt-4 text-xs text-ivory/60">Demande gratuite et sans engagement · Disponibilité confirmée par un conseiller</p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          {hasDemo && <DemoBanner />}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Opportunités</p>
              <h2 className="font-display mt-3 text-4xl">Empty Legs à venir</h2>
            </div>
            <Link href="/vols" className="text-sm underline underline-offset-4">Tout voir</Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => <FlightCard key={l.key} leg={l} />)}
          </div>
        </section>
      )}

      <HowItWorks />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow">Pourquoi nous</p>
        <h2 className="font-display mt-3 max-w-xl text-4xl">Un service de courtage, pas un comparateur</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {advantages.map((a) => (
            <div key={a.t} className="bg-ivory p-8">
              <h3 className="text-lg font-medium">{a.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demande" className="bg-sand/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Demande personnalisée</p>
            <h2 className="font-display mt-3 text-4xl">Dites-nous où vous allez</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Pas de vol affiché sur votre trajet ? La plupart des Empty Legs sont publiés quelques jours seulement avant le
              départ. Laissez votre demande : un conseiller recherche les options compatibles et vous recontacte.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white p-5 sm:p-8"><LeadForm /></div>
        </div>
      </section>

      <Faq />

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        url: site.url,
        ...(site.email ? { email: site.email } : {}),
        ...(site.phone ? { telephone: site.phone } : {}),
      }} />
    </main>
  );
}
