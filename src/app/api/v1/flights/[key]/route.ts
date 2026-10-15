import { json, preflight, toFlightDTO } from "@/lib/api";
import { getPublicLeg } from "@/connectors/registry";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const leg = await getPublicLeg(decodeURIComponent((await params).key));
  if (!leg) return json(req, { error: "Vol introuvable ou plus disponible" }, { status: 404 });
  return json(req, { data: toFlightDTO(leg) }, { cache: "public, max-age=30" });
}
