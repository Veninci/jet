import { json, preflight } from "@/lib/api";
import { clientIp, createLead } from "@/lib/lead-service";

export const OPTIONS = preflight;

/**
 * POST /api/v1/requests — demande de réservation (web ou mobile).
 * En-tête X-Client: "mobile" pour les demandes issues de l'app. Ce n'est PAS une réservation.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(req, { error: "JSON invalide" }, { status: 400 });
  }
  const channel = req.headers.get("x-client") === "mobile" ? "mobile" : "web";
  const r = await createLead(raw, clientIp(req.headers), channel);
  if (r.ok) {
    return json(req, { data: { reference: r.reference, status: "received", isBooking: false } }, { status: r.status });
  }
  return json(req, { error: r.error ?? "Données invalides", fields: r.errors }, { status: r.status });
}
