/**
 * Photothèque. Toutes les images listées sont publiées sous licence Unsplash gratuite
 * (pages marquées « Free Photo on Unsplash », vérifiées via moteur de recherche le 15/10/2026 ;
 * à revérifier sur chaque page avant mise en production — exclure tout contenu « Unsplash+ »).
 *
 * Elles sont chargées depuis Unsplash. Pour la production, recommandé : télécharger chaque
 * fichier dans /public/media/ et remplacer `src` par le chemin local (performances, stabilité).
 * Une variable NEXT_PUBLIC_MEDIA_BASE permet de pointer vers un CDN.
 */
export type Photo = { id: string; alt: string; credit: string; page: string; src: string };

const base = process.env.NEXT_PUBLIC_MEDIA_BASE;
const unsplash = (id: string, w = 2400) =>
  base ? `${base.replace(/\/$/, "")}/${id}.jpg` : `https://unsplash.com/photos/${id}/download?w=${w}`;

function photo(id: string, alt: string, credit: string, slug: string): Photo {
  return { id, alt, credit, page: `https://unsplash.com/photos/${slug}-${id}`, src: unsplash(id) };
}

export const media = {
  heroJet: photo("6w_dYdazo20", "Jet privé sur le tarmac au coucher du soleil", "Chris Leipelt / Unsplash", "private-jet-on-tarmac-at-sunset"),
  jetApron: photo("vr7QkWk6bzM", "Jet d'affaires stationné sur l'aire de trafic", "Niklas Jonasson / Unsplash", "a-private-jet-sitting-on-the-tarmac-of-an-airport"),
  jetMono: photo("xG2mO6FRCjQ", "Jet privé en noir et blanc", "John McArthur / Unsplash", "black-and-white-private-jet"),
  window: photo("MmWHVAdZm-c", "Vue sur la Méditerranée à travers un hublot", "Unsplash", "a-window-reveals-a-beautiful-mediterranean-view"),
  amalfi: photo("1zkHXas1GIo", "Façades colorées sur la falaise d'Amalfi", "Unsplash", "colorful-buildings-on-amalfi-cliffside"),
  coastTown: photo("yOFRcF5hJGg", "Village côtier surplombant la mer", "Unsplash", "coastal-town-nestled-on-a-hillside-overlooking-the-sea"),
  cliffs: photo("nuPh77zWqlA", "Village bâti dans les falaises au bord de la mer", "Unsplash", "coastal-town-built-into-steep-cliffs-with-caves-and-sea"),
  village: photo("kAE6Kd7W2UA", "Maisons de village au bord de l'océan", "Unsplash", "landscape-photo-of-village-houses-near-ocean"),
  geneva: photo("bFDLzdLHjHo", "Vue aérienne de Genève", "Anokhi De Silva / Unsplash", "aerial-photo-of-city-near-sea"),
} satisfies Record<string, Photo>;

/** Photo associée à une destination (par ville). Repli : jet sur le tarmac. */
const byCity: Record<string, Photo> = {
  nice: media.window,
  cannes: media.window,
  "saint-tropez": media.coastTown,
  monaco: media.coastTown,
  genève: media.geneva,
  geneve: media.geneva,
  rome: media.amalfi,
  naples: media.amalfi,
  olbia: media.cliffs,
  ibiza: media.village,
  mykonos: media.cliffs,
  paris: media.jetApron,
  londres: media.jetMono,
};

export function photoForCity(city: string): Photo {
  const key = city.toLowerCase().normalize("NFC").trim();
  return byCity[key] ?? media.heroJet;
}
