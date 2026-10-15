import Link from "next/link";
import type { PublicLeg } from "@/connectors/registry";
import { formatDate, formatMoney, formatTime, timeAgo } from "@/lib/format";

function Price({ leg }: { leg: PublicLeg }) {
  if (!leg.price) return <span className="text-sm text-ink-soft">Prix sur demande</span>;
  return (
    <span>
      <span className="text-xs text-mist">{leg.price.kind === "CONFIRMED" ? "Prix opérateur" : "À partir de, indicatif"}</span>
      <span className="font-display block text-2xl text-ink">{formatMoney(leg.price.amount, leg.price.currency)}</span>
    </span>
  );
}

export function StatusPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900 ring-1 ring-amber-200">
      <span className="size-1.5 rounded-full bg-amber-500" /> Disponibilité à confirmer
    </span>
  );
}

export function DemoPill() {
  return <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800 ring-1 ring-red-200">FICTIF — démo</span>;
}

export function FlightCard({ leg }: { leg: PublicLeg }) {
  const href = `/vols/${encodeURIComponent(leg.key)}`;
  return (
    <article className="group flex flex-col rounded-lg border border-line bg-white p-5 transition hover:border-gold/60 hover:shadow-[0_10px_30px_rgba(15,26,42,0.07)]">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill />
        {leg.isDemo && <DemoPill />}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display truncate text-2xl leading-tight">{leg.from.city}</p>
          <p className="truncate text-xs text-mist">{leg.from.airport}</p>
        </div>
        <span aria-hidden className="mt-2 text-gold">→</span>
        <div className="min-w-0 text-right">
          <p className="font-display truncate text-2xl leading-tight">{leg.to.city}</p>
          <p className="truncate text-xs text-mist">{leg.to.airport}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-ink-soft">
        <dt className="sr-only">Date</dt>
        <dd className="col-span-2">{formatDate(leg.departureStart)} · {formatTime(leg.departureStart)}–{formatTime(leg.departureEnd)}</dd>
        {leg.maxPassengers && (<><dt className="sr-only">Passagers</dt><dd>Jusqu&apos;à {leg.maxPassengers} passagers</dd></>)}
        {(leg.aircraftType || leg.aircraftCategory) && (<><dt className="sr-only">Appareil</dt><dd className="truncate text-right">{leg.aircraftType ?? leg.aircraftCategory}</dd></>)}
      </dl>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <Price leg={leg} />
        <Link href={href} className="btn-primary px-4 py-2.5">Demander ce vol</Link>
      </div>
      <p className="mt-3 text-[11px] text-mist">Vérifié {timeAgo(leg.lastVerifiedAt)}</p>
    </article>
  );
}

export function FlightRow({ leg }: { leg: PublicLeg }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line py-4 sm:grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr_auto]">
      <div className="min-w-0">
        <p className="truncate font-medium">{leg.from.city} → {leg.to.city} {leg.isDemo && <DemoPill />}</p>
        <p className="truncate text-xs text-mist">{leg.from.airport} – {leg.to.airport}</p>
      </div>
      <p className="hidden text-sm text-ink-soft sm:block">{formatDate(leg.departureStart)}, {formatTime(leg.departureStart)}</p>
      <p className="hidden text-sm text-ink-soft sm:block">{leg.maxPassengers ? `${leg.maxPassengers} pax` : "—"}</p>
      <p className="hidden text-sm sm:block">{leg.price ? formatMoney(leg.price.amount, leg.price.currency) : "Sur demande"}</p>
      <Link href={`/vols/${encodeURIComponent(leg.key)}`} className="btn-ghost px-3 py-2 text-xs">Demander</Link>
    </li>
  );
}
