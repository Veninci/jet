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
  description: "Consultez les Empty Legs en jet privé à venir et demandez le vol qui vous intéresse. Disponibilité vérifiée par un conseiller.",
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

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:px-6">
        <p className="eyebrow">Catalogue</p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">Empty Legs en jet privé</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Les vols affichés sont des opportunités dont la disponibilité doit être confirmée auprès de l&apos;opérateur. Les
          horaires et itinéraires d&apos;un Empty Leg peuvent changer : demander un vol ne vaut pas réservation.
        </p>

        <form method="get" className="mt-8 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-3 lg:grid-cols-7">
          <input name="from" defaultValue={from} placeholder="Départ" aria-label="Départ" className="field lg:col-span-1" />
          <input name="to" defaultValue={to} placeholder="Arrivée" aria-label="Arrivée" className="field" />
          <input name="date" type="date" defaultValue={date} aria-label="Date (± 3 jours)" className="field" />
          <input name="pax" type="number" min={1} max={19} defaultValue={pax} placeholder="Passagers" aria-label="Passagers" className="field" />
          <input name="budget" type="number" min={0} step={500} defaultValue={budget} placeholder="Budget max €" aria-label="Budget maximum" className="field" />
          <select name="cat" defaultValue={category ?? ""} aria-label="Catégorie d'appareil" className="field">
            <option value="">Tous appareils</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="hidden" name="view" value={view} />
          <button className="btn-primary">Filtrer</button>
        </form>
      </section>

      <section id="resultats" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {hasDemo && <DemoBanner />}
        <div className="mb-5 flex items-center justify-between text-sm">
          <p className="text-ink-soft">{legs.length} vol{legs.length > 1 ? "s" : ""} {date ? "autour de la date choisie (± 3 jours)" : "dans les 60 prochains jours"}</p>
          <div className="flex gap-1 rounded-md border border-line bg-white p-1" aria-label="Affichage">
            <Link href={qs("cards")} aria-current={view === "cards"} className={`rounded px-3 py-1 ${view === "cards" ? "bg-ink text-ivory" : ""}`}>Cartes</Link>
            <Link href={qs("list")} aria-current={view === "list"} className={`rounded px-3 py-1 ${view === "list" ? "bg-ink text-ivory" : ""}`}>Liste</Link>
          </div>
        </div>

        {legs.length > 0 ? (
          view === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{legs.map((l) => <FlightCard key={l.key} leg={l} />)}</div>
          ) : (
            <ul className="rounded-lg border border-line bg-white px-4">{legs.map((l) => <FlightRow key={l.key} leg={l} />)}</ul>
          )
        ) : null}

        {[...new Set(legs.map((l) => l.attribution).filter(Boolean))].map((a) => (
          <p key={a} className="mt-4 text-xs text-mist">{a}</p>
        ))}

        <div className="mt-14 grid gap-10 rounded-lg border border-line bg-white p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h2 className="font-display text-3xl">{legs.length ? "Aucun vol ne convient ?" : "Aucun Empty Leg affiché pour ce trajet"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Beaucoup d&apos;Empty Legs ne sont jamais publiés en ligne ou le sont au dernier moment. Transmettez-nous votre
              besoin : nous interrogeons directement les opérateurs, y compris sur les aéroports proches.
            </p>
          </div>
          <LeadForm prefill={{ departure: from, arrival: to, departureDate: date, passengers: pax }} />
        </div>
      </section>
    </main>
  );
}
