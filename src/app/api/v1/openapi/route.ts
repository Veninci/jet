import { json, preflight } from "@/lib/api";
import { site } from "@/lib/config";

export const OPTIONS = preflight;

const Airport = { type: "object", required: ["city", "airport", "icao"], properties: { city: { type: "string" }, airport: { type: "string" }, icao: { type: ["string", "null"] } } };

const Flight = {
  type: "object",
  required: ["id", "isDemo", "status", "from", "to", "departureWindow", "price", "image", "lastVerifiedAt"],
  properties: {
    id: { type: "string", example: "manual:clx123" },
    isDemo: { type: "boolean", description: "true = donnée FICTIVE, à signaler clairement à l'utilisateur" },
    status: { type: "string", enum: ["to_confirm"], description: "Toujours à confirmer auprès de l'opérateur" },
    from: Airport,
    to: Airport,
    departureWindow: { type: "object", properties: { start: { type: "string", format: "date-time" }, end: { type: "string", format: "date-time" }, timezone: { type: "string" } } },
    maxPassengers: { type: ["integer", "null"] },
    aircraft: { type: "object", properties: { category: { type: ["string", "null"] }, type: { type: ["string", "null"] } } },
    price: { oneOf: [{ type: "null" }, { type: "object", properties: { amount: { type: "integer" }, currency: { type: "string" }, kind: { type: "string", enum: ["indicative", "operator"] } } }] },
    conditions: { type: ["string", "null"] },
    lastVerifiedAt: { type: "string", format: "date-time" },
    image: { type: "object", properties: { url: { type: "string" }, alt: { type: "string" }, credit: { type: "string" } } },
    attribution: { type: ["string", "null"] },
  },
};

const RequestBody = {
  type: "object",
  required: ["departure", "arrival", "departureDate", "passengers", "firstName", "lastName", "email", "phone", "consentContact"],
  properties: {
    offerId: { type: "string", description: "id du vol (Flight.id) si la demande porte sur un vol affiché" },
    departure: { type: "string" }, arrival: { type: "string" },
    departureDate: { type: "string", format: "date" }, returnDate: { type: "string", format: "date" },
    tripType: { type: "string", enum: ["ONE_WAY", "ROUND_TRIP"], default: "ONE_WAY" },
    flexibilityDays: { type: "integer", minimum: 0, maximum: 14 },
    passengers: { type: "integer", minimum: 1, maximum: 19 },
    cabinBags: { type: "integer", minimum: 0 }, holdBags: { type: "integer", minimum: 0 },
    budget: { type: "integer", minimum: 0 },
    firstName: { type: "string" }, lastName: { type: "string" },
    email: { type: "string", format: "email" }, phone: { type: "string" },
    comments: { type: "string" },
    consentContact: { type: "boolean", const: true, description: "Case à cocher explicite, non pré-cochée" },
    utmSource: { type: "string" }, utmMedium: { type: "string" }, utmCampaign: { type: "string" },
  },
};

const spec = {
  openapi: "3.1.0",
  info: { title: `${site.name} API`, version: "1.0.0", description: "API publique partagée par le site web et l'application mobile." },
  servers: [{ url: `${site.url}/api/v1` }],
  paths: {
    "/flights": {
      get: {
        summary: "Lister les Empty Legs publiables",
        parameters: [
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
          { name: "date", in: "query", schema: { type: "string", format: "date" }, description: "Fenêtre ± 3 jours" },
          { name: "pax", in: "query", schema: { type: "integer", minimum: 1, maximum: 19 } },
        ],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: Flight }, meta: { type: "object" } } } } } } },
      },
    },
    "/flights/{id}": {
      get: {
        summary: "Détail d'un vol",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Flight.id encodé (encodeURIComponent)" }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: Flight } } } } }, "404": { description: "Introuvable ou plus disponible" } },
      },
    },
    "/requests": {
      post: {
        summary: "Envoyer une demande de réservation (pas une réservation)",
        parameters: [{ name: "X-Client", in: "header", schema: { type: "string", enum: ["mobile", "web"] } }],
        requestBody: { required: true, content: { "application/json": { schema: RequestBody } } },
        responses: {
          "201": { description: "Reçue", content: { "application/json": { schema: { type: "object", properties: { data: { type: "object", properties: { reference: { type: "string" }, status: { const: "received" }, isBooking: { const: false } } } } } } } },
          "422": { description: "Champs invalides : { error, fields: { champ: message } }" },
          "429": { description: "Trop de demandes" },
        },
      },
    },
    "/config": { get: { summary: "Marque, contacts, liens légaux, FAQ, image d'accueil", responses: { "200": { description: "OK" } } } },
  },
};

export async function GET(req: Request) {
  return json(req, spec, { cache: "public, max-age=3600" });
}
