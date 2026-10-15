import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/validation";
import { leadPriority } from "@/lib/leads";

const future = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
const base = {
  departure: "Paris", arrival: "Nice", departureDate: future, tripType: "ONE_WAY", flexibilityDays: "1", passengers: "3",
  budget: "", firstName: "Alex", lastName: "Martin", email: "ALEX@EXAMPLE.COM", phone: "+33 6 12 34 56 78", consentContact: true,
};

describe("validation des demandes", () => {
  it("accepte une demande complète et normalise", () => {
    const r = leadSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("alex@example.com");
      expect(r.data.budget).toBeUndefined();
      expect(r.data.passengers).toBe(3);
    }
  });
  it("refuse sans consentement", () => expect(leadSchema.safeParse({ ...base, consentContact: false }).success).toBe(false));
  it("refuse une date passée", () => expect(leadSchema.safeParse({ ...base, departureDate: "2020-01-01" }).success).toBe(false));
  it("exige une date de retour en aller-retour", () => expect(leadSchema.safeParse({ ...base, tripType: "ROUND_TRIP" }).success).toBe(false));
  it("détecte le pot de miel", () => expect(leadSchema.safeParse({ ...base, website: "spam" }).success).toBe(false));
});

describe("priorité de traitement", () => {
  const now = new Date();
  it("une demande neuve à départ imminent passe devant une demande lointaine", () => {
    const soon = leadPriority({ status: "NEW", departureDate: new Date(now.getTime() + 2 * 86_400_000), createdAt: new Date(now.getTime() - 3 * 3_600_000), budget: 5000 }, now);
    const far = leadPriority({ status: "SEARCHING", departureDate: new Date(now.getTime() + 60 * 86_400_000), createdAt: now, budget: null }, now);
    expect(soon).toBeGreaterThan(far);
  });
  it("une demande close n'a pas de priorité", () =>
    expect(leadPriority({ status: "LOST", departureDate: now, createdAt: now, budget: 1 }, now)).toBe(0));
});
