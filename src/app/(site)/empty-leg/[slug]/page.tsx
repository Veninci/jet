import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { FlightCard } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { Faq } from "@/components/Faq";
import { Photo } from "@/components/Photo";
import { Split } from "@/components/motion/Split";
import { getRoutePage, routePages } from "@/content/routes";
import { photoForCity } from "@/content/media";
import { searchPublic } from "@/connectors/registry";
import { site } from "@/lib/config";

export const revalidate = 600;

export function generateStaticParams() {
  return routePages.map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRoutePage((await params).slug);
  if (!r) return {};
  return { title: r.title, description: r.metaDescription, alternates: { canonical: `/empty-leg/${r.slug}` } };
}

export default async function RoutePage({ params }: Props) {
  const r = getRoutePage((await params).slug);
  if (!r) notFound();
  const now = new Date();
  const { legs } = await searchPublic({ from: { text: r.searchFrom }, to: { text: r.searchTo }, earliest: now, latest: new Date(now.getTime() + 60 * 86_400_000) });

  return (
    <main>
      <SiteHeader />
      <section className="sky pt-36 pb-14">
        <div className="wrap">
          <nav aria-label="Fil d'Ariane" className="text-[15px] text-ink/60"><Link href="/" className="hover:underline">Accueil</Link> / {r.navLabel}</nav>
          <Split as="h1" className="t-display mt-6 max-w-5xl text-[44px] sm:text-[80px]" text={r.h1} />
          <dl data-reveal-group="" className="mt-12 grid max-w-3xl grid-cols-3 gap-6">
            {r.facts.map((f) => (
              <div key={f.label} data-reveal-item="" className="border-t border-ink/20 pt-4"><dt className="text-[15px] text-ink/60">{f.label}</dt><dd className="t-heading mt-2 text-[23px] sm:text-[30px]">{f.value}</dd></div>
            ))}
          </dl>
        </div>
      </section>
      <div className="wrap">
        <div data-clip="" className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]"><Photo photo={photoForCity(r.searchTo)} priority sizes="100vw" /></div>
        <p className="mt-3 text-[13px] text-ash">Durées et distances : ordres de grandeur, variables selon l&apos;appareil et les conditions de vol.</p>
      </div>

      <article className="wrap py-20">
        <p data-reveal="" className="t-heading max-w-4xl text-[30px] leading-[1.25] sm:text-[37px]">{r.intro}</p>

        <section className="mt-24">
          <Split as="h2" className="t-display text-[44px] sm:text-[52px]" text={`Vols ${r.from.city} – ${r.to.city}\nà venir.`} />
          {legs.length ? (
            <div data-reveal-group="" className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {legs.slice(0, 6).map((l) => <div key={l.key} data-reveal-item=""><FlightCard leg={l} /></div>)}
            </div>
          ) : (
            <p className="t-body mt-6 max-w-2xl text-ash">Aucun vol publié en ce moment sur cette route. Les Empty Legs apparaissent souvent quelques jours seulement avant le départ : laissez votre demande ci-dessous.</p>
          )}
        </section>

        <div className="mt-24 grid gap-16 lg:grid-cols-2">
          {r.sections.map((s) => (
            <section key={s.h2} data-reveal="" className="border-t hair pt-6">
              <h2 className="t-heading text-[30px]">{s.h2}</h2>
              <p className="t-body mt-4 text-ash">{s.body}</p>
            </section>
          ))}
          <section data-reveal="" className="border-t hair pt-6">
            <h2 className="t-heading text-[30px]">Aéroports</h2>
            <div className="mt-4 grid gap-8 sm:grid-cols-2">
              <div><h3 className="text-[15px] text-ash">{r.from.city}</h3><ul className="t-body mt-2">{r.from.airports.map((a) => <li key={a}>{a}</li>)}</ul></div>
              <div><h3 className="text-[15px] text-ash">{r.to.city}</h3><ul className="t-body mt-2">{r.to.airports.map((a) => <li key={a}>{a}</li>)}</ul></div>
            </div>
          </section>
        </div>
      </article>

      <section id="demande" className="bg-deck py-24 text-white">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Split as="h2" className="t-display text-[44px] sm:text-[52px]" text={`${r.from.city} – ${r.to.city},\nsur demande.`} />
          <div className="bg-white p-6 text-ink sm:p-10"><LeadForm prefill={{ departure: r.searchFrom, arrival: r.searchTo }} /></div>
        </div>
      </section>
      <Faq />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
          { "@type": "ListItem", position: 2, name: r.navLabel, item: `${site.url}/empty-leg/${r.slug}` },
        ],
      }} />
    </main>
  );
}
