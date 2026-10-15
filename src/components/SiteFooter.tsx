import Link from "next/link";
import { site } from "@/lib/config";
import { ConsentLink } from "./ConsentAndAnalytics";
import { routePages } from "@/content/routes";
import { media } from "@/content/media";

export function SiteFooter() {
  const credits = Object.values(media).map((m) => m.credit).filter((c, i, a) => a.indexOf(c) === i);
  return (
    <footer className="border-t hairline bg-night text-smoke">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 text-sm sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-light tracking-[0.18em] text-pearl uppercase">{site.name}</p>
          <p className="mt-4 max-w-sm leading-relaxed">
            Intermédiaire spécialisé dans les vols Empty Leg. Nous ne sommes pas transporteur aérien : chaque vol est
            exploité par une compagnie titulaire d&apos;un certificat de transporteur aérien, nommée dans votre proposition.
          </p>
        </div>
        <div>
          <p className="lx-eyebrow">Destinations</p>
          <ul className="mt-4 space-y-2.5">
            {routePages.map((r) => (
              <li key={r.slug}><Link className="transition hover:text-pearl" href={`/empty-leg/${r.slug}`}>{r.navLabel}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="lx-eyebrow">Informations</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link className="transition hover:text-pearl" href="/conditions">Conditions de service</Link></li>
            <li><Link className="transition hover:text-pearl" href="/mentions-legales">Mentions légales</Link></li>
            <li><Link className="transition hover:text-pearl" href="/confidentialite">Confidentialité</Link></li>
            <li><Link className="transition hover:text-pearl" href="/cookies">Cookies</Link></li>
            <li><ConsentLink /></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t hairline px-5 py-6 text-[11px] text-ash sm:flex-row sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>Photographies : {credits.join(", ")}</span>
      </div>
    </footer>
  );
}
