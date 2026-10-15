import { SiteHeader } from "./SiteHeader";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 [&_h2]:font-display [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-light [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-smoke [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-smoke [&_code]:text-pearl">
        <h1 className="font-display text-5xl font-light">{title}</h1>
        <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm !text-amber-100">
          Modèle à compléter et à faire valider par un avocat avant mise en ligne. Les mentions entre crochets sont à remplacer.
        </p>
        {children}
      </article>
    </main>
  );
}
