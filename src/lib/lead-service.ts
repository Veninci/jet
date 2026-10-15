import { prisma } from "./db";
import { hashIp, leadReference } from "./crypto";
import { fieldErrors, leadSchema } from "./validation";
import { prospectConfirmation, salesNotification, sendMail } from "./email";
import { rateLimit } from "./rate-limit";
import { site } from "./config";
import { getPublicLeg } from "@/connectors/registry";

export type CreateLeadResult =
  | { ok: true; reference: string; status: 201 | 200 }
  | { ok: false; status: 400 | 422 | 429; error?: string; errors?: Record<string, string> };

/**
 * Point d'entrée unique de création d'une demande, partagé par le site web et l'app mobile.
 * Toute règle métier (validation, anti-abus, instantané de l'offre, e-mails) vit ici.
 */
export async function createLead(raw: unknown, ip: string, channel: "web" | "mobile"): Promise<CreateLeadResult> {
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60_000)) {
    return { ok: false, status: 429, error: "Trop de demandes. Réessayez dans quelques minutes ou appelez-nous." };
  }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    // Robot (pot de miel rempli) : réponse identique à un succès, rien n'est enregistré.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true, reference: "EL-OK", status: 200 };
    return { ok: false, status: 422, errors: fieldErrors(parsed.error) };
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
      channel,
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
      cabinBags: d.cabinBags ?? null,
      holdBags: d.holdBags ?? null,
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
      events: { create: { type: "created", payload: { channel, source: offerSnapshot ? "offer" : "form", offerKey: d.offerId } } },
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
  return { ok: true, reference: lead.reference, status: 201 };
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
