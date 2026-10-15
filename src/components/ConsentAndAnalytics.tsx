"use client";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_KEY, readConsent, type ConsentState } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/**
 * Bandeau de consentement conforme aux lignes directrices CNIL : "Refuser" aussi visible qu'"Accepter",
 * aucun traceur avant choix. Google Consent Mode v2 est initialisé en "denied" et gtag.js
 * n'est chargé qu'après consentement explicite (mode "basique").
 */
export function ConsentAndAnalytics() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, ads: false });

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    if (!c) setOpen(true);
    const reopen = () => {
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener("open-consent", reopen);
    return () => window.removeEventListener("open-consent", reopen);
  }, []);

  function save(c: { analytics: boolean; ads: boolean }) {
    const state = { ...c, at: new Date().toISOString() };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    } catch {}
    setConsent(state);
    setOpen(false);
    window.gtag?.("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.ads ? "granted" : "denied",
      ad_user_data: c.ads ? "granted" : "denied",
      ad_personalization: c.ads ? "granted" : "denied",
    });
  }

  const loadTags = Boolean((GA_ID || ADS_ID) && consent && (consent.analytics || consent.ads));

  return (
    <>
      {loadTags && (
        <>
          <Script id="gtag-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              analytics_storage: ${consent?.analytics ? "'granted'" : "'denied'"},
              ad_storage: ${consent?.ads ? "'granted'" : "'denied'"},
              ad_user_data: ${consent?.ads ? "'granted'" : "'denied'"},
              ad_personalization: ${consent?.ads ? "'granted'" : "'denied'"}
            });
            gtag('js', new Date());
            ${GA_ID && consent?.analytics ? `gtag('config', '${GA_ID}', { anonymize_ip: true });` : ""}
            ${ADS_ID && consent?.ads ? `gtag('config', '${ADS_ID}');` : ""}
          `}</Script>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID ?? ADS_ID}`} strategy="afterInteractive" />
        </>
      )}
      {open && (
        <div role="dialog" aria-live="polite" aria-label="Gestion des cookies"
          className="fixed inset-x-3 bottom-3 z-[70] rounded-[28px] bg-ink p-6 text-white sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md">
          <p className="text-[15px] leading-[1.5] text-white/80">
            Nous utilisons des cookies de mesure d&apos;audience et publicitaires uniquement avec votre accord, pour
            comprendre l&apos;usage du site et mesurer nos campagnes.{" "}
            <Link href="/cookies" className="underline">En savoir plus</Link>
          </p>
          {custom && (
            <div className="mt-3 space-y-2 text-[15px] text-white/80">
              <label className="flex items-center gap-2"><input type="checkbox" checked disabled /> Nécessaires (toujours actifs)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.analytics} onChange={(e) => setDraft({ ...draft, analytics: e.target.checked })} /> Mesure d&apos;audience (Google Analytics)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.ads} onChange={(e) => setDraft({ ...draft, ads: e.target.checked })} /> Publicité (Google Ads)</label>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="pill-ghost px-3" onClick={() => save({ analytics: false, ads: false })}>Tout refuser</button>
            <button className="pill bg-white px-3 text-ink" onClick={() => save({ analytics: true, ads: true })}>Tout accepter</button>
          </div>
          <button className="mt-3 w-full text-[13px] text-ash underline underline-offset-4" onClick={() => (custom ? save(draft) : setCustom(true))}>
            {custom ? "Enregistrer mes choix" : "Personnaliser"}
          </button>
        </div>
      )}
    </>
  );
}

export function ConsentLink() {
  return (
    <button type="button" className="transition hover:text-ash" onClick={() => window.dispatchEvent(new Event("open-consent"))}>
      Gérer les cookies
    </button>
  );
}
