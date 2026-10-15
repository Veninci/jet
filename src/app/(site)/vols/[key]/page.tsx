import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { DemoPill, PriceTag, StatusPill } from "@/components/FlightCard";
import { DemoBanner } from "@/components/DemoBanner";
import { ViewTracker } from "@/components/ViewTracker";
import { Photo } from "@/components/Photo";
import { Split } from "@/components/motion/Split";
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
      <SiteHeader />
      <section className="sky pt-36 pb-14">
        <div className="wrap">
          <Link href="/vols" className="text-[17px] text-ink/70 underline-offset-4 hover:underline">← Tous les vols</Link>
          <div className="mt-8 flex flex-wrap items-center gap-3"><StatusPill />{leg.isDemo && <DemoPill />}</div>
          <Split as="h1" className="t-display mt-5 text-[52px] sm:text-[104px]" text={`${leg.from.city} →\n${leg.to.city}.`} />
          <p data-reveal="" className="mt-6 text-[20px]">{formatDate(leg.departureStart)} · {formatTime(leg.departureStart)}–{formatTime(leg.departureEnd)}</p>
        </div>
      </section>
      <div className="wrap">
        <div data-clip="" className="relative -mt-2 aspect-[16/9] overflow-hidden sm:aspect-[21/9]"><Photo photo={photoForCity(leg.to.city)} priority sizes="100vw" /></div>
      </div>

      <div className="wrap grid gap-14 py-16 lg:grid-cols-[1.3fr_0.7fr]">
        <section>
          {leg.isDemo && <DemoBanner />}
          <dl data-reveal-group="" className="grid gap-x-12 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} data-reveal-item="" className="border-t hair py-5"><dt className="text-[15px] text-ash">{k}</dt><dd className="mt-1 text-[20px]">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-14">
            <h2 className="t-heading text-[37px]">Ce qu&apos;il faut savoir.</h2>
            {leg.conditions && <p className="t-body mt-5 text-ash">{leg.conditions}</p>}
            <ul data-reveal-group="" className="t-body mt-6 space-y-4">
              {[
                "Un Empty Leg dépend de la mission principale de l'avion : horaire, itinéraire ou disponibilité peuvent changer jusqu'au départ.",
                "Le prix concerne l'appareil entier. Le montant total (taxes, frais d'aéroport) figure dans la proposition écrite.",
                "L'opérateur aérien est nommé dans la proposition, avant tout engagement.",
              ].map((t) => <li key={t} data-reveal-item="" className="border-t hair pt-4 text-ink/80">{t}</li>)}
            </ul>
            {leg.attribution && <p className="mt-6 text-[13px] text-ash">{leg.attribution}</p>}
          </div>
        </section>
        <aside className="hidden lg:block">
          <div className="sticky top-28 bg-ink p-8 text-white">
            <PriceTag leg={leg} size="lg" tone="white" />
            <p className="mt-2 text-[15px] text-white/60">pour l&apos;appareil entier{leg.maxPassengers ? `, jusqu'à ${leg.maxPassengers} passagers` : ""}</p>
            <Link href={book} className="pill mt-8 w-full bg-white text-ink">Réserver ce vol</Link>
            <p className="mt-4 text-center text-[15px] text-white/60">2 écrans · aucun paiement maintenant</p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t hair bg-white/90 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <PriceTag leg={leg} />
          <Link href={book} className="pill">Réserver</Link>
        </div>
      </div>
    </main>
  );
}
