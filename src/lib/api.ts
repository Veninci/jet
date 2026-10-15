import { NextResponse } from "next/server";
import type { PublicLeg } from "@/connectors/registry";
import { photoForCity } from "@/content/media";

/**
 * Origines navigateur autorisées (Expo Web, prévisualisation Rork…). Les apps natives iOS/Android
 * ne sont pas soumises au CORS. Liste séparée par des virgules dans API_CORS_ORIGINS.
 */
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (process.env.API_CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = origin && (allowed.includes("*") || allowed.includes(origin));
  return ok
    ? {
        "Access-Control-Allow-Origin": origin!,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Client",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      }
    : { Vary: "Origin" };
}

export function json(req: Request, body: unknown, init: { status?: number; cache?: string } = {}) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { ...corsHeaders(req.headers.get("origin")), "Cache-Control": init.cache ?? "no-store" },
  });
}

export function preflight(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

/** Format public stable (v1) d'un vol, identique pour le web et le mobile. */
export type FlightDTO = {
  id: string;
  isDemo: boolean;
  status: "to_confirm";
  from: { city: string; airport: string; icao: string | null };
  to: { city: string; airport: string; icao: string | null };
  departureWindow: { start: string; end: string; timezone: "Europe/Paris" };
  maxPassengers: number | null;
  aircraft: { category: string | null; type: string | null };
  price: { amount: number; currency: string; kind: "indicative" | "operator" } | null;
  conditions: string | null;
  lastVerifiedAt: string;
  image: { url: string; alt: string; credit: string };
  attribution: string | null;
};

export function toFlightDTO(l: PublicLeg): FlightDTO {
  const img = photoForCity(l.to.city);
  return {
    id: l.key,
    isDemo: l.isDemo,
    status: "to_confirm",
    from: { city: l.from.city, airport: l.from.airport, icao: l.from.icao ?? null },
    to: { city: l.to.city, airport: l.to.airport, icao: l.to.icao ?? null },
    departureWindow: { start: l.departureStart.toISOString(), end: l.departureEnd.toISOString(), timezone: "Europe/Paris" },
    maxPassengers: l.maxPassengers ?? null,
    aircraft: { category: l.aircraftCategory ?? null, type: l.aircraftType ?? null },
    price: l.price ? { amount: l.price.amount, currency: l.price.currency, kind: l.price.kind === "CONFIRMED" ? "operator" : "indicative" } : null,
    conditions: l.conditions ?? null,
    lastVerifiedAt: l.lastVerifiedAt.toISOString(),
    image: { url: img.src, alt: img.alt, credit: img.credit },
    attribution: l.attribution ?? null,
  };
}
