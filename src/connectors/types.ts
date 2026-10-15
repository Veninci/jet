/**
 * Contrat commun à toutes les sources d'Empty Legs.
 * Chaque fournisseur déclare ce que ses conditions d'utilisation AUTORISENT ;
 * le reste de l'application applique ces règles (affichage, stockage, fraîcheur).
 */
export type ProviderId = "manual" | "demo" | "avinode";

export type ProviderPolicy = {
  /** Les résultats peuvent-ils être persistés en base ? (false = lecture à la volée uniquement) */
  mayStoreResults: boolean;
  /** Durée maximale de cache mémoire autorisée, en secondes (0 = aucun cache). */
  maxCacheSeconds: number;
  mayDisplayPrice: boolean;
  mayDisplayOperator: boolean;
  mayDisplayTailNumber: boolean;
  mayDisplayAircraftType: boolean;
  /** Mention d'attribution imposée par le fournisseur, affichée sous les résultats. */
  attribution?: string;
  /** Au-delà, un résultat n'est plus montré au public. */
  freshnessHours: number;
};

export type ProviderCapabilities = {
  search: boolean;
  getById: boolean;
  webhooks: boolean;
  submitRequest: boolean;
};

export type SearchQuery = {
  from?: { text?: string; icao?: string; lat?: number; lon?: number; radiusKm?: number };
  to?: { text?: string; icao?: string; lat?: number; lon?: number; radiusKm?: number };
  earliest: Date;
  latest: Date;
  passengers?: number;
};

export type EmptyLeg = {
  /** Identifiant global "<provider>:<id>" */
  key: string;
  provider: ProviderId;
  externalId: string;
  isDemo: boolean;
  from: { city: string; airport: string; icao?: string };
  to: { city: string; airport: string; icao?: string };
  departureStart: Date;
  departureEnd: Date;
  maxPassengers?: number;
  aircraftCategory?: string;
  aircraftType?: string;
  price?: { kind: "INDICATIVE" | "CONFIRMED"; amount: number; currency: string };
  conditions?: string;
  lastVerifiedAt: Date;
  /** Seul statut public possible : la disponibilité est TOUJOURS à confirmer auprès de l'opérateur. */
  status: "TO_CONFIRM" | "UNAVAILABLE";
};

export type ConnectorHealth = {
  configured: boolean;
  /** Détail lisible : ce qui manque ou le résultat du dernier test réel. */
  detail: string;
  missing: string[];
};

export interface EmptyLegConnector {
  id: ProviderId;
  label: string;
  policy: ProviderPolicy;
  capabilities: ProviderCapabilities;
  health(): ConnectorHealth;
  search(q: SearchQuery): Promise<EmptyLeg[]>;
  getById?(externalId: string): Promise<EmptyLeg | null>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string, missing: string[]) {
    super(`Connecteur ${provider} non configuré : ${missing.join(", ")}`);
  }
}
