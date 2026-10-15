/**
 * Données de DÉMONSTRATION uniquement. Toutes les offres sont marquées isDemo=true :
 * elles ne s'affichent que si DEMO_CATALOG=true et APP_ENV != production, avec la mention « FICTIF ».
 */
import { PrismaClient } from "@prisma/client";

if (process.env.APP_ENV === "production") {
  console.error("Refus : le seed de démonstration ne s'exécute pas en production.");
  process.exit(1);
}

const prisma = new PrismaClient();
const day = 86_400_000;
const at = (days: number, hour: number) => {
  const d = new Date(Date.now() + days * day);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
};

const demo = [
  ["Paris", "Paris – Le Bourget", "LFPB", "Nice", "Nice Côte d'Azur", "LFMN", 2, 7, 4, "Light jet", "Citation CJ3 (exemple)", 4900],
  ["Nice", "Nice Côte d'Azur", "LFMN", "Paris", "Paris – Le Bourget", "LFPB", 3, 15, 7, "Midsize jet", "Learjet 60 (exemple)", 6200],
  ["Genève", "Genève", "LSGG", "Paris", "Paris – Le Bourget", "LFPB", 5, 9, 6, "Light jet", "Phenom 300 (exemple)", null],
  ["Paris", "Paris – Le Bourget", "LFPB", "Rome", "Rome – Ciampino", "LIRA", 6, 11, 8, "Super midsize jet", "Challenger 350 (exemple)", 8900],
  ["Londres", "Londres – Farnborough", "EGLF", "Ibiza", "Ibiza", "LEIB", 9, 10, 6, "Light jet", null, 7400],
] as const;

await prisma.offer.deleteMany({ where: { isDemo: true } });
for (const [fc, fa, fi, tc, ta, ti, d, h, pax, cat, type, price] of demo) {
  await prisma.offer.create({
    data: {
      source: "demo", isDemo: true, published: true,
      fromCity: fc, fromAirport: fa, fromIcao: fi, toCity: tc, toAirport: ta, toIcao: ti,
      departureStart: at(d, h), departureEnd: at(d, h + 4), maxPassengers: pax,
      aircraftCategory: cat, aircraftType: type ?? undefined, showAircraft: Boolean(type),
      priceKind: price ? "INDICATIVE" : "ON_REQUEST", priceAmount: price ?? undefined,
      conditions: "DONNÉE FICTIVE DE DÉMONSTRATION — aucun vol réel.",
      provenance: "Seed de démonstration (fictif)",
      lastVerifiedAt: new Date(),
    },
  });
}
console.log(`${demo.length} offres FICTIVES de démonstration créées.`);
await prisma.$disconnect();
