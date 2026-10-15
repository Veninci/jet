import Link from "next/link";
import { site } from "@/lib/config";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <header className={`relative z-20 ${dark ? "text-ivory" : "border-b border-line bg-ivory text-ink"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="font-display text-2xl tracking-wide" aria-label={`${site.name} — accueil`}>
          {site.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm sm:gap-8">
          <Link href="/vols" className="hidden opacity-85 hover:opacity-100 sm:inline">Empty Legs</Link>
          <Link href="/#fonctionnement" className="hidden opacity-85 hover:opacity-100 md:inline">Fonctionnement</Link>
          <Link href="/#faq" className="hidden opacity-85 hover:opacity-100 md:inline">FAQ</Link>
          <Link href="/demande"
            className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${dark ? "bg-ivory text-ink hover:bg-white" : "bg-ink text-ivory hover:bg-ink-soft"}`}>
            Trouver mon vol
          </Link>
        </nav>
      </div>
    </header>
  );
}
