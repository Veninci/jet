import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { FlightCard, FlightRow } from "@/components/FlightCard";
import { LeadForm } from "@/components/LeadForm";
import { DemoBanner } from "@/components/DemoBanner";
import { Split } from "@/components/motion/Split";
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
  const filter = "w-full rounded-full border border-pebble bg-white px-5 py-3 text-[17px] text-ink outline-none placeholder:text-ash focus:border-ink";

  return (
    <main>
      <SiteHeader />
      <section className="sky pt-36 pb-16">
        <div className="wrap">
          <Split as="h1" className="t-hero text-[22vw] sm:text-[187px]" text="Empty Legs." />
          <p data-reveal="" className="t-body mt-8 max-w-2xl text-ink/75">
            Des jets privés qui doivent se repositionner, proposés à prix réduit. Chaque vol est confirmé auprès de
            l&apos;opérateur avant réservation : horaires et itinéraires peuvent évoluer.
          </p>
          <form method="get" data-reveal="" className="mt-10 grid grid-cols-2 gap-2.5 rounded-[32px] bg-white p-2.5 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_0.9fr_0.7fr_0.8fr_1fr_auto] lg:rounded-full">
            <input name="from" defaultValue={from} placeholder="Départ" aria-label="Départ" className={filter} />
            <input name="to" defaultValue={to} placeholder="Destination" aria-label="Destination" className={filter} />
            <input name="date" type="date" defaultValue={date} aria-label="Date (± 3 jours)" className={filter} />
            <input name="pax" type="number" min={1} max={19} defaultValue={pax} placeholder="Pax" aria-label="Passagers" className={filter} />
            <input name="budget" type="number" min={0} step={500} defaultValue={budget} placeholder="Budget max" aria-label="Budget maximum (€)" className={filter} />
            <select name="cat" defaultValue={category ?? ""} aria-label="Catégorie d'appareil" className={filter}>
              <option value="">Tous appareils</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="hidden" name="view" value={view} />
            <button className="pill col-span-2 sm:col-span-3 lg:col-span-1">Filtrer</button>
          </form>
        </div>
      </section>

      <section id="resultats" className="wrap scroll-mt-24 py-16">
        {hasDemo && <DemoBanner />}
        <div className="mb-10 flex items-center justify-between gap-4">
          <p className="text-[17px] text-ash">{legs.length} vol{legs.length > 1 ? "s" : ""} {date ? "autour de votre date (± 3 jours)" : "dans les 60 prochains jours"}</p>
          <div className="flex gap-1 rounded-full border border-pebble p-1 text-[15px]" aria-label="Affichage">
            <Link href={qs("cards")} aria-current={view === "cards"} className={`rounded-full px-4 py-1.5 transition ${view === "cards" ? "bg-ink text-white" : ""}`}>Cartes</Link>
            <Link href={qs("list")} aria-current={view === "list"} className={`rounded-full px-4 py-1.5 transition ${view === "list" ? "bg-ink text-white" : ""}`}>Liste</Link>
          </div>
        </div>

        {legs.length > 0 && (view === "cards" ? (
          <div data-reveal-group="" className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {legs.map((l, i) => <div key={l.key} data-reveal-item=""><FlightCard leg={l} priority={i < 3} /></div>)}
          </div>
        ) : (
          <ul data-reveal-group="" className="border-b hair">{legs.map((l) => <FlightRow key={l.key} leg={l} />)}</ul>
        ))}
        {[...new Set(legs.map((l) => l.attribution).filter(Boolean))].map((a) => <p key={a} className="mt-4 text-[13px] text-ash">{a}</p>)}
      </section>

      <section className="bg-white pb-28">
        <div className="wrap grid gap-12 border-t hair pt-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Split as="h2" className="t-display text-[44px] sm:text-[52px]" text={legs.length ? "Rien ne\ncorrespond ?" : "Aucun vol\nsur ce trajet."} />
            <p data-reveal="" className="t-body mt-6 max-w-sm text-ash">
              Beaucoup d&apos;Empty Legs ne sont jamais publiés en ligne. Décrivez votre vol : nous interrogeons directement les
              opérateurs, aéroports proches compris.
            </p>
          </div>
          <LeadForm prefill={{ departure: from, arrival: to, departureDate: date, passengers: pax }} />
        </div>
      </section>
    </main>
  );
}
