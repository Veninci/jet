const steps = [
  { t: "Votre demande", d: "Trajet, dates, passagers. Deux minutes, sans engagement." },
  { t: "Vérification", d: "Nous interrogeons les opérateurs pour confirmer la disponibilité réelle et le prix." },
  { t: "Proposition écrite", d: "Opérateur, appareil, horaires, prix total et conditions : tout est indiqué avant que vous décidiez." },
  { t: "Confirmation", d: "La réservation devient définitive après votre accord et la confirmation écrite de l'opérateur." },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow">Fonctionnement</p>
        <h2 className="font-display mt-3 max-w-xl text-4xl">De la demande au décollage, quatre étapes claires</h2>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t}>
              <span className="font-display text-5xl text-gold/70">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
