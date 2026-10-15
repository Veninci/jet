"use client";
import { useRef, useState } from "react";
import { readAttribution, track } from "@/lib/analytics";
import { ContactFields, Counter, Field, Steps, aria, firstErrorStep, type Errors } from "./FormUI";
import { Confirmation } from "./Confirmation";

export type LeadPrefill = { departure?: string; arrival?: string; departureDate?: string; passengers?: number };

const today = () => new Date().toISOString().slice(0, 10);
const STEP_FIELDS = [["departure", "arrival", "departureDate", "returnDate", "passengers", "budget"], ["firstName", "lastName", "email", "phone", "consentContact"]];

/** Demande de vol sur mesure en 2 écrans : 1) trajet, 2) coordonnées. */
export function LeadForm({ prefill = {} }: { prefill?: LeadPrefill }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP">("ONE_WAY");
  const [pax, setPax] = useState(prefill.passengers ?? 2);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState("");

  function next() {
    const fd = new FormData(formRef.current!);
    const e: Errors = {};
    if (String(fd.get("departure") ?? "").trim().length < 2) e.departure = "Indiquez une ville ou un aéroport";
    if (String(fd.get("arrival") ?? "").trim().length < 2) e.arrival = "Indiquez une ville ou un aéroport";
    if (!fd.get("departureDate")) e.departureDate = "Choisissez une date";
    if (tripType === "ROUND_TRIP" && !fd.get("returnDate")) e.returnDate = "Choisissez une date de retour";
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(1);
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (step === 0) return next();
    setSending(true);
    setErrors({});
    const fd = new FormData(ev.currentTarget);
    const body = { ...Object.fromEntries(fd.entries()), tripType, consentContact: fd.get("consentContact") === "on", ...readAttribution() };
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
      track("generate_lead", { reference: json.data.reference, value: 1, currency: "EUR", offer: false });
    } catch {
      setErrors({ _: "Connexion impossible. Réessayez ou appelez-nous." });
    } finally {
      setSending(false);
    }
  }

  if (reference) return <Confirmation reference={reference} />;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-8">
      <Steps step={step} labels={["Votre vol", "Vos coordonnées"]} />

      <div className={step === 0 ? "space-y-6" : "hidden"}>
        <div className="inline-flex rounded-full border border-pebble bg-white p-1 text-[13px]" role="radiogroup" aria-label="Type de vol">
          {(["ONE_WAY", "ROUND_TRIP"] as const).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={tripType === t} onClick={() => setTripType(t)}
              className={`rounded-full px-5 py-2 transition ${tripType === t ? "bg-ink text-white" : "text-ash hover:text-ink"}`}>
              {t === "ONE_WAY" ? "Aller simple" : "Aller-retour"}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="departure" label="Départ" error={errors.departure}><input id="departure" name="departure" className="in-field" placeholder="Paris, Le Bourget…" defaultValue={prefill.departure} autoComplete="off" {...aria(errors, "departure")} /></Field>
          <Field id="arrival" label="Destination" error={errors.arrival}><input id="arrival" name="arrival" className="in-field" placeholder="Nice, Genève, Ibiza…" defaultValue={prefill.arrival} autoComplete="off" {...aria(errors, "arrival")} /></Field>
          <Field id="departureDate" label="Date de départ" error={errors.departureDate}><input id="departureDate" name="departureDate" type="date" min={today()} className="in-field" defaultValue={prefill.departureDate} {...aria(errors, "departureDate")} /></Field>
          {tripType === "ROUND_TRIP" ? (
            <Field id="returnDate" label="Date de retour" error={errors.returnDate}><input id="returnDate" name="returnDate" type="date" min={today()} className="in-field" {...aria(errors, "returnDate")} /></Field>
          ) : (
            <Field id="flexibilityDays" label="Flexibilité">
              <select id="flexibilityDays" name="flexibilityDays" className="in-field" defaultValue="1">
                <option value="0">Date exacte</option><option value="1">± 1 jour</option><option value="2">± 2 jours</option><option value="3">± 3 jours</option><option value="7">± 1 semaine</option>
              </select>
            </Field>
          )}
          <div className="rounded-full border border-pebble px-5 sm:col-span-1">
            <Counter name="passengers" label="Passagers" value={pax} onChange={setPax} min={1} max={19} />
          </div>
          <Field id="budget" label="Budget" hint="facultatif" error={errors.budget}><input id="budget" name="budget" type="number" inputMode="numeric" min={0} step={500} className="in-field" placeholder="ex. 6 000 €" {...aria(errors, "budget")} /></Field>
          {tripType === "ROUND_TRIP" && <input type="hidden" name="flexibilityDays" value="1" />}
          <div className="sm:col-span-2">
            <Field id="comments" label="Précisions" hint="facultatif"><textarea id="comments" name="comments" rows={2} className="in-field" placeholder="Horaires, bagages volumineux, animal…" /></Field>
          </div>
        </div>
      </div>

      <div className={step === 1 ? "" : "hidden"}><ContactFields errors={errors} /></div>

      {errors._ && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{errors._}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step === 1 ? <button type="button" onClick={() => setStep(0)} className="text-[13px] text-ash underline underline-offset-4">← Modifier le vol</button> : <span className="text-[12px] text-ash">Gratuit, sans engagement, sans paiement.</span>}
        <button type="submit" className="pill w-full sm:w-auto" disabled={sending}>{step === 0 ? "Continuer" : sending ? "Envoi…" : "Envoyer ma demande"}</button>
      </div>
    </form>
  );
}
