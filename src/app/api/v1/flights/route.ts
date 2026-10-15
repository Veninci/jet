import { json, preflight, toFlightDTO } from "@/lib/api";
import { searchPublic } from "@/connectors/registry";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

/** GET /api/v1/flights?from=Paris&to=Nice&date=2026-10-20&pax=3 */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const date = p.get("date");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(req, { error: "date au format AAAA-MM-JJ" }, { status: 400 });
  const pax = p.get("pax") ? Number(p.get("pax")) : undefined;
  if (pax !== undefined && (!Number.isInteger(pax) || pax < 1 || pax > 19)) return json(req, { error: "pax entre 1 et 19" }, { status: 400 });
  const now = new Date();
  const center = date ? new Date(`${date}T12:00:00Z`) : null;
  const earliest = center ? new Date(Math.max(now.getTime(), center.getTime() - 3 * 86_400_000)) : now;
  const latest = center ? new Date(center.getTime() + 3 * 86_400_000) : new Date(now.getTime() + 60 * 86_400_000);
  const { legs } = await searchPublic({
    from: { text: p.get("from") ?? undefined },
    to: { text: p.get("to") ?? undefined },
    earliest,
    latest,
    passengers: pax,
  });
  return json(req, { data: legs.map(toFlightDTO), meta: { count: legs.length, window: { earliest, latest }, generatedAt: now } }, { cache: "public, max-age=30" });
}
