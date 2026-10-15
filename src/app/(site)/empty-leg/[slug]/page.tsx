import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { FlightCard } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { Faq } from "@/components/Faq";
import { Photo } from "@/components/Photo";
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
      <section className="relative isolate flex min-h-[78svh] flex-col overflow-hidden">
        <Photo photo={photoForCity(r.searchTo)} priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-night" />
        <SiteHeader overlay />
        <div className="relative mx-auto mt-auto w-full max-w-7xl px-5 pb-14 sm:px-8">
          <nav aria-label="Fil d'Ariane" className="text-[12px] text-pearl/70"><Link href="/">Accueil</Link> / {r.navLabel}</nav>
          <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[0.98] font-light sm:text-7xl">{r.h1}</h1>
          <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
            {r.facts.map((f) => (<div key={f.label}><dt className="lx-label mb-1">{f.label}</dt><dd className="font-display text-2xl font-light sm:text-3xl">{f.value}</dd></div>))}
          </dl>
        </div>
      </section>

      <article className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="max-w-3xl text-xl leading-relaxed text-pearl/85">{r.intro}</p>
        <p className="mt-3 text-[11px] text-ash">Durées et distances : ordres de grandeur, variables selon l&apos;appareil et les conditions de vol.</p>

        <section className="mt-16">
          <h2 className="font-display text-4xl font-light">Vols {r.from.city} – {r.to.city} à venir</h2>
          {legs.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{legs.slice(0, 6).map((l) => <FlightCard key={l.key} leg={l} />)}</div>
          ) : (
            <p className="mt-4 max-w-2xl leading-relaxed text-smoke">Aucun vol publié en ce moment sur cette route. Les Empty Legs apparaissent souvent quelques jours seulement avant le départ : laissez votre demande ci-dessous.</p>
          )}
        </section>

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-12">
            {r.sections.map((s) => (
              <section key={s.h2}><h2 className="font-display text-4xl font-light">{s.h2}</h2><p className="mt-4 leading-relaxed text-smoke">{s.body}</p></section>
            ))}
            <section>
              <h2 className="font-display text-4xl font-light">Aéroports</h2>
              <div className="mt-6 grid gap-8 text-[15px] sm:grid-cols-2">
                <div><h3 className="lx-label">{r.from.city}</h3><ul className="space-y-2 text-smoke">{r.from.airports.map((a) => <li key={a}>{a}</li>)}</ul></div>
                <div><h3 className="lx-label">{r.to.city}</h3><ul className="space-y-2 text-smoke">{r.to.airports.map((a) => <li key={a}>{a}</li>)}</ul></div>
              </div>
            </section>
          </div>
          <aside id="demande" className="lx-card h-fit p-6 sm:p-9">
            <h2 className="font-display mb-8 text-3xl font-light">Demande {r.from.city} – {r.to.city}</h2>
            <LeadForm prefill={{ departure: r.searchFrom, arrival: r.searchTo }} />
          </aside>
        </div>
      </article>
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
