const steps = [
  { t: "Choisissez", d: "Un Empty Leg affiché, ou décrivez le vol que vous souhaitez." },
  { t: "Nous vérifions", d: "Disponibilité réelle et prix confirmés directement auprès de l'opérateur." },
  { t: "Vous décidez", d: "Proposition écrite : opérateur, appareil, prix total, conditions. Vous payez seulement si vous acceptez." },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="lx-eyebrow">Comment ça marche</p>
          <h2 className="font-display mt-5 text-5xl leading-[1.02] font-light sm:text-6xl">Trois étapes.<br /><em className="text-champagne">Aucune surprise.</em></h2>
        </div>
        <ol className="divide-y divide-white/10 border-y hairline">
          {steps.map((s, i) => (
            <li key={s.t} className="grid grid-cols-[3rem_1fr] gap-4 py-7">
              <span className="font-display text-3xl font-light text-champagne">{String(i + 1).padStart(2, "0")}</span>
              <div><h3 className="text-xl text-pearl">{s.t}</h3><p className="mt-2 max-w-md text-[15px] leading-relaxed text-smoke">{s.d}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
