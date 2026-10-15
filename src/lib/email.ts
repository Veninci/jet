import { site } from "./config";
import { formatDate } from "./format";

type Mail = { to: string; subject: string; text: string; replyTo?: string };

/**
 * Envoi via l'API HTTP Resend si RESEND_API_KEY est défini ; sinon journalisation console
 * (mode développement). Un échec d'envoi ne doit jamais faire perdre la demande : il est loggé.
 */
export async function sendMail(mail: Mail): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info(`[email:dev] → ${mail.to} | ${mail.subject}\n${mail.text}`);
    return { sent: false, error: "RESEND_API_KEY non configurée" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text, reply_to: mail.replyTo }),
    });
    if (!res.ok) return { sent: false, error: `Resend ${res.status}: ${await res.text()}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

type LeadMail = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departure: string;
  arrival: string;
  departureDate: Date;
  passengers: number;
  budget: number | null;
  flexibilityDays: number;
  tripType: string;
  comments: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
};

export function prospectConfirmation(l: LeadMail): Mail {
  return {
    to: l.email,
    subject: `Votre demande ${l.reference} – ${l.departure} → ${l.arrival}`,
    text: [
      `Bonjour ${l.firstName},`,
      "",
      `Nous avons bien reçu votre demande ${l.reference} :`,
      `${l.departure} → ${l.arrival}, ${formatDate(l.departureDate)} (±${l.flexibilityDays} j), ${l.passengers} passager(s).`,
      "",
      "Un conseiller étudie les vols compatibles auprès d'opérateurs certifiés et vous recontacte.",
      "Important : cette demande n'est pas une réservation. Aucun vol n'est réservé ni garanti tant que",
      "vous n'avez pas reçu et accepté une proposition écrite confirmée par l'opérateur.",
      "",
      `— L'équipe ${site.name}`,
    ].join("\n"),
  };
}

export function salesNotification(l: LeadMail, adminUrl: string): Mail | null {
  const to = process.env.SALES_NOTIFICATION_EMAIL;
  if (!to) return null;
  return {
    to,
    replyTo: l.email,
    subject: `[Nouvelle demande] ${l.departure} → ${l.arrival} · ${formatDate(l.departureDate)} · ${l.passengers} pax`,
    text: [
      `Réf. ${l.reference}`,
      `${l.firstName} ${l.lastName} · ${l.phone} · ${l.email}`,
      `${l.tripType === "ROUND_TRIP" ? "Aller-retour" : "Aller simple"} ${l.departure} → ${l.arrival}`,
      `Date : ${formatDate(l.departureDate)} (±${l.flexibilityDays} j) · ${l.passengers} pax · Budget : ${l.budget ? `${l.budget} €` : "non précisé"}`,
      l.comments ? `Commentaire : ${l.comments}` : "",
      `Source : ${l.utmSource ?? "direct"}${l.utmCampaign ? ` / ${l.utmCampaign}` : ""}`,
      "",
      adminUrl,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
