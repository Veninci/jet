import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { DemoPill, StatusPill } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { DemoBanner } from "@/components/DemoBanner";
import { ViewTracker } from "@/components/ViewTracker";
import { getPublicLeg } from "@/connectors/registry";
import { formatDate, formatMoney, formatTime, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const leg = await getPublicLeg(decodeURIComponent((await params).key));
  if (!leg) return { title: "Vol introuvable", robots: { index: false } };
  // Fiches éphémères : non indexées (elles expirent en quelques jours). Le SEO repose sur les pages d'itinéraires.
  return {
    title: `Empty Leg ${leg.from.city} – ${leg.to.city}, ${formatDate(leg.departureStart)}`,
    robots: { index: false, follow: true },
  };
}

export default async function FlightPage({ params }: Props) {
  const key = decodeURIComponent((await params).key);
  const leg = await getPublicLeg(key);
  if (!leg) notFound();
  const label = `${leg.from.city} → ${leg.to.city}, ${formatDate(leg.departureStart)} (${formatTime(leg.departureStart)}–${formatTime(leg.departureEnd)})`;

  return (
    <main>
      <SiteHeader />
      <ViewTracker event="view_flight" params={{ key: leg.key }} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link href="/vols" className="text-sm text-ink-soft underline underline-offset-4">← Tous les vols</Link>
        {leg.isDemo && <div className="mt-6"><DemoBanner /></div>}
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="flex flex-wrap gap-2"><StatusPill />{leg.isDemo && <DemoPill />}</div>
            <h1 className="font-display mt-4 text-4xl sm:text-5xl">{leg.from.city} <span className="text-gold">→</span> {leg.to.city}</h1>
            <dl className="mt-8 grid gap-x-8 gap-y-5 border-y border-line py-6 sm:grid-cols-2">
              <div><dt className="label">Départ</dt><dd>{leg.from.airport}{leg.from.icao ? ` (${leg.from.icao})` : ""}</dd></div>
              <div><dt className="label">Arrivée</dt><dd>{leg.to.airport}{leg.to.icao ? ` (${leg.to.icao})` : ""}</dd></div>
              <div><dt className="label">Date</dt><dd>{formatDate(leg.departureStart)}</dd></div>
              <div><dt className="label">Créneau de départ</dt><dd>{formatTime(leg.departureStart)} – {formatTime(leg.departureEnd)} (heure de Paris)</dd></div>
              {leg.maxPassengers && <div><dt className="label">Capacité</dt><dd>Jusqu&apos;à {leg.maxPassengers} passagers</dd></div>}
              {(leg.aircraftType || leg.aircraftCategory) && <div><dt className="label">Appareil</dt><dd>{[leg.aircraftCategory, leg.aircraftType].filter(Boolean).join(" · ")}</dd></div>}
              <div>
                <dt className="label">Prix</dt>
                <dd>{leg.price ? <>{formatMoney(leg.price.amount, leg.price.currency)} <span className="text-xs text-mist">{leg.price.kind === "CONFIRMED" ? "prix communiqué par l'opérateur" : "indicatif, à confirmer"}</span></> : "Sur demande"}</dd>
              </div>
              <div><dt className="label">Dernière vérification</dt><dd>{timeAgo(leg.lastVerifiedAt)}</dd></div>
            </dl>
            <div className="mt-8 space-y-3 text-sm leading-relaxed text-ink-soft">
              <h2 className="text-base font-medium text-ink">Conditions importantes</h2>
              {leg.conditions && <p>{leg.conditions}</p>}
              <ul className="list-disc space-y-1 pl-5">
                <li>Un Empty Leg dépend de la mission principale de l&apos;appareil : horaire, itinéraire ou disponibilité peuvent changer jusqu&apos;au départ.</li>
                <li>Le prix final (taxes, frais d&apos;aéroport, éventuels services) est précisé dans la proposition écrite.</li>
                <li>L&apos;opérateur aérien est identifié dans la proposition, avant tout engagement de votre part.</li>
              </ul>
              {leg.attribution && <p className="text-xs text-mist">{leg.attribution}</p>}
            </div>
          </section>
          <aside className="h-fit rounded-lg border border-line bg-white p-5 sm:p-8 lg:sticky lg:top-6">
            <h2 className="font-display text-3xl">Demander ce vol</h2>
            <p className="mt-2 mb-6 text-sm text-ink-soft">Nous vérifions la disponibilité auprès de l&apos;opérateur et vous recontactons.</p>
            <LeadForm variant="offer" prefill={{
              departure: `${leg.from.city} (${leg.from.airport})`,
              arrival: `${leg.to.city} (${leg.to.airport})`,
              departureDate: leg.departureStart.toISOString().slice(0, 10),
              offerId: leg.key,
              offerLabel: label,
            }} />
          </aside>
        </div>
      </div>
    </main>
  );
}
