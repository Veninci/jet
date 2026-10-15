import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SearchBox } from "@/components/SearchBox";
import { HowItWorks } from "@/components/HowItWorks";
import { Faq } from "@/components/Faq";
import { FlightCard } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { DemoBanner } from "@/components/DemoBanner";
import { Photo } from "@/components/Photo";
import { searchPublic } from "@/connectors/registry";
import { routePages } from "@/content/routes";
import { media, photoForCity } from "@/content/media";
import { site } from "@/lib/config";

export const dynamic = "force-dynamic";

const promises = [
  { t: "Opérateurs certifiés", d: "Uniquement des compagnies titulaires d'un certificat de transporteur aérien." },
  { t: "Prix transparents", d: "Prix total et conditions écrits avant tout engagement." },
  { t: "Un conseiller dédié", d: "Un interlocuteur unique, de la demande au décollage." },
];

export default async function HomePage() {
  const now = new Date();
  const { legs } = await searchPublic({ earliest: now, latest: new Date(now.getTime() + 30 * 86_400_000) });
  const featured = legs.slice(0, 6);
  const hasDemo = featured.some((l) => l.isDemo);

  return (
    <main>
      {/* Hero plein écran */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <Photo photo={media.heroJet} priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-night" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <SiteHeader overlay />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pt-32 pb-10 sm:px-8 sm:pb-16">
          <p className="lx-eyebrow lx-rise">Empty Legs · Jets privés</p>
          <h1 className="font-display lx-rise-2 mt-6 max-w-4xl text-[56px] leading-[0.95] font-light sm:text-[88px] lg:text-[104px]">
            Le luxe du jet privé,<br /><em className="text-champagne-soft">plus accessible.</em>
          </h1>
          <p className="lx-rise-3 mt-6 max-w-lg text-[17px] leading-relaxed text-pearl/80">
            Quand un jet doit repartir à vide, son opérateur le propose à prix réduit. Nous trouvons ces vols et confirmons
            tout avec l&apos;opérateur.
          </p>
          <div className="lx-rise-3 mt-10 max-w-6xl"><SearchBox /></div>
        </div>
      </section>

      {/* Empty Legs du moment */}
      {featured.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            {hasDemo && <DemoBanner />}
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="lx-eyebrow">En ce moment</p>
                <h2 className="font-display mt-4 text-5xl font-light sm:text-6xl">Empty Legs à saisir</h2>
              </div>
              <Link href="/vols" className="hidden text-[13px] tracking-wide text-smoke underline-offset-8 hover:text-pearl hover:underline sm:inline">Tous les vols →</Link>
            </div>
          </div>
          <div className="no-scrollbar mx-auto mt-10 flex max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-8 lg:grid-cols-3">
            {featured.map((l, i) => (
              <div key={l.key} className="w-[85%] shrink-0 snap-start sm:w-auto"><FlightCard leg={l} priority={i < 3} /></div>
            ))}
          </div>
          <div className="mt-8 px-5 sm:hidden"><Link href="/vols" className="lx-btn-ghost w-full">Voir tous les vols</Link></div>
        </section>
      )}

      {/* Promesse */}
      <section className="border-y hairline bg-night-2">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {promises.map((p) => (
            <div key={p.t} className="py-10 md:px-10 md:first:pl-0">
              <h3 className="font-display text-3xl font-light">{p.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-smoke">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />

      {/* Destinations */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
        <p className="lx-eyebrow">Destinations</p>
        <h2 className="font-display mt-4 text-5xl font-light sm:text-6xl">Les routes les plus prisées</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {routePages.map((r, i) => (
            <Link key={r.slug} href={`/empty-leg/${r.slug}`} className={`group relative isolate block overflow-hidden rounded-3xl ${i === 0 ? "aspect-[4/5] md:row-span-2 md:aspect-auto" : "aspect-[16/10]"}`}>
              <Photo photo={photoForCity(r.searchTo)} className="transition duration-[1.4s] ease-[var(--ease-lux)] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-6 bottom-6">
                <p className="text-[11px] tracking-[0.24em] text-champagne uppercase">{r.facts[0]?.value}</p>
                <h3 className="font-display mt-2 text-4xl font-light">{r.navLabel.replace("Jet privé ", "").replace("Empty Leg ", "")}</h3>
                <span className="mt-3 inline-block text-[13px] text-pearl/80 transition group-hover:translate-x-1">Découvrir →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Vol sur mesure */}
      <section id="demande" className="relative isolate overflow-hidden">
        <Photo photo={media.window} className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/95 to-night/70" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="lx-eyebrow">Vol sur mesure</p>
            <h2 className="font-display mt-5 text-5xl leading-[1.02] font-light sm:text-6xl">Votre trajet n&apos;est pas affiché ?</h2>
            <p className="mt-6 max-w-md leading-relaxed text-smoke">
              La plupart des Empty Legs sont publiés quelques jours seulement avant le départ, et beaucoup ne le sont jamais
              en ligne. Dites-nous où vous allez : nous interrogeons directement les opérateurs.
            </p>
          </div>
          <div className="lx-card bg-night-2/80 p-6 backdrop-blur-xl sm:p-10"><LeadForm /></div>
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
