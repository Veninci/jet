import Link from "next/link";
import { site } from "@/lib/config";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`${overlay ? "absolute inset-x-0 top-0" : "sticky top-0 border-b hairline bg-night/80 backdrop-blur-xl"} z-30`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-display text-[26px] font-light tracking-[0.18em] uppercase" aria-label={`${site.name} — accueil`}>
          {site.name}
        </Link>
        <nav className="flex items-center gap-6 text-[13px] tracking-wide text-pearl/80 sm:gap-9">
          <Link href="/vols" className="transition hover:text-pearl">Empty Legs</Link>
          <Link href="/demande" className="hidden transition hover:text-pearl sm:inline">Vol sur mesure</Link>
          <Link href="/#fonctionnement" className="hidden transition hover:text-pearl md:inline">Comment ça marche</Link>
          {site.phone && <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hidden transition hover:text-pearl lg:inline">{site.phone}</a>}
          <Link href="/vols" className="lx-btn hidden px-5 py-2.5 sm:inline-flex">Réserver</Link>
        </nav>
      </div>
    </header>
  );
}
