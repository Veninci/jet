export const site = {
  // Nom provisoire : à valider (recherche d'antériorité INPI/EUIPO) avant tout dépôt ou campagne.
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Aelys",
  tagline: "Empty Legs en jet privé",
  url: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  phone: process.env.NEXT_PUBLIC_SALES_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
};

export const isProduction = process.env.APP_ENV === "production";

/** Le catalogue fictif ne peut jamais s'afficher en production, quelle que soit la variable DEMO_CATALOG. */
export const demoCatalogEnabled = !isProduction && process.env.DEMO_CATALOG === "true";

/** Au-delà de ce délai sans vérification, une offre disparaît du catalogue public. */
export const DEFAULT_FRESHNESS_HOURS = 24;
