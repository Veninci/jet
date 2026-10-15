import { site } from "@/lib/config";

export function Confirmation({ reference, summary }: { reference: string; summary?: string }) {
  const steps = [
    { t: "Demande reçue", d: "Maintenant", done: true },
    { t: "Vérification auprès de l'opérateur", d: `Un conseiller vous contacte ${site.responseTime}` },
    { t: "Proposition écrite", d: "Opérateur, appareil, prix total, conditions" },
    { t: "Confirmation et paiement", d: "Uniquement après votre accord" },
  ];
  return (
    <div role="status" className="text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full border border-champagne/60 text-2xl text-champagne">✓</div>
      <h2 className="font-display mt-6 text-4xl font-light">Demande envoyée</h2>
      <p className="mt-3 text-sm text-smoke">Référence <span className="font-medium tracking-wider text-pearl">{reference}</span>{summary && <> · {summary}</>}</p>
      <ol className="mx-auto mt-10 max-w-sm space-y-0 text-left">
        {steps.map((s, i) => (
          <li key={s.t} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className="absolute top-6 left-[11px] h-full w-px bg-white/10" />}
            <span className={`relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[10px] ${s.done ? "border-champagne bg-champagne text-night" : "border-white/20 text-ash"}`}>{s.done ? "✓" : i + 1}</span>
            <span><span className="block text-[15px] text-pearl">{s.t}</span><span className="text-[12px] text-ash">{s.d}</span></span>
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-8 max-w-md text-[12px] leading-relaxed text-ash">
        Ceci n&apos;est pas encore une réservation : le vol n&apos;est garanti qu&apos;après confirmation écrite de l&apos;opérateur et votre acceptation. Un récapitulatif vous a été envoyé par e-mail.
      </p>
    </div>
  );
}
