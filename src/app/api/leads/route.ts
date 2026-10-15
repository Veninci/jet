import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fieldErrors, leadSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { hashIp, leadReference } from "@/lib/crypto";
import { prospectConfirmation, salesNotification, sendMail } from "@/lib/email";
import { getPublicLeg } from "@/connectors/registry";
import { site } from "@/lib/config";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans quelques minutes ou appelez-nous." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    // Robot (pot de miel rempli) : on répond comme un succès sans rien enregistrer.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return NextResponse.json({ reference: "EL-OK" });
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;

  // Demande depuis une fiche : on fige l'offre telle qu'elle était affichée (preuve de ce que le client a vu).
  let offerId: string | undefined;
  let offerSnapshot: object | undefined;
  if (d.offerId) {
    const leg = await getPublicLeg(d.offerId);
    if (leg) {
      offerSnapshot = JSON.parse(JSON.stringify(leg));
      if (leg.provider === "manual" || leg.provider === "demo") offerId = leg.externalId;
    }
  }

  const lead = await prisma.lead.create({
    data: {
      reference: leadReference(),
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      departure: d.departure,
      arrival: d.arrival,
      departureDate: new Date(d.departureDate),
      returnDate: d.returnDate ? new Date(d.returnDate) : null,
      tripType: d.tripType,
      flexibilityDays: d.flexibilityDays,
      passengers: d.passengers,
      budget: d.budget ?? null,
      comments: d.comments ?? null,
      offerId: offerId ?? null,
      offerSnapshot,
      utmSource: d.utmSource,
      utmMedium: d.utmMedium,
      utmCampaign: d.utmCampaign,
      utmTerm: d.utmTerm,
      gclid: d.gclid,
      landingPage: d.landingPage,
      referrer: d.referrer,
      consentContact: true,
      consentAt: new Date(),
      ipHash: hashIp(ip),
      events: { create: { type: "created", payload: { channel: offerSnapshot ? "offer" : "form", offerKey: d.offerId } } },
    },
  });

  const mails = [prospectConfirmation(lead), salesNotification(lead, `${site.url}/admin/demandes/${lead.id}`)].filter(
    (m): m is NonNullable<typeof m> => m !== null,
  );
  const results = await Promise.all(mails.map(sendMail));
  const failed = results.filter((r) => !r.sent).map((r) => String(r.error));
  if (failed.length) {
    await prisma.leadEvent.create({ data: { leadId: lead.id, type: "email_not_sent", payload: { errors: failed } } });
  }

  return NextResponse.json({ reference: lead.reference }, { status: 201 });
}
