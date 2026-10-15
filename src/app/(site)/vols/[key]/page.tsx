import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { DemoPill, PriceTag, StatusPill } from "@/components/FlightCard";
import { DemoBanner } from "@/components/DemoBanner";
import { ViewTracker } from "@/components/ViewTracker";
import { Photo } from "@/components/Photo";
import { getPublicLeg } from "@/connectors/registry";
import { photoForCity } from "@/content/media";
import { formatDate, formatTime, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const leg = await getPublicLeg(decodeURIComponent((await params).key));
  if (!leg) return { title: "Vol introuvable", robots: { index: false } };
  // Fiches éphémères : non indexées. Le SEO repose sur les pages de destinations.
  return { title: `Empty Leg ${leg.from.city} – ${leg.to.city}, ${formatDate(leg.departureStart)}`, robots: { index: false, follow: true } };
}

export default async function FlightPage({ params }: Props) {
  const key = decodeURIComponent((await params).key);
  const leg = await getPublicLeg(key);
  if (!leg) notFound();
  const book = `/reserver/${encodeURIComponent(leg.key)}`;
  const facts = [
    ["Départ", `${leg.from.airport}${leg.from.icao ? ` · ${leg.from.icao}` : ""}`],
    ["Arrivée", `${leg.to.airport}${leg.to.icao ? ` · ${leg.to.icao}` : ""}`],
    ["Date", formatDate(leg.departureStart)],
    ["Créneau de départ", `${formatTime(leg.departureStart)} – ${formatTime(leg.departureEnd)}, heure de Paris`],
    ...(leg.maxPassengers ? [["Capacité", `Jusqu'à ${leg.maxPassengers} passagers`]] : []),
    ...(leg.aircraftType || leg.aircraftCategory ? [["Appareil", [leg.aircraftCategory, leg.aircraftType].filter(Boolean).join(" · ")]] : []),
    ["Dernière vérification", timeAgo(leg.lastVerifiedAt)],
  ];

  return (
    <main className="pb-28 lg:pb-0">
      <ViewTracker event="view_flight" params={{ key: leg.key }} />
      <section className="relative isolate h-[62svh] min-h-[420px] overflow-hidden">
        <Photo photo={photoForCity(leg.to.city)} priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-night" />
        <SiteHeader overlay />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 sm:px-8">
          <div className="flex flex-wrap gap-2"><StatusPill tone="glass" />{leg.isDemo && <DemoPill />}</div>
          <h1 className="font-display mt-5 text-6xl leading-[0.95] font-light sm:text-8xl">
            {leg.from.city} <span className="text-champagne">—</span><br className="sm:hidden" /> {leg.to.city}
          </h1>
          <p className="mt-4 text-[13px] tracking-[0.22em] text-pearl/80 uppercase">{formatDate(leg.departureStart)} · {formatTime(leg.departureStart)}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section>
          {leg.isDemo && <DemoBanner />}
          <Link href="/vols" className="text-[13px] text-smoke underline-offset-4 hover:underline">← Tous les vols</Link>
          <dl className="mt-8 grid gap-x-10 border-t hairline sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="border-b hairline py-5"><dt className="lx-label mb-1">{k}</dt><dd className="text-[16px]">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-smoke">
            <h2 className="font-display text-3xl font-light text-pearl">Ce qu&apos;il faut savoir</h2>
            {leg.conditions && <p>{leg.conditions}</p>}
            <ul className="space-y-3">
              <li className="flex gap-3"><span className="text-champagne">—</span>Un Empty Leg dépend de la mission principale de l&apos;avion : horaire, itinéraire ou disponibilité peuvent changer jusqu&apos;au départ.</li>
              <li className="flex gap-3"><span className="text-champagne">—</span>Le prix concerne l&apos;appareil entier. Le montant total (taxes, frais d&apos;aéroport) figure dans la proposition écrite.</li>
              <li className="flex gap-3"><span className="text-champagne">—</span>L&apos;opérateur aérien est nommé dans la proposition, avant tout engagement.</li>
            </ul>
            {leg.attribution && <p className="text-[11px] text-ash">{leg.attribution}</p>}
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="lx-card sticky top-28 p-7">
            <PriceTag leg={leg} size="lg" />
            <p className="mt-2 text-[12px] text-ash">pour l&apos;appareil entier{leg.maxPassengers ? `, jusqu'à ${leg.maxPassengers} passagers` : ""}</p>
            <Link href={book} className="lx-btn mt-7 w-full">Réserver ce vol</Link>
            <p className="mt-4 text-center text-[12px] text-ash">2 étapes · aucun paiement maintenant</p>
          </div>
        </aside>
      </div>

      {/* Barre de réservation mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-night/90 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <PriceTag leg={leg} />
          <Link href={book} className="lx-btn px-6">Réserver</Link>
        </div>
      </div>
    </main>
  );
}
