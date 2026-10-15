import Link from "next/link";
import { site } from "@/lib/config";
import { ConsentLink } from "./ConsentAndAnalytics";
import { routePages } from "@/content/routes";
import { media } from "@/content/media";

export function SiteFooter() {
  const credits = [...new Set(Object.values(media).map((m) => m.credit))];
  return (
    <footer className="overflow-hidden bg-ink text-white">
      <div className="wrap grid gap-14 pt-24 pb-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="max-w-sm text-[30px] leading-[1.1] font-bold tracking-[-0.01em]">Le jet privé, au prix du vide.</p>
          <p className="mt-6 max-w-sm text-[17px] leading-[1.61] text-ash">
            Intermédiaire spécialisé dans les vols Empty Leg. Nous ne sommes pas transporteur aérien : chaque vol est
            exploité par une compagnie titulaire d&apos;un certificat de transporteur aérien, nommée dans votre proposition.
          </p>
        </div>
        <div>
          <p className="text-[15px] text-ash">Destinations</p>
          <ul className="mt-5 space-y-3 text-[20px]">
            {routePages.map((r) => <li key={r.slug}><Link className="transition hover:text-ash" href={`/empty-leg/${r.slug}`}>{r.navLabel.replace("Jet privé ", "").replace("Empty Leg ", "")}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="text-[15px] text-ash">Informations</p>
          <ul className="mt-5 space-y-3 text-[20px]">
            <li><Link className="transition hover:text-ash" href="/conditions">Conditions</Link></li>
            <li><Link className="transition hover:text-ash" href="/mentions-legales">Mentions légales</Link></li>
            <li><Link className="transition hover:text-ash" href="/confidentialite">Confidentialité</Link></li>
            <li><Link className="transition hover:text-ash" href="/cookies">Cookies</Link></li>
            <li><ConsentLink /></li>
          </ul>
        </div>
      </div>
      <div className="wrap">
        <p data-grow="" aria-hidden="true" className="t-hero origin-bottom-left text-[27vw] leading-[0.78] tracking-[-0.035em] md:text-[min(24vw,300px)]">{site.name}</p>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-white/10 py-6 text-[13px] text-ash sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>Photographies : {credits.join(", ")}</span>
      </div>
    </footer>
  );
}
