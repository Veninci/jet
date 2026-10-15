import { NextResponse, type NextRequest } from "next/server";
import { clientIp, createLead } from "@/lib/lead-service";

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const r = await createLead(raw, clientIp(req.headers), "web");
  if (r.ok) return NextResponse.json({ reference: r.reference }, { status: r.status });
  return NextResponse.json({ error: r.error, errors: r.errors }, { status: r.status });
}
