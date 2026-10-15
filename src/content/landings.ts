/**
 * Pages d'atterrissage Google Ads : message aligné sur le groupe d'annonces, formulaire immédiatement visible.
 * Non indexées (noindex) pour éviter le contenu dupliqué avec les pages SEO.
 */
export type Landing = { slug: string; headline: string; sub: string; prefill?: { departure?: string; arrival?: string } };

export const landings: Landing[] = [
  {
    slug: "empty-leg",
    headline: "Empty Legs en jet privé, à tarif réduit",
    sub: "Des trajets de jets privés à tarif réduit. Indiquez votre trajet, un conseiller vous recontacte.",
  },
  {
    slug: "jet-prive-paris-nice",
    headline: "Jet privé Paris – Nice à prix réduit",
    sub: "Vols Empty Leg entre Paris et la Côte d'Azur. Demande gratuite, réponse personnalisée.",
    prefill: { departure: "Paris", arrival: "Nice" },
  },
  {
    slug: "vol-prive-derniere-minute",
    headline: "Vol privé de dernière minute",
    sub: "Les Empty Legs sont souvent publiés quelques jours avant le départ. Dites-nous où vous allez.",
  },
];

export const getLanding = (slug: string) => landings.find((l) => l.slug === slug);
