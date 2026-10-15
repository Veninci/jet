import { faq } from "@/content/faq";
import { JsonLd } from "./JsonLd";
import { Split } from "./motion/Split";

export function Faq() {
  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Split as="h2" className="t-display text-[52px] sm:text-[63px]" text={"Bon\nà savoir."} />
        <div data-reveal-group="" className="border-b hair">
          {faq.map((f) => (
            <details key={f.q} data-reveal-item="" className="group border-t hair py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <h3 className="t-heading text-[23px]">{f.q}</h3>
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-xl text-white transition duration-500 ease-[var(--ease-out-expo)] group-open:rotate-45">+</span>
              </summary>
              <p className="t-body mt-4 pr-14 text-ash">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
    </section>
  );
}
