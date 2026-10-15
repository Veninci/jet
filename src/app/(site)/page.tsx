import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SearchBox } from "@/components/SearchBox";
import { Faq } from "@/components/Faq";
import { FlightCard } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { DemoBanner } from "@/components/DemoBanner";
import { Photo } from "@/components/Photo";
import { HeroJet } from "@/components/jet/HeroJet";
import { GlassStory } from "@/components/glass/GlassStory";
import { HomeMotion } from "@/components/motion/HomeMotion";
import { ScrubWords, Split } from "@/components/motion/Split";
import { searchPublic } from "@/connectors/registry";
import { routePages } from "@/content/routes";
import { photoForCity } from "@/content/media";
import { site } from "@/lib/config";

export const dynamic = "force-dynamic";

const steps = [
  { t: "Votre demande", d: "Un vol affiché ou votre propre trajet. Deux écrans, sans paiement." },
  { t: "La vérification", d: "Nous confirmons la disponibilité réelle et le prix directement auprès de l'opérateur." },
  { t: "La proposition", d: "Opérateur, appareil, horaires, prix total et conditions, par écrit." },
  { t: "La confirmation", d: "Le vol devient définitif après votre accord et la confirmation écrite de l'opérateur." },
];
const cities = ["Nice", "Genève", "Rome", "Ibiza", "Londres", "Olbia", "Milan", "Mykonos", "Cannes", "Saint-Tropez"];

