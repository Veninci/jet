import type { EmptyLeg, ProviderPolicy } from "./types";

/** Une offre n'est publiable que si elle est fraîche, future et non marquée indisponible. */
export function isPubliclyShowable(leg: Pick<EmptyLeg, "lastVerifiedAt" | "departureEnd" | "status">, policy: Pick<ProviderPolicy, "freshnessHours">, now = new Date()) {
  if (leg.status !== "TO_CONFIRM") return false;
  if (leg.departureEnd.getTime() < now.getTime()) return false;
  const ageH = (now.getTime() - leg.lastVerifiedAt.getTime()) / 3_600_000;
  return ageH >= 0 && ageH <= policy.freshnessHours;
}

/** Retire les champs que le fournisseur interdit d'afficher. Appliqué AVANT tout rendu public. */
export function redactForPublic(leg: EmptyLeg, policy: ProviderPolicy): EmptyLeg {
  return {
    ...leg,
    aircraftType: policy.mayDisplayAircraftType ? leg.aircraftType : undefined,
    price: policy.mayDisplayPrice ? leg.price : undefined,
  };
}
