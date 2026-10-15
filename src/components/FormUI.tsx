"use client";
import Link from "next/link";

export type Errors = Record<string, string>;

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lx-label" htmlFor={id}>{label}{hint && <span className="ml-1 normal-case tracking-normal text-ash">— {hint}</span>}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export const aria = (errors: Errors, k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

/** Compteur +/− accessible (passagers, bagages). */
export function Counter({ name, label, sub, value, onChange, min = 0, max = 19 }: {
  name: string; label: string; sub?: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  const btn = "grid size-10 place-items-center rounded-full border border-white/15 text-lg text-pearl transition hover:border-champagne disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-[15px] text-pearl">{label}</p>
        {sub && <p className="text-[12px] text-ash">{sub}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className={btn} aria-label={`Retirer — ${label}`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <output aria-live="polite" className="w-6 text-center text-lg tabular-nums">{value}</output>
        <button type="button" className={btn} aria-label={`Ajouter — ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  );
}

export function Steps({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase" aria-label="Étapes">
      {labels.map((l, i) => (
        <li key={l} className={`flex items-center gap-3 ${i <= step ? "text-champagne" : "text-ash"}`} aria-current={i === step ? "step" : undefined}>
          <span className={`grid size-6 place-items-center rounded-full border text-[10px] ${i < step ? "border-champagne bg-champagne text-night" : i === step ? "border-champagne" : "border-white/15"}`}>{i < step ? "✓" : i + 1}</span>
          {l}
          {i < labels.length - 1 && <span className="h-px w-8 bg-white/15" />}
        </li>
      ))}
    </ol>
  );
}

export function ContactFields({ errors }: { errors: Errors }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="firstName" label="Prénom" error={errors.firstName}><input id="firstName" name="firstName" className="lx-field" autoComplete="given-name" {...aria(errors, "firstName")} /></Field>
      <Field id="lastName" label="Nom" error={errors.lastName}><input id="lastName" name="lastName" className="lx-field" autoComplete="family-name" {...aria(errors, "lastName")} /></Field>
      <Field id="email" label="E-mail" error={errors.email}><input id="email" name="email" type="email" inputMode="email" className="lx-field" autoComplete="email" {...aria(errors, "email")} /></Field>
      <Field id="phone" label="Téléphone" error={errors.phone}><input id="phone" name="phone" type="tel" className="lx-field" autoComplete="tel" placeholder="+33 6 …" {...aria(errors, "phone")} /></Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-[13px] leading-relaxed text-smoke">
          <input type="checkbox" name="consentContact" className="mt-0.5 size-4 shrink-0 accent-champagne" {...aria(errors, "consentContact")} />
          <span>J&apos;accepte d&apos;être recontacté par téléphone et e-mail au sujet de cette demande, selon la{" "}
            <Link href="/confidentialite" className="text-pearl underline underline-offset-4">politique de confidentialité</Link>.</span>
        </label>
        {errors.consentContact && <p id="consentContact-err" className="mt-1.5 text-xs text-red-300">{errors.consentContact}</p>}
      </div>
    </div>
  );
}

/** Champs de l'étape 1 à valider côté client avant de passer à l'étape 2. */
export function firstErrorStep(errors: Errors, stepFields: string[][]) {
  return stepFields.findIndex((fields) => fields.some((f) => errors[f]));
}
