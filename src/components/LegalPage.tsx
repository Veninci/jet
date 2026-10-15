import { SiteHeader } from "./SiteHeader";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main>
      <SiteHeader />
      <article className="wrap max-w-3xl pt-36 pb-24 [&_h2]:t-heading [&_h2]:mt-14 [&_h2]:text-[30px] [&_li]:mt-1.5 [&_p]:t-body [&_p]:mt-4 [&_p]:text-ink/80 [&_ul]:t-body [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink/80">
        <h1 data-reveal="" className="t-display text-[52px] sm:text-[63px]">{title}</h1>
        <p className="rounded-3xl border border-amber-300 bg-amber-50 p-4 !text-[15px] !text-amber-900">
          Modèle à compléter et à faire valider par un avocat avant mise en ligne. Les mentions entre crochets sont à remplacer.
        </p>
        {children}
      </article>
    </main>
  );
}
