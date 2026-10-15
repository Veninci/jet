import { describe, expect, it } from "vitest";
import { isPubliclyShowable, redactForPublic } from "@/connectors/policy";
import { mapAvinodeEmptyLeg } from "@/connectors/avinode";
import type { EmptyLeg, ProviderPolicy } from "@/connectors/types";

const now = new Date("2026-10-15T12:00:00Z");
const h = (n: number) => new Date(now.getTime() + n * 3_600_000);
const leg: EmptyLeg = {
  key: "x:1", provider: "manual", externalId: "1", isDemo: false,
  from: { city: "Paris", airport: "LFPB" }, to: { city: "Nice", airport: "LFMN" },
  departureStart: h(24), departureEnd: h(28), lastVerifiedAt: h(-2), status: "TO_CONFIRM",
  aircraftType: "CJ3", price: { kind: "INDICATIVE", amount: 5000, currency: "EUR" },
};
const policy: ProviderPolicy = { mayStoreResults: false, maxCacheSeconds: 0, mayDisplayPrice: false, mayDisplayOperator: false, mayDisplayTailNumber: false, mayDisplayAircraftType: false, freshnessHours: 24 };

describe("règles de publication", () => {
  it("affiche une offre fraîche et future", () => expect(isPubliclyShowable(leg, policy, now)).toBe(true));
  it("masque une offre non revérifiée depuis plus que la fenêtre", () =>
    expect(isPubliclyShowable({ ...leg, lastVerifiedAt: h(-25) }, policy, now)).toBe(false));
  it("masque une offre dont le créneau est passé", () =>
    expect(isPubliclyShowable({ ...leg, departureEnd: h(-1) }, policy, now)).toBe(false));
  it("masque une offre indisponible", () => expect(isPubliclyShowable({ ...leg, status: "UNAVAILABLE" }, policy, now)).toBe(false));
  it("retire prix et appareil si le fournisseur l'interdit", () => {
    const r = redactForPublic(leg, policy);
    expect(r.price).toBeUndefined();
    expect(r.aircraftType).toBeUndefined();
  });
});

describe("mapping Avinode (défensif)", () => {
  it("ignore un résultat sans champs obligatoires plutôt que de deviner", () => {
    expect(mapAvinodeEmptyLeg({ id: "a" })).toBeNull();
  });
  it("ne mappe jamais d'opérateur ni de prix", () => {
    const r = mapAvinodeEmptyLeg({
      id: "a", departureAirport: { icao: "LFPB" }, arrivalAirport: { icao: "LFMN" },
      earliestDeparture: "2026-10-20T08:00:00Z", latestDeparture: "2026-10-20T12:00:00Z",
      operator: { name: "Secret Air" }, price: 1000,
    }, now);
    expect(r).not.toBeNull();
    expect(JSON.stringify(r)).not.toContain("Secret Air");
    expect(r!.price).toBeUndefined();
    expect(r!.status).toBe("TO_CONFIRM");
  });
});
