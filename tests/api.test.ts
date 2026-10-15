import { describe, expect, it } from "vitest";
import { toFlightDTO } from "@/lib/api";
import type { PublicLeg } from "@/connectors/registry";

const leg: PublicLeg = {
  key: "manual:abc", provider: "manual", externalId: "abc", isDemo: true,
  from: { city: "Paris", airport: "Paris – Le Bourget", icao: "LFPB" }, to: { city: "Nice", airport: "Nice Côte d'Azur", icao: "LFMN" },
  departureStart: new Date("2026-10-20T07:00:00Z"), departureEnd: new Date("2026-10-20T11:00:00Z"),
  lastVerifiedAt: new Date("2026-10-15T10:00:00Z"), status: "TO_CONFIRM", maxPassengers: 4,
  price: { kind: "INDICATIVE", amount: 4900, currency: "EUR" },
};

describe("contrat API v1", () => {
  it("expose un statut toujours à confirmer et le marqueur démo", () => {
    const d = toFlightDTO(leg);
    expect(d.status).toBe("to_confirm");
    expect(d.isDemo).toBe(true);
    expect(d.price).toEqual({ amount: 4900, currency: "EUR", kind: "indicative" });
  });
  it("fournit une image de destination", () => {
    expect(toFlightDTO(leg).image.url).toMatch(/^https?:\/\//);
  });
  it("prix absent → null (prix sur demande)", () => {
    expect(toFlightDTO({ ...leg, price: undefined }).price).toBeNull();
  });
});
