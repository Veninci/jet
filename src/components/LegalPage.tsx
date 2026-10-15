import { SiteHeader } from "./SiteHeader";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 [&_h2]:font-display [&_h2]:mt-10 [&_h2]:text-2xl [&_li]:mt-1 [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-ink-soft [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-soft">
        <h1 className="font-display text-4xl">{title}</h1>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm !text-amber-900">
          Modèle à compléter et à faire valider par un avocat avant mise en ligne. Les mentions entre crochets sont à remplacer.
        </p>
        {children}
      </article>
    </main>
  );
}
