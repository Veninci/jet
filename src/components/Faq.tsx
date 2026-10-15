import { faq } from "@/content/faq";
import { JsonLd } from "./JsonLd";

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
      <p className="lx-eyebrow text-center">Questions fréquentes</p>
      <h2 className="font-display mt-5 text-center text-5xl font-light">Bon à savoir</h2>
      <div className="mt-12 divide-y divide-white/10 border-y hairline">
        {faq.map((f) => (
          <details key={f.q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] text-pearl">
              <h3>{f.q}</h3>
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 text-champagne transition duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 pr-12 leading-relaxed text-smoke">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
    </section>
  );
}
