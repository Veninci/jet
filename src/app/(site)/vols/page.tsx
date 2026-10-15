import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { FlightCard, FlightRow } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { DemoBanner } from "@/components/DemoBanner";
import { searchPublic } from "@/connectors/registry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Empty Legs disponibles : vols en jet privé à prix réduit",
  description: "Consultez les Empty Legs en jet privé à venir et réservez le vol qui vous intéresse. Disponibilité confirmée par un conseiller.",
  alternates: { canonical: "/vols" },
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const CATEGORIES = ["Very light jet", "Light jet", "Midsize jet", "Super midsize jet", "Heavy jet", "Turbopropulseur"];

export default async function FlightsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const from = one(sp.from);
  const to = one(sp.to);
  const date = one(sp.date);
  const pax = one(sp.pax) ? Number(one(sp.pax)) : undefined;
  const budget = one(sp.budget) ? Number(one(sp.budget)) : undefined;
  const category = one(sp.cat);
  const view = one(sp.view) === "list" ? "list" : "cards";

  const now = new Date();
  const center = date ? new Date(`${date}T12:00:00Z`) : null;
  const earliest = center ? new Date(Math.max(now.getTime(), center.getTime() - 3 * 86_400_000)) : now;
  const latest = center ? new Date(center.getTime() + 3 * 86_400_000) : new Date(now.getTime() + 60 * 86_400_000);

  const { legs: all } = await searchPublic({ from: { text: from }, to: { text: to }, earliest, latest, passengers: pax });
  const legs = all
    .filter((l) => !budget || !l.price || l.price.amount <= budget)
    .filter((l) => !category || l.aircraftCategory === category);
  const hasDemo = legs.some((l) => l.isDemo);
  const qs = (v: "cards" | "list") => {
    const p = new URLSearchParams(Object.entries(sp).flatMap(([k, val]) => (one(val) ? [[k, one(val)!]] : [])));
    p.set("view", v);
    return `?${p.toString()}`;
  };
  const filter = "w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[14px] text-pearl outline-none placeholder:text-ash focus:border-champagne/60 [color-scheme:dark]";

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-8">
        <p className="lx-eyebrow">Catalogue</p>
        <h1 className="font-display mt-4 text-5xl font-light sm:text-7xl">Empty Legs</h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">
          Des jets privés qui doivent se repositionner, proposés à prix réduit. Chaque vol est confirmé auprès de
          l&apos;opérateur avant réservation : horaires et itinéraires peuvent évoluer.
        </p>

        <form method="get" className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_0.9fr_0.7fr_0.8fr_1fr_auto]">
          <input name="from" defaultValue={from} placeholder="Départ" aria-label="Départ" className={filter} />
          <input name="to" defaultValue={to} placeholder="Destination" aria-label="Destination" className={filter} />
          <input name="date" type="date" defaultValue={date} aria-label="Date (± 3 jours)" className={filter} />
          <input name="pax" type="number" min={1} max={19} defaultValue={pax} placeholder="Pax" aria-label="Passagers" className={filter} />
          <input name="budget" type="number" min={0} step={500} defaultValue={budget} placeholder="Budget max" aria-label="Budget maximum (€)" className={filter} />
          <select name="cat" defaultValue={category ?? ""} aria-label="Catégorie d'appareil" className={filter}>
            <option value="" className="bg-night">Tous appareils</option>
            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-night">{c}</option>)}
          </select>
          <input type="hidden" name="view" value={view} />
          <button className="lx-btn col-span-2 py-2.5 sm:col-span-3 lg:col-span-1">Filtrer</button>
        </form>
      </section>

      <section id="resultats" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-24 sm:px-8">
        {hasDemo && <DemoBanner />}
        <div className="mb-6 flex items-center justify-between text-[13px]">
          <p className="text-smoke">{legs.length} vol{legs.length > 1 ? "s" : ""} {date ? "autour de votre date (± 3 jours)" : "dans les 60 prochains jours"}</p>
          <div className="flex gap-1 rounded-full border border-white/10 p-1" aria-label="Affichage">
            <Link href={qs("cards")} aria-current={view === "cards"} className={`rounded-full px-4 py-1.5 transition ${view === "cards" ? "bg-pearl text-night" : "text-smoke"}`}>Cartes</Link>
            <Link href={qs("list")} aria-current={view === "list"} className={`rounded-full px-4 py-1.5 transition ${view === "list" ? "bg-pearl text-night" : "text-smoke"}`}>Liste</Link>
          </div>
        </div>

        {legs.length > 0 && (view === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{legs.map((l, i) => <FlightCard key={l.key} leg={l} priority={i < 3} />)}</div>
        ) : (
          <ul className="lx-card px-5">{legs.map((l) => <FlightRow key={l.key} leg={l} />)}</ul>
        ))}

        {[...new Set(legs.map((l) => l.attribution).filter(Boolean))].map((a) => <p key={a} className="mt-4 text-[11px] text-ash">{a}</p>)}

        <div className="lx-card mt-16 grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h2 className="font-display text-4xl font-light">{legs.length ? "Rien ne correspond ?" : "Aucun vol affiché sur ce trajet"}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-smoke">
              Beaucoup d&apos;Empty Legs ne sont jamais publiés en ligne. Décrivez votre vol : nous interrogeons directement les
              opérateurs, y compris sur les aéroports proches.
            </p>
          </div>
          <LeadForm prefill={{ departure: from, arrival: to, departureDate: date, passengers: pax }} />
        </div>
      </section>
    </main>
  );
}
