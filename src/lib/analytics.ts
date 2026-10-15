"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type ConsentState = { analytics: boolean; ads: boolean; at: string };
export const CONSENT_KEY = "el_consent_v1";

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

/**
 * Évènements de conversion. Envoyés uniquement si l'utilisateur a consenti (gtag n'est chargé qu'après).
 *  - search_flights : recherche dans le catalogue / formulaire d'accueil
 *  - generate_lead : demande envoyée (conversion principale Google Ads)
 *  - qualified_lead : à importer côté serveur (conversions hors ligne) quand un commercial qualifie le prospect
 */
export function track(event: "search_flights" | "generate_lead" | "view_flight" | "click_call", params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;
  if (event === "generate_lead" && adsId && label) {
    window.gtag("event", "conversion", { send_to: `${adsId}/${label}`, transaction_id: params.reference });
  }
}

const ATTR_KEY = "el_attr";
export type Attribution = Partial<Record<"utmSource" | "utmMedium" | "utmCampaign" | "utmTerm" | "gclid" | "landingPage" | "referrer", string>>;

export function readAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}

export function writeAttribution(a: Attribution) {
  try {
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(a));
  } catch {
    /* stockage indisponible : l'attribution est simplement perdue */
  }
}
