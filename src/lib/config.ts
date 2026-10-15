export const site = {
  // MACH — antériorités à vérifier (INPI/EUIPO) : des opérateurs charter « Mach Aviation » / « MachJet » existent.
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "MACH",
  tagline: "Empty Legs en jet privé",
  url: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  phone: process.env.NEXT_PUBLIC_SALES_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  /** Délai de réponse affiché aux clients : ne publier qu'un engagement tenable par l'équipe. */
  responseTime: process.env.NEXT_PUBLIC_RESPONSE_TIME ?? "dans les meilleurs délais",
};

export const isProduction = process.env.APP_ENV === "production";

/** Le catalogue fictif ne peut jamais s'afficher en production, quelle que soit la variable DEMO_CATALOG. */
export const demoCatalogEnabled = !isProduction && process.env.DEMO_CATALOG === "true";

/** Au-delà de ce délai sans vérification, une offre disparaît du catalogue public. */
export const DEFAULT_FRESHNESS_HOURS = 24;
