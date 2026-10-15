import Link from "next/link";
import type { PublicLeg } from "@/connectors/registry";
import { formatDate, formatMoney, formatTime, timeAgo } from "@/lib/format";
import { photoForCity } from "@/content/media";
import { Photo } from "./Photo";

export function StatusPill() {
  return (
    <span className="inline-flex items-center gap-2 text-[15px] text-ash">
      <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-ink/40" /><span className="relative inline-flex size-2 rounded-full bg-ink" /></span>
      Disponibilité à confirmer
    </span>
  );
}

export function DemoPill() {
  return <span className="rounded-full border border-red-700 px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-red-700 uppercase">Fictif</span>;
}

export function PriceTag({ leg, size = "md", tone = "ink" }: { leg: PublicLeg; size?: "md" | "lg"; tone?: "ink" | "white" }) {
  const muted = tone === "white" ? "text-white/60" : "text-ash";
  if (!leg.price) return <span className={`text-[17px] ${muted}`}>Prix sur demande</span>;
  return (
    <span className="flex flex-col">
      <span className={`text-[13px] ${muted}`}>{leg.price.kind === "CONFIRMED" ? "Prix opérateur" : "Prix indicatif"}</span>
      <span className={`t-heading ${size === "lg" ? "text-[52px] tracking-[-0.03em]" : "text-[37px]"}`}>{formatMoney(leg.price.amount, leg.price.currency)}</span>
    </span>
  );
}

const code = (icao?: string, city?: string) => icao ?? city?.slice(0, 3).toUpperCase();

/** Carte de vol : bord franc, pas d'ombre, image révélée au scroll, filet au-dessus du titre. */
export function FlightCard({ leg, priority = false }: { leg: PublicLeg; priority?: boolean }) {
  const href = `/vols/${encodeURIComponent(leg.key)}`;
  return (
    <article className="group relative flex h-full flex-col bg-white">
      <div className="relative aspect-[4/3] overflow-hidden" data-clip="">
        <Photo photo={photoForCity(leg.to.city)} priority={priority} className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[13px] font-bold">{formatDate(leg.departureStart)}</span>
          {leg.isDemo && <span className="rounded-full bg-white px-1 py-0.5"><DemoPill /></span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <div className="border-t hair pt-4"><StatusPill /></div>
        <h3 className="t-heading mt-3 text-[30px] tracking-[-0.02em]">{leg.from.city} → {leg.to.city}</h3>
        <p className="mt-2 text-[17px] text-ash">
          {code(leg.from.icao, leg.from.city)} – {code(leg.to.icao, leg.to.city)} · {formatTime(leg.departureStart)}–{formatTime(leg.departureEnd)}
          {leg.maxPassengers ? ` · ${leg.maxPassengers} places` : ""}
        </p>
        {(leg.aircraftType || leg.aircraftCategory) && <p className="mt-1 text-[15px] text-ash">{leg.aircraftType ?? leg.aircraftCategory}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <PriceTag leg={leg} />
          <Link href={href} className="pill after:absolute after:inset-0" aria-label={`Réserver ${leg.from.city} – ${leg.to.city}, ${formatDate(leg.departureStart)}`}>Réserver</Link>
        </div>
        <p className="mt-3 text-[13px] text-ash">Vérifié {timeAgo(leg.lastVerifiedAt)}</p>
      </div>
    </article>
  );
}

export function FlightRow({ leg }: { leg: PublicLeg }) {
  return (
    <li data-reveal-item="" className="relative grid grid-cols-[1fr_auto] items-center gap-4 border-t hair py-6 sm:grid-cols-[1.6fr_1.1fr_0.6fr_0.9fr_auto]">
      <div className="min-w-0">
        <p className="t-heading truncate text-[30px] tracking-[-0.02em]">{leg.from.city} → {leg.to.city} {leg.isDemo && <DemoPill />}</p>
        <p className="truncate text-[15px] text-ash">{leg.from.airport} · {leg.to.airport}</p>
      </div>
      <p className="hidden text-[17px] sm:block">{formatDate(leg.departureStart)} · {formatTime(leg.departureStart)}</p>
      <p className="hidden text-[17px] text-ash sm:block">{leg.maxPassengers ? `${leg.maxPassengers} places` : "—"}</p>
      <p className="t-heading hidden text-[23px] sm:block">{leg.price ? formatMoney(leg.price.amount, leg.price.currency) : <span className="text-[17px] font-normal text-ash">Sur demande</span>}</p>
      <a href={`/vols/${encodeURIComponent(leg.key)}`} className="pill-line px-5 py-3 after:absolute after:inset-0">Voir</a>
    </li>
  );
}