export default async function HomePage() {
  const now = new Date();
  const { legs } = await searchPublic({ earliest: now, latest: new Date(now.getTime() + 30 * 86_400_000) });
  const featured = legs.slice(0, 8);
  const hasDemo = featured.some((l) => l.isDemo);
  const word = site.name;

  return (
    <main>
      <HomeMotion />
      <SiteHeader />

      {/* ---------- Hero : ciel d'aube, logotype monumental, jet 3D ---------- */}
      <section id="hero" className="sky relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden">
        <div data-hero-dusk="" aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#3d4a6b] via-[#8a7f95] to-[#d9a98b] opacity-0" />
        <HeroJet className="absolute inset-0 -z-0" />
        <div className="wrap relative z-10 flex flex-1 flex-col justify-between pt-28 pb-8 sm:pb-10">
          <div data-hero-copy="" className="ml-auto max-w-md text-right">
            <h1 className="t-display text-[44px] sm:text-[63px]">
              <span data-hero-line="" className="block overflow-hidden"><span className="block">Le jet privé,</span></span>
              <span data-hero-line="" className="block overflow-hidden"><span className="block">au prix du vide.</span></span>
            </h1>
            <p data-hero-fade="" className="t-body mt-5 ml-auto max-w-sm text-ink/70">
              Quand un jet doit voler à vide, son opérateur le propose à prix réduit. Nous vous le trouvons.
            </p>
          </div>
          <div>
            <p aria-hidden="true" className="t-hero -ml-[0.04em] flex overflow-hidden pb-[0.04em] text-[29vw] sm:text-[min(24vw,300px)]">
              {word.split("").map((ch, i) => (
                <span key={i} data-hero-letter-out="" className="inline-block"><span data-hero-letter="" className="inline-block">{ch}</span></span>
              ))}
              <sup className="mt-[0.1em] text-[0.12em] font-normal">®</sup>
            </p>
            <div data-hero-search="" className="mt-4"><div data-hero-fade=""><SearchBox /></div></div>
          </div>
        </div>
      </section>

      {/* ---------- Empty Legs : défilement horizontal ---------- */}
      {featured.length > 0 && (
        <section data-legs="" className="relative overflow-hidden bg-white py-20 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0">
          <div className="wrap">
            {hasDemo && <DemoBanner />}
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <Split as="h2" className="t-display text-[52px] sm:text-[63px]" text={"Empty Legs\nà saisir."} />
              <div data-reveal="" className="max-w-sm">
                <p className="t-body text-ash">Publiés quelques jours avant le départ, vérifiés auprès des opérateurs. Les meilleurs partent vite.</p>
                <Link href="/vols" className="pill-line mt-5">Tous les vols</Link>
              </div>
            </div>
          </div>
          <div className="no-scrollbar mt-12 overflow-x-auto lg:overflow-visible">
            <div data-legs-track="" className="flex w-max gap-6 px-5 sm:px-8 lg:pl-[max(32px,calc((100vw-1200px)/2+32px))]">
              {featured.map((l, i) => (
                <div key={l.key} className="w-[82vw] max-w-[380px] shrink-0 sm:w-[380px]"><FlightCard leg={l} priority={i < 2} /></div>
              ))}
            </div>
          </div>
          <div className="wrap mt-10 hidden lg:block"><div className="h-px bg-pebble"><div data-legs-progress="" className="h-px origin-left scale-x-0 bg-ink" /></div></div>
        </section>
      )}

      {/* ---------- Histoire en verre (moteur Premium 3D Glass) ---------- */}
      <GlassStory />

      {/* ---------- Manifeste ---------- */}
      <section className="bg-white py-28 sm:py-40">
        <div className="wrap">
          <ScrubWords className="t-display max-w-5xl text-[37px] sm:text-[63px]"
            text="Chaque jet repositionné vole de toute façon. Nous transformons ce trajet à vide en votre prochain voyage — avec le même équipage, le même opérateur certifié, à prix réduit." />
        </div>
      </section>

      {/* ---------- Vol sur mesure (carte argile, une seule par page) + étapes ---------- */}
      <section id="fonctionnement" className="bg-white pb-28 sm:pb-40">
        <div className="wrap grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div data-clay="" className="flex flex-col justify-between bg-clay px-8 py-12 text-white sm:px-[59px] sm:py-[53px]">
            <div>
              <p className="text-[17px] text-white/80">Vol sur mesure</p>
              <h2 className="t-heading mt-6 text-[52px] tracking-[-0.03em]">Votre trajet n&apos;est pas affiché ?</h2>
              <p className="t-body mt-6 max-w-md text-white/90">
                La plupart des Empty Legs ne sont jamais publiés en ligne. Décrivez votre vol : nous interrogeons directement
                les opérateurs, aéroports proches compris.
              </p>
            </div>
            <Link href="/demande" className="pill-ghost mt-12 self-start">Décrire mon vol</Link>
          </div>
          <div data-steps="" className="relative">
            <Split as="h2" className="t-heading text-[37px] sm:text-[52px]" text={"Quatre étapes.\nAucune surprise."} />
            <div className="relative mt-10">
              <span aria-hidden className="absolute top-0 bottom-0 left-[15px] w-px bg-pebble" />
              <span aria-hidden data-steps-line="" className="absolute top-0 bottom-0 left-[15px] w-px origin-top bg-ink" />
              <ol className="space-y-10">
                {steps.map((s, i) => (
                  <li key={s.t} data-step="" className="group relative grid grid-cols-[32px_1fr] gap-6">
                    <span className="relative z-10 grid size-8 place-items-center rounded-full border border-pebble bg-white text-[15px] font-bold transition duration-500 group-[.is-active]:border-ink group-[.is-active]:bg-ink group-[.is-active]:text-white">{i + 1}</span>
                    <div className="border-t hair pt-4">
                      <h3 className="t-heading text-[23px]">{s.t}</h3>
                      <p className="t-body mt-2 text-ash">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Destinations (bande sombre) ---------- */}
      <section className="overflow-hidden bg-deck py-24 text-white sm:py-32">
        <div className="wrap flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Split as="h2" className="t-display text-[52px] sm:text-[63px]" text={"Les routes\nles plus prisées."} />
          <p data-reveal="" className="t-body max-w-sm text-white/70">Paris, la Côte d&apos;Azur, les Alpes, l&apos;Italie : les liaisons où les repositionnements sont les plus fréquents.</p>
        </div>
        <div className="wrap mt-14 grid gap-6 md:grid-cols-3">
          {routePages.map((r, i) => (
            <Link key={r.slug} href={`/empty-leg/${r.slug}`} className={`group block ${i === 1 ? "md:mt-24" : ""}`}>
              <div data-clip="" className="relative aspect-[3/4] overflow-hidden">
                <Photo photo={photoForCity(r.searchTo)} />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-white/15 pt-4">
                <h3 className="t-heading text-[30px]">{r.navLabel.replace("Jet privé ", "").replace("Empty Leg ", "")}</h3>
                <span className="text-[17px] text-white/60 transition group-hover:translate-x-1 group-hover:text-white">{r.facts[0]?.value} →</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-24 flex overflow-hidden whitespace-nowrap" aria-hidden="true">
          <div className="marquee flex shrink-0 gap-12 pr-12 text-[17vw] leading-none font-bold tracking-[-0.04em] text-white/[0.07] sm:text-[131px]">
            {[...cities, ...cities].map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </div>
      </section>

      <Faq />

      {/* ---------- Demande ---------- */}
      <section id="demande" className="bg-white pb-28 sm:pb-36">
        <div className="wrap grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Split as="h2" className="t-display text-[52px] sm:text-[63px]" text={"Prêt à\nembarquer ?"} />
            <p data-reveal="" className="t-body mt-6 max-w-sm text-ash">Décrivez votre vol. Un conseiller vérifie les options auprès des opérateurs et vous recontacte.</p>
          </div>
          <div data-reveal="" className="border-t hair pt-8"><LeadForm /></div>
        </div>
      </section>

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
