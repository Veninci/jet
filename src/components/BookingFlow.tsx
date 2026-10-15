"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { FlightDTO } from "@/lib/api";
import { readAttribution, track } from "@/lib/analytics";
import { ContactFields, Counter, Field, Steps, firstErrorStep, type Errors } from "./FormUI";
import { Confirmation } from "./Confirmation";

const STEP_FIELDS = [["passengers", "cabinBags", "holdBags"], ["firstName", "lastName", "email", "phone", "consentContact"]];

const fmtDate = (iso: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(new Date(iso));
const fmtTime = (iso: string) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(new Date(iso));
const fmtMoney = (n: number, c: string) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

/** Réservation d'un vol affiché, en 2 écrans : 1) voyageurs et bagages, 2) coordonnées. */
export function BookingFlow({ flight }: { flight: FlightDTO }) {
  const formRef = useRef<HTMLFormElement>(null);
  const maxPax = flight.maxPassengers ?? 19;
  const [step, setStep] = useState(0);
  const [pax, setPax] = useState(Math.min(2, maxPax));
  const [cabin, setCabin] = useState(Math.min(2, maxPax));
  const [hold, setHold] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState("");
  const route = `${flight.from.city} → ${flight.to.city}`;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (step === 0) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSending(true);
    setErrors({});
    const fd = new FormData(ev.currentTarget);
    const body = {
      ...Object.fromEntries(fd.entries()),
      offerId: flight.id,
      departure: `${flight.from.city} (${flight.from.airport})`,
      arrival: `${flight.to.city} (${flight.to.airport})`,
      departureDate: flight.departureWindow.start.slice(0, 10),
      flexibilityDays: 0,
      tripType: "ONE_WAY",
      consentContact: fd.get("consentContact") === "on",
      ...readAttribution(),
    };
    try {
      const res = await fetch("/api/v1/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) {
        const errs: Errors = json.fields ?? { _: json.error ?? "Une erreur est survenue." };
        setErrors(errs);
        const s = firstErrorStep(errs, STEP_FIELDS);
        if (s >= 0) setStep(s);
        return;
      }
      setReference(json.data.reference);
      track("generate_lead", { reference: json.data.reference, value: flight.price?.amount ?? 1, currency: flight.price?.currency ?? "EUR", offer: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ _: "Connexion impossible. Réessayez ou appelez-nous." });
    } finally {
      setSending(false);
    }
  }

  const summary = (
    <aside className="lx-card overflow-hidden lg:sticky lg:top-28">
      <div className="relative h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={flight.image.url} alt={flight.image.alt} className="absolute inset-0 h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="absolute inset-0 bg-gradient-to-t from-night-2 to-black/20" />
        <p className="font-display absolute bottom-3 left-5 text-3xl font-light">{route}</p>
      </div>
      <dl className="space-y-3 p-5 text-[13px]">
        <div className="flex justify-between gap-4"><dt className="text-ash">Date</dt><dd className="text-right first-letter:uppercase">{fmtDate(flight.departureWindow.start)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ash">Créneau</dt><dd>{fmtTime(flight.departureWindow.start)} – {fmtTime(flight.departureWindow.end)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ash">Aéroports</dt><dd className="text-right">{flight.from.icao ?? flight.from.airport} → {flight.to.icao ?? flight.to.airport}</dd></div>
        {(flight.aircraft.type || flight.aircraft.category) && <div className="flex justify-between gap-4"><dt className="text-ash">Appareil</dt><dd className="text-right">{flight.aircraft.type ?? flight.aircraft.category}</dd></div>}
        <div className="flex justify-between gap-4"><dt className="text-ash">Voyageurs</dt><dd>{pax}</dd></div>
        <div className="flex items-end justify-between gap-4 border-t hairline pt-4">
          <dt className="text-ash">{flight.price?.kind === "operator" ? "Prix opérateur" : "Prix indicatif"}<br /><span className="text-[11px]">pour l&apos;appareil entier</span></dt>
          <dd className="font-display text-4xl font-light">{flight.price ? fmtMoney(flight.price.amount, flight.price.currency) : "Sur demande"}</dd>
        </div>
      </dl>
      <p className="border-t hairline px-5 py-4 text-[11.5px] leading-relaxed text-ash">Aucun paiement maintenant. Le prix total (taxes et frais inclus) figure dans la proposition écrite.</p>
    </aside>
  );

  if (reference) {
    return <div className="mx-auto max-w-xl py-10"><Confirmation reference={reference} summary={route} /></div>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-8">
        {flight.isDemo && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">Vol <strong>fictif</strong> de démonstration : la demande sera enregistrée pour test uniquement.</p>}
        <Steps step={step} labels={["Voyageurs", "Coordonnées"]} />

        <div className={step === 0 ? "" : "hidden"}>
          <h1 className="font-display text-4xl font-light sm:text-5xl">Qui voyage ?</h1>
          <div className="mt-6 divide-y divide-white/10 border-y hairline">
            <Counter name="passengers" label="Passagers" sub={flight.maxPassengers ? `Jusqu'à ${flight.maxPassengers} à bord` : undefined} value={pax} onChange={setPax} min={1} max={maxPax} />
            <Counter name="cabinBags" label="Bagages cabine" sub="Sacs souples de préférence" value={cabin} onChange={setCabin} max={30} />
            <Counter name="holdBags" label="Bagages en soute" sub="Valises, skis, golf…" value={hold} onChange={setHold} max={30} />
          </div>
          <div className="mt-6">
            <Field id="comments" label="Précisions" hint="facultatif"><textarea id="comments" name="comments" rows={2} className="lx-field" placeholder="Animal à bord, horaire préféré, transfert…" /></Field>
          </div>
        </div>

        <div className={step === 1 ? "" : "hidden"}>
          <h1 className="font-display mb-6 text-4xl font-light sm:text-5xl">Vos coordonnées</h1>
          <ContactFields errors={errors} />
        </div>

        {errors._ && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{errors._}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step === 1
            ? <button type="button" onClick={() => setStep(0)} className="text-[13px] text-smoke underline underline-offset-4">← Voyageurs</button>
            : <Link href={`/vols/${encodeURIComponent(flight.id)}`} className="text-[13px] text-smoke underline underline-offset-4">← Retour au vol</Link>}
          <button type="submit" className="lx-btn w-full sm:w-auto" disabled={sending}>{step === 0 ? "Continuer" : sending ? "Envoi…" : "Demander la réservation"}</button>
        </div>
      </form>
      {summary}
    </div>
  );
}
