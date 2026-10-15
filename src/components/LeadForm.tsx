"use client";
import Link from "next/link";
import { useState } from "react";
import { readAttribution, track } from "@/lib/analytics";

export type LeadPrefill = {
  departure?: string;
  arrival?: string;
  departureDate?: string;
  passengers?: number;
  offerId?: string;
  offerLabel?: string;
};

type Errors = Record<string, string>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function LeadForm({ prefill = {}, variant = "full" }: { prefill?: LeadPrefill; variant?: "full" | "offer" }) {
  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP">("ONE_WAY");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState("");
  const isOffer = variant === "offer";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(fd.entries()),
      tripType,
      consentContact: fd.get("consentContact") === "on",
      offerId: prefill.offerId,
      ...readAttribution(),
    };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? { _: json.error ?? "Une erreur est survenue." });
        setState("error");
        return;
      }
      setReference(json.reference);
      setState("done");
      track("generate_lead", { reference: json.reference, value: 1, currency: "EUR", offer: Boolean(prefill.offerId) });
    } catch {
      setErrors({ _: "Connexion impossible. Réessayez ou appelez-nous." });
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-lg border border-line bg-white p-8 text-center">
        <p className="eyebrow">Demande reçue</p>
        <h3 className="font-display mt-3 text-3xl">Merci, nous étudions votre demande.</h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Votre référence : <strong className="font-semibold text-ink">{reference}</strong>. Un conseiller vérifie les vols
          compatibles auprès des opérateurs et vous recontacte par téléphone ou e-mail. Un e-mail récapitulatif vous a été envoyé.
        </p>
        <p className="mx-auto mt-4 max-w-md rounded-md bg-sand/60 p-3 text-xs leading-relaxed text-ink-soft">
          Cette demande ne constitue pas une réservation. Aucun vol n&apos;est réservé ni garanti avant votre acceptation d&apos;une
          proposition écrite, confirmée par l&apos;opérateur aérien.
        </p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? <p id={`${k}-err`} className="mt-1 text-xs text-red-700">{errors[k]}</p> : null;
  const aria = (k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {isOffer ? (
        <>
          <input type="hidden" name="departure" value={prefill.departure} />
          <input type="hidden" name="arrival" value={prefill.arrival} />
          <input type="hidden" name="departureDate" value={prefill.departureDate} />
          <input type="hidden" name="flexibilityDays" value="0" />
          <div className="rounded-md bg-sand/60 px-4 py-3 text-sm text-ink-soft">
            Vol demandé : <strong className="text-ink">{prefill.offerLabel}</strong>
          </div>
        </>
      ) : (
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-3">Votre trajet</legend>
          <div className="inline-flex rounded-md border border-line bg-white p-1 text-sm" role="radiogroup" aria-label="Type de vol">
            {(["ONE_WAY", "ROUND_TRIP"] as const).map((t) => (
              <button key={t} type="button" role="radio" aria-checked={tripType === t} onClick={() => setTripType(t)}
                className={`rounded px-4 py-2 transition ${tripType === t ? "bg-ink text-ivory" : "text-ink-soft"}`}>
                {t === "ONE_WAY" ? "Aller simple" : "Aller-retour"}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="departure">Départ</label>
              <input id="departure" name="departure" className="field" placeholder="Paris, Le Bourget…" defaultValue={prefill.departure} autoComplete="off" required {...aria("departure")} />
              {err("departure")}
            </div>
            <div>
              <label className="label" htmlFor="arrival">Arrivée</label>
              <input id="arrival" name="arrival" className="field" placeholder="Nice, Genève…" defaultValue={prefill.arrival} autoComplete="off" required {...aria("arrival")} />
              {err("arrival")}
            </div>
            <div>
              <label className="label" htmlFor="departureDate">Date souhaitée</label>
              <input id="departureDate" name="departureDate" type="date" min={today()} className="field" defaultValue={prefill.departureDate} required {...aria("departureDate")} />
              {err("departureDate")}
            </div>
            {tripType === "ROUND_TRIP" ? (
              <div>
                <label className="label" htmlFor="returnDate">Date de retour</label>
                <input id="returnDate" name="returnDate" type="date" min={today()} className="field" {...aria("returnDate")} />
                {err("returnDate")}
              </div>
            ) : (
              <div>
                <label className="label" htmlFor="flexibilityDays">Flexibilité</label>
                <select id="flexibilityDays" name="flexibilityDays" className="field" defaultValue="1">
                  <option value="0">Date exacte</option>
                  <option value="1">± 1 jour</option>
                  <option value="2">± 2 jours</option>
                  <option value="3">± 3 jours</option>
                  <option value="7">± 1 semaine</option>
                </select>
              </div>
            )}
            {tripType === "ROUND_TRIP" && (
              <div>
                <label className="label" htmlFor="flexibilityDays">Flexibilité</label>
                <select id="flexibilityDays" name="flexibilityDays" className="field" defaultValue="1">
                  <option value="0">Dates exactes</option>
                  <option value="1">± 1 jour</option>
                  <option value="2">± 2 jours</option>
                  <option value="3">± 3 jours</option>
                </select>
              </div>
            )}
          </div>
        </fieldset>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="eyebrow mb-3">{isOffer ? "Votre demande" : "Passagers et budget"}</legend>
        <div>
          <label className="label" htmlFor="passengers">Passagers</label>
          <input id="passengers" name="passengers" type="number" inputMode="numeric" min={1} max={19} className="field" defaultValue={prefill.passengers ?? 2} required {...aria("passengers")} />
          {err("passengers")}
        </div>
        {!isOffer && (
          <div>
            <label className="label" htmlFor="budget">Budget indicatif (€) <span className="normal-case text-mist">— facultatif</span></label>
            <input id="budget" name="budget" type="number" inputMode="numeric" min={0} step={500} className="field" placeholder="ex. 6000" {...aria("budget")} />
            {err("budget")}
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Vos coordonnées</legend>
        <div>
          <label className="label" htmlFor="firstName">Prénom</label>
          <input id="firstName" name="firstName" className="field" autoComplete="given-name" required {...aria("firstName")} />
          {err("firstName")}
        </div>
        <div>
          <label className="label" htmlFor="lastName">Nom</label>
          <input id="lastName" name="lastName" className="field" autoComplete="family-name" required {...aria("lastName")} />
          {err("lastName")}
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" inputMode="email" required {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label className="label" htmlFor="phone">Téléphone</label>
          <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="+33 6 …" required {...aria("phone")} />
          {err("phone")}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="comments">Commentaires <span className="normal-case text-mist">— facultatif</span></label>
          <textarea id="comments" name="comments" rows={3} className="field" placeholder="Bagages volumineux, animal, horaires…" />
        </div>
      </fieldset>

      {/* Pot de miel anti-robots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input type="checkbox" name="consentContact" className="mt-1 size-4 accent-ink" required {...aria("consentContact")} />
          <span>
            J&apos;accepte d&apos;être recontacté par téléphone et e-mail au sujet de cette demande. Mes données sont traitées
            conformément à la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.
          </span>
        </label>
        {err("consentContact")}
      </div>

      {errors._ && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{errors._}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={state === "sending"}>
          {state === "sending" ? "Envoi…" : isOffer ? "Demander ce vol" : "Envoyer ma demande"}
        </button>
        <p className="text-xs text-mist">Gratuit et sans engagement. Ce n&apos;est pas une réservation.</p>
      </div>
    </form>
  );
}
