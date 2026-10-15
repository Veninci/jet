import { faq } from "@/content/faq";
import { JsonLd } from "./JsonLd";

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="eyebrow">Questions fréquentes</p>
      <h2 className="font-display mt-3 text-4xl">Tout savoir sur les Empty Legs</h2>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {faq.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
              <h3>{f.q}</h3>
              <span aria-hidden className="text-gold transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
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
