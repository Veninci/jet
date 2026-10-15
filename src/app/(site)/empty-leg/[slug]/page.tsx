import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { FlightCard } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { Faq } from "@/components/Faq";
import { getRoutePage, routePages } from "@/content/routes";
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
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-mist"><Link href="/">Accueil</Link> / <span>{r.navLabel}</span></nav>
        <h1 className="font-display mt-4 max-w-3xl text-4xl sm:text-5xl">{r.h1}</h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">{r.intro}</p>
        <dl className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          {r.facts.map((f) => (
            <div key={f.label} className="rounded-lg border border-line bg-white p-4"><dt className="label">{f.label}</dt><dd className="font-display text-2xl">{f.value}</dd></div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-mist">Ordres de grandeur, variables selon l&apos;appareil, les vents et les procédures.</p>

        <section className="mt-14">
          <h2 className="font-display text-3xl">Empty Legs {r.from.city} – {r.to.city} à venir</h2>
          {legs.length ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{legs.slice(0, 6).map((l) => <FlightCard key={l.key} leg={l} />)}</div>
          ) : (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Aucun vol n&apos;est publié sur cette route en ce moment. Les Empty Legs apparaissent souvent quelques jours
              seulement avant le départ : déposez votre demande ci-dessous, nous vous recontactons dès qu&apos;une option se présente.
            </p>
          )}
        </section>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            {r.sections.map((s) => (
              <section key={s.h2}><h2 className="font-display text-3xl">{s.h2}</h2><p className="mt-3 leading-relaxed text-ink-soft">{s.body}</p></section>
            ))}
            <section>
              <h2 className="font-display text-3xl">Aéroports desservis</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 text-sm">
                <div><h3 className="font-medium">{r.from.city}</h3><ul className="mt-2 space-y-1 text-ink-soft">{r.from.airports.map((a) => <li key={a}>{a}</li>)}</ul></div>
                <div><h3 className="font-medium">{r.to.city}</h3><ul className="mt-2 space-y-1 text-ink-soft">{r.to.airports.map((a) => <li key={a}>{a}</li>)}</ul></div>
              </div>
            </section>
          </div>
          <aside id="demande" className="h-fit rounded-lg border border-line bg-white p-5 sm:p-8">
            <h2 className="font-display text-3xl">Demande {r.from.city} – {r.to.city}</h2>
            <div className="mt-6"><LeadForm prefill={{ departure: r.searchFrom, arrival: r.searchTo }} /></div>
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
