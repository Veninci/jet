import { prisma } from "@/lib/db";
import type { Offer } from "@prisma/client";
import type { EmptyLeg, EmptyLegConnector, SearchQuery } from "./types";

export function offerToEmptyLeg(o: Offer): EmptyLeg {
  return {
    key: `${o.isDemo ? "demo" : "manual"}:${o.id}`,
    provider: o.isDemo ? "demo" : "manual",
    externalId: o.id,
    isDemo: o.isDemo,
    from: { city: o.fromCity, airport: o.fromAirport, icao: o.fromIcao ?? undefined },
    to: { city: o.toCity, airport: o.toAirport, icao: o.toIcao ?? undefined },
    departureStart: o.departureStart,
    departureEnd: o.departureEnd,
    maxPassengers: o.maxPassengers ?? undefined,
    aircraftCategory: o.aircraftCategory ?? undefined,
    aircraftType: o.showAircraft ? (o.aircraftType ?? undefined) : undefined,
    price:
      o.priceKind !== "ON_REQUEST" && o.priceAmount != null
        ? { kind: o.priceKind, amount: o.priceAmount, currency: o.currency }
        : undefined,
    conditions: o.conditions ?? undefined,
    lastVerifiedAt: o.lastVerifiedAt,
    status: o.status,
  };
}

function textMatch(hay: string[], needle?: string) {
  if (!needle) return true;
  const n = needle.toLowerCase();
  return hay.some((h) => h.toLowerCase().includes(n));
}

function dbConnector(isDemo: boolean): EmptyLegConnector {
  return {
    id: isDemo ? "demo" : "manual",
    label: isDemo ? "Catalogue de démonstration (fictif)" : "Offres saisies par l'équipe",
    // Offres saisies par nos soins : c'est à l'équipe de vérifier que la source autorise leur diffusion.
    policy: {
      mayStoreResults: true,
      maxCacheSeconds: 60,
      mayDisplayPrice: true,
      mayDisplayOperator: false,
      mayDisplayTailNumber: false,
      mayDisplayAircraftType: true,
      freshnessHours: 24,
    },
    capabilities: { search: true, getById: true, webhooks: false, submitRequest: false },
    health: () => ({ configured: true, detail: "Base de données locale", missing: [] }),
    async search(q: SearchQuery) {
      const rows = await prisma.offer.findMany({
        where: {
          isDemo,
          published: true,
          departureEnd: { gte: q.earliest },
          departureStart: { lte: q.latest },
        },
        orderBy: { departureStart: "asc" },
        take: 200,
      });
      return rows
        .filter((o) => textMatch([o.fromCity, o.fromAirport, o.fromIcao ?? ""], q.from?.text))
        .filter((o) => textMatch([o.toCity, o.toAirport, o.toIcao ?? ""], q.to?.text))
        .filter((o) => !q.passengers || !o.maxPassengers || o.maxPassengers >= q.passengers)
        .map(offerToEmptyLeg);
    },
    async getById(id: string) {
      const o = await prisma.offer.findFirst({ where: { id, isDemo, published: true } });
      return o ? offerToEmptyLeg(o) : null;
    },
  };
}

export const manualConnector = dbConnector(false);
export const demoConnector = dbConnector(true);
