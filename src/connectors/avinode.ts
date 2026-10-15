/**
 * Connecteur Avinode Marketplace — NON TESTÉ (aucun identifiant disponible à ce jour).
 *
 * Ce qui est connu (documentation publique developer.avinodegroup.com, consultée via extraits le 2026-10-15) :
 *  - L'accès API exige une adhésion Avinode Marketplace valide + acceptation des API Terms.
 *  - Use case "End Client Empty Leg Search" : recherche par aéroport et fenêtre temporelle.
 *  - Use case "End Client Empty Leg Subscription" : "watch" (POST) + webhooks (POST /webhooks/settings),
 *    évènement "EmptyLegs" à la création / mise à jour / dépublication, puis GET /emptylegs/{id}
 *    (404 = dépubliée par l'opérateur).
 *  - Un backend est obligatoire ; le jeton API ne doit pas être exposé ni configurable par l'utilisateur.
 *  - Nom d'opérateur et immatriculation INTERDITS dans un résultat public initial.
 *  - Attribution Avinode obligatoire (API Branding Guidelines).
 *  - Les données ne peuvent être revendues ni partagées avec des tiers.
 *
 * À CONFIRMER une fois l'accès sandbox obtenu (marqué TODO(avinode)) :
 *  - noms exacts des en-têtes d'authentification et de version ;
 *  - chemin et paramètres de l'opération de recherche ;
 *  - schéma de réponse (mapping ci-dessous volontairement défensif : un champ obligatoire absent = résultat ignoré) ;
 *  - politique de conservation / cache des résultats ;
 *  - autorisation d'afficher le prix et le type d'appareil.
 */
import type { ConnectorHealth, EmptyLeg, EmptyLegConnector, SearchQuery } from "./types";
import { ProviderNotConfiguredError } from "./types";

const REQUIRED_ENV = ["AVINODE_API_BASE", "AVINODE_API_TOKEN", "AVINODE_BEARER_TOKEN", "AVINODE_PRODUCT_HEADER"] as const;

function missingEnv() {
  return REQUIRED_ENV.filter((k) => !process.env[k]);
}

function headers(): Record<string, string> {
  // TODO(avinode): vérifier les noms d'en-têtes dans la référence API (accès membre requis).
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Avinode-ApiToken": process.env.AVINODE_API_TOKEN!,
    Authorization: `Bearer ${process.env.AVINODE_BEARER_TOKEN!}`,
    "X-Avinode-SentTimestamp": new Date().toISOString(),
    "X-Avinode-ApiVersion": "v1.0",
    "X-Avinode-Product": process.env.AVINODE_PRODUCT_HEADER!,
  };
  if (process.env.AVINODE_ACT_AS_ACCOUNT) h["X-Avinode-ActAsAccount"] = process.env.AVINODE_ACT_AS_ACCOUNT;
  return h;
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const missing = missingEnv();
  if (missing.length) throw new ProviderNotConfiguredError("avinode", missing);
  const res = await fetch(`${process.env.AVINODE_API_BASE!.replace(/\/$/, "")}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null as T;
  if (!res.ok) throw new Error(`Avinode ${method} ${path} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

type Json = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

/** Mapping défensif — TODO(avinode): aligner sur le schéma réel de la réponse. */
export function mapAvinodeEmptyLeg(raw: Json, now = new Date()): EmptyLeg | null {
  const id = str(raw.id);
  const dep = (raw.departureAirport ?? raw.from) as Json | undefined;
  const arr = (raw.arrivalAirport ?? raw.to) as Json | undefined;
  const earliest = str(raw.earliestDeparture ?? raw.departureTimeFrom);
  const latest = str(raw.latestDeparture ?? raw.departureTimeTo) ?? earliest;
  if (!id || !dep || !arr || !earliest || !latest) return null;
  const depIcao = str(dep.icao);
  const arrIcao = str(arr.icao);
  const start = new Date(earliest);
  const end = new Date(latest);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const aircraft = (raw.aircraft ?? {}) as Json;
  return {
    key: `avinode:${id}`,
    provider: "avinode",
    externalId: id,
    isDemo: false,
    from: { city: str(dep.city) ?? depIcao ?? "?", airport: str(dep.name) ?? depIcao ?? "?", icao: depIcao },
    to: { city: str(arr.city) ?? arrIcao ?? "?", airport: str(arr.name) ?? arrIcao ?? "?", icao: arrIcao },
    departureStart: start,
    departureEnd: end,
    maxPassengers: num(aircraft.maxPassengers ?? raw.seats),
    aircraftCategory: str(aircraft.category ?? aircraft.aircraftClass),
    aircraftType: str(aircraft.type ?? aircraft.typeName),
    // Prix ignoré tant que les conditions d'affichage ne sont pas confirmées.
    price: undefined,
    // Volontairement aucun champ opérateur / immatriculation (interdits en résultat public).
    lastVerifiedAt: now, // donnée lue en direct à l'instant
    status: "TO_CONFIRM",
  };
}

export const avinodeConnector: EmptyLegConnector = {
  id: "avinode",
  label: "Avinode Marketplace",
  policy: {
    mayStoreResults: false, // prudence tant que les API Terms n'ont pas été lus
    maxCacheSeconds: 300,
    mayDisplayPrice: false,
    mayDisplayOperator: false,
    mayDisplayTailNumber: false,
    mayDisplayAircraftType: false,
    attribution: "Données Empty Legs fournies via Avinode Marketplace", // TODO(avinode): formulation des Branding Guidelines
    freshnessHours: 1,
  },
  capabilities: { search: true, getById: true, webhooks: true, submitRequest: false },
  health(): ConnectorHealth {
    const missing = missingEnv();
    return missing.length
      ? { configured: false, missing, detail: "Identifiants absents : adhésion Avinode + accès API requis." }
      : { configured: true, missing: [], detail: "Identifiants présents — mapping non validé sur une réponse réelle." };
  },
  async search(q: SearchQuery) {
    // TODO(avinode): chemin et corps exacts de l'opération de recherche Empty Leg.
    const body = {
      departureAirport: q.from?.icao,
      arrivalAirport: q.to?.icao,
      departureRadiusKm: q.from?.radiusKm,
      arrivalRadiusKm: q.to?.radiusKm,
      timeFrom: q.earliest.toISOString(),
      timeTo: q.latest.toISOString(),
      passengers: q.passengers,
    };
    const data = await call<{ data?: Json[] } | Json[] | null>("POST", "/emptylegs/search", body);
    const rows = Array.isArray(data) ? data : (data?.data ?? []);
    const now = new Date();
    return rows.map((r) => mapAvinodeEmptyLeg(r, now)).filter((x): x is EmptyLeg => x !== null);
  },
  async getById(id: string) {
    const raw = await call<Json | null>("GET", `/emptylegs/${encodeURIComponent(id)}`);
    return raw ? mapAvinodeEmptyLeg((raw.data as Json) ?? raw) : null;
  },
};
