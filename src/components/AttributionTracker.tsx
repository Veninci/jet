"use client";
import { useEffect } from "react";
import { readAttribution, readConsent, writeAttribution } from "@/lib/analytics";

/**
 * Mémorise la source d'arrivée pendant la session (sessionStorage, effacé à la fermeture de l'onglet)
 * pour l'associer à la demande que le visiteur envoie lui-même.
 * Le gclid (identifiant publicitaire) n'est conservé qu'avec le consentement "publicité".
 */
export function AttributionTracker() {
  useEffect(() => {
    const current = readAttribution();
    if (current.landingPage) return;
    const p = new URLSearchParams(window.location.search);
    const consent = readConsent();
    writeAttribution({
      utmSource: p.get("utm_source") ?? undefined,
      utmMedium: p.get("utm_medium") ?? undefined,
      utmCampaign: p.get("utm_campaign") ?? undefined,
      utmTerm: p.get("utm_term") ?? undefined,
      gclid: consent?.ads ? (p.get("gclid") ?? undefined) : undefined,
      landingPage: window.location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
    });
  }, []);
  return null;
}
