/**
 * Pages d'itinéraires rédigées à la main. Règle : une page n'est créée que si son contenu
 * apporte une information utile propre (aéroports, contraintes, durée). Pas de génération en masse.
 * Durées et distances : ordres de grandeur, à faire relire par un professionnel avant publication.
 */
export type RoutePage = {
  slug: string;
  navLabel: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  from: { city: string; airports: string[] };
  to: { city: string; airports: string[] };
  facts: { label: string; value: string }[];
  sections: { h2: string; body: string }[];
  searchFrom: string;
  searchTo: string;
};

export const routePages: RoutePage[] = [
  {
    slug: "paris-nice",
    navLabel: "Jet privé Paris – Nice",
    title: "Empty Leg Paris – Nice en jet privé",
    metaDescription:
      "Vols Empty Leg entre Paris et Nice / Côte d'Azur : aéroports, durée de vol, conseils. Déposez votre demande, un conseiller vous recontacte.",
    h1: "Jet privé Paris – Nice : les Empty Legs vers la Côte d'Azur",
    intro:
      "Paris – Côte d'Azur est l'une des liaisons d'aviation d'affaires les plus fréquentées de France, en particulier d'avril à septembre et lors des grands évènements de la région. Ce trafic génère régulièrement des repositionnements dans les deux sens.",
    from: { city: "Paris", airports: ["Paris – Le Bourget (LFPB)", "Paris – Orly (LFPO)", "Paris – CDG (LFPG)"] },
    to: { city: "Nice", airports: ["Nice Côte d'Azur (LFMN)", "Cannes – Mandelieu (LFMD)", "Saint-Tropez – La Môle (LFTZ)"] },
    facts: [
      { label: "Distance", value: "≈ 690 km" },
      { label: "Temps de vol", value: "≈ 1 h 15 à 1 h 30" },
      { label: "Appareils courants", value: "Jets légers et intermédiaires" },
    ],
    sections: [
      {
        h2: "Quand trouver des Empty Legs Paris – Nice ?",
        body: "Les retours à vide vers Paris sont fréquents après les départs du week-end vers la Côte d'Azur, et inversement en début de semaine. La saison estivale et les évènements (festival de Cannes, Grand Prix de Monaco) augmentent le nombre de vols, mais aussi la demande : une flexibilité d'un ou deux jours augmente nettement vos chances.",
      },
      {
        h2: "Quel aéroport choisir à l'arrivée ?",
        body: "Nice Côte d'Azur accueille tous les types de jets. Cannes – Mandelieu est plus proche de Cannes mais soumis à des restrictions selon la taille de l'appareil et les horaires. Saint-Tropez – La Môle est très contraint (piste courte, saisonnalité). Votre conseiller vérifie la compatibilité de l'appareil avec l'aéroport souhaité.",
      },
    ],
    searchFrom: "Paris",
    searchTo: "Nice",
  },
  {
    slug: "paris-geneve",
    navLabel: "Jet privé Paris – Genève",
    title: "Empty Leg Paris – Genève en jet privé",
    metaDescription:
      "Empty Legs entre Paris et Genève : aéroports, temps de vol, saison de ski. Demande gratuite et sans engagement, réponse d'un conseiller.",
    h1: "Jet privé Paris – Genève : Empty Legs vers la Suisse et les Alpes",
    intro:
      "Genève est à la fois une place d'affaires et la porte d'entrée des stations alpines. La liaison avec Paris est courte et très régulière, ce qui en fait une route propice aux repositionnements.",
    from: { city: "Paris", airports: ["Paris – Le Bourget (LFPB)", "Paris – Orly (LFPO)"] },
    to: { city: "Genève", airports: ["Genève (LSGG)", "Chambéry – Savoie (LFLB)", "Annecy – Mont-Blanc (LFLP)"] },
    facts: [
      { label: "Distance", value: "≈ 410 km" },
      { label: "Temps de vol", value: "≈ 1 h" },
      { label: "Saison forte", value: "Décembre à avril" },
    ],
    sections: [
      {
        h2: "La saison de ski et les Empty Legs",
        body: "En hiver, de nombreux jets déposent leurs passagers le samedi à Genève ou Chambéry et repartent à vide. À l'inverse, les fins de séjour génèrent des positionnements vers les Alpes. Indiquez une plage de dates : c'est le principal levier pour obtenir un tarif intéressant.",
      },
      {
        h2: "Genève, Chambéry ou Annecy ?",
        body: "Genève offre le plus grand choix de vols. Chambéry et Annecy rapprochent de certaines stations mais imposent des contraintes (piste, horaires, météo de montagne). Le choix dépend de votre destination finale et de l'appareil proposé.",
      },
    ],
    searchFrom: "Paris",
    searchTo: "Genève",
  },
  {
    slug: "france-italie",
    navLabel: "Empty Leg France – Italie",
    title: "Empty Leg France – Italie : Paris, Rome, Milan en jet privé",
    metaDescription:
      "Vols Empty Leg entre la France et l'Italie : Paris – Rome, Paris – Milan, Nice – Olbia. Aéroports d'affaires, durées, conseils pour réserver.",
    h1: "Empty Legs France – Italie en jet privé",
    intro:
      "Rome, Milan, la Toscane et la Sardaigne figurent parmi les destinations d'aviation d'affaires les plus demandées au départ de France. Les flux saisonniers vers la Sardaigne et la côte amalfitaine créent de nombreux repositionnements l'été.",
    from: { city: "Paris / Nice", airports: ["Paris – Le Bourget (LFPB)", "Nice Côte d'Azur (LFMN)"] },
    to: { city: "Rome / Milan", airports: ["Rome – Ciampino (LIRA)", "Milan – Linate (LIML)", "Olbia – Costa Smeralda (LIEO)"] },
    facts: [
      { label: "Paris – Rome", value: "≈ 1 100 km · ≈ 2 h" },
      { label: "Paris – Milan", value: "≈ 640 km · ≈ 1 h 15" },
      { label: "Saison forte", value: "Mai à septembre" },
    ],
    sections: [
      {
        h2: "Les aéroports d'affaires en Italie",
        body: "À Rome, l'aviation d'affaires se concentre principalement sur Ciampino, plus proche du centre que Fiumicino. À Milan, Linate est le plus pratique pour la ville. En Sardaigne, Olbia dessert la Costa Smeralda et connaît des pics de trafic très marqués en été.",
      },
      {
        h2: "Être flexible sur l'aéroport augmente vos chances",
        body: "Un Empty Leg vers Pise peut convenir pour Florence, un vol vers Nice pour la Riviera italienne. Indiquez-nous votre destination finale : nous étudions aussi les aéroports alternatifs raisonnables.",
      },
    ],
    searchFrom: "Paris",
    searchTo: "Rome",
  },
];

export function getRoutePage(slug: string) {
  return routePages.find((r) => r.slug === slug);
}
