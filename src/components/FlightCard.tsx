import Link from "next/link";
import type { PublicLeg } from "@/connectors/registry";
import { formatDate, formatMoney, formatTime, timeAgo } from "@/lib/format";
import { photoForCity } from "@/content/media";
import { Photo } from "./Photo";

export function StatusPill({ tone = "dark" }: { tone?: "dark" | "glass" }) {
  return (
    <span className={`lx-chip ${tone === "glass" ? "bg-black/45 text-pearl backdrop-blur-md" : "bg-white/[0.06] text-smoke"}`}>
      <span className="size-1.5 rounded-full bg-champagne" /> Disponibilité à confirmer
    </span>
  );
}

export function DemoPill() {
  return <span className="lx-chip bg-red-500/80 font-semibold tracking-[0.12em] text-white uppercase">Fictif</span>;
}

export function PriceTag({ leg, size = "md" }: { leg: PublicLeg; size?: "md" | "lg" }) {
  if (!leg.price) return <span className="text-sm text-smoke">Prix sur demande</span>;
  return (
    <span className="flex flex-col leading-none">
      <span className="text-[10px] tracking-[0.2em] text-smoke uppercase">{leg.price.kind === "CONFIRMED" ? "Prix opérateur" : "Prix indicatif"}</span>
      <span className={`font-display mt-1.5 font-light text-pearl ${size === "lg" ? "text-5xl" : "text-[34px]"}`}>{formatMoney(leg.price.amount, leg.price.currency)}</span>
    </span>
  );
}

const code = (icao?: string, city?: string) => icao ?? city?.slice(0, 3).toUpperCase();

export function FlightCard({ leg, priority = false }: { leg: PublicLeg; priority?: boolean }) {
  const href = `/vols/${encodeURIComponent(leg.key)}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-night-2 transition duration-500 ease-[var(--ease-lux)] hover:-translate-y-1 hover:border-champagne/40">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo photo={photoForCity(leg.to.city)} priority={priority} className="transition duration-[1.2s] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-2 via-night-2/10 to-black/30" />
        <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2"><StatusPill tone="glass" />{leg.isDemo && <DemoPill />}</div>
        <div className="absolute inset-x-5 bottom-4">
          <p className="text-[11px] tracking-[0.22em] text-pearl/75 uppercase">{formatDate(leg.departureStart)}</p>
          <h3 className="font-display mt-1 text-[32px] leading-none font-light">
            {leg.from.city} <span className="text-champagne">—</span> {leg.to.city}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <dl className="grid grid-cols-3 gap-3 border-b hairline pb-4 text-[12px] text-smoke">
          <div><dt className="text-[10px] tracking-[0.18em] text-ash uppercase">Trajet</dt><dd className="mt-1 font-medium text-pearl">{code(leg.from.icao, leg.from.city)} → {code(leg.to.icao, leg.to.city)}</dd></div>
          <div><dt className="text-[10px] tracking-[0.18em] text-ash uppercase">Départ</dt><dd className="mt-1 font-medium text-pearl">{formatTime(leg.departureStart)}–{formatTime(leg.departureEnd)}</dd></div>
          <div><dt className="text-[10px] tracking-[0.18em] text-ash uppercase">Places</dt><dd className="mt-1 font-medium text-pearl">{leg.maxPassengers ?? "—"}</dd></div>
        </dl>
        {(leg.aircraftType || leg.aircraftCategory) && <p className="mt-3 truncate text-[12px] text-smoke">{leg.aircraftType ?? leg.aircraftCategory}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <PriceTag leg={leg} />
          <Link href={href} className="lx-btn px-5 py-3 after:absolute after:inset-0" aria-label={`Réserver ${leg.from.city} – ${leg.to.city}, ${formatDate(leg.departureStart)}`}>Réserver</Link>
        </div>
        <p className="mt-3 text-[10.5px] text-ash">Vérifié {timeAgo(leg.lastVerifiedAt)}</p>
      </div>
    </article>
  );
}

export function FlightRow({ leg }: { leg: PublicLeg }) {
  return (
    <li className="relative grid grid-cols-[1fr_auto] items-center gap-4 border-b hairline py-5 last:border-0 sm:grid-cols-[1.6fr_1.1fr_0.6fr_0.9fr_auto]">
      <div className="min-w-0">
        <p className="font-display truncate text-2xl font-light">{leg.from.city} <span className="text-champagne">—</span> {leg.to.city} {leg.isDemo && <DemoPill />}</p>
        <p className="truncate text-[12px] text-ash">{leg.from.airport} · {leg.to.airport}</p>
      </div>
      <p className="hidden text-sm text-smoke sm:block">{formatDate(leg.departureStart)} · {formatTime(leg.departureStart)}</p>
      <p className="hidden text-sm text-smoke sm:block">{leg.maxPassengers ? `${leg.maxPassengers} places` : "—"}</p>
      <p className="hidden text-lg font-light sm:block">{leg.price ? formatMoney(leg.price.amount, leg.price.currency) : <span className="text-sm text-smoke">Sur demande</span>}</p>
      <a href={`/vols/${encodeURIComponent(leg.key)}`} className="lx-btn-ghost px-4 py-2 text-[12px] after:absolute after:inset-0">Voir</a>
    </li>
  );
}
