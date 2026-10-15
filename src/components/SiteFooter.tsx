import Link from "next/link";
import { site } from "@/lib/config";
import { ConsentLink } from "./ConsentAndAnalytics";
import { routePages } from "@/content/routes";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ivory/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-sm sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl text-ivory">{site.name}</p>
          <p className="mt-3 max-w-sm leading-relaxed">
            Intermédiaire spécialisé dans les vols Empty Leg. Nous ne sommes pas transporteur aérien : chaque vol est
            exploité par un opérateur titulaire d&apos;un certificat de transporteur aérien (CTA/AOC), identifié dans votre proposition.
          </p>
        </div>
        <div>
          <p className="eyebrow text-gold">Itinéraires</p>
          <ul className="mt-3 space-y-2">
            {routePages.map((r) => (
              <li key={r.slug}><Link className="hover:text-ivory" href={`/empty-leg/${r.slug}`}>{r.navLabel}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold">Informations</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-ivory" href="/conditions">Conditions de service</Link></li>
            <li><Link className="hover:text-ivory" href="/mentions-legales">Mentions légales</Link></li>
            <li><Link className="hover:text-ivory" href="/confidentialite">Confidentialité</Link></li>
            <li><Link className="hover:text-ivory" href="/cookies">Cookies</Link></li>
            <li><ConsentLink /></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} {site.name}</div>
    </footer>
  );
}
