import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { statusLabel } from "@/lib/leads";

const esc = (v: unknown) => {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  // Neutralise l'injection de formules dans les tableurs.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  const user = await requireUser("ADMIN");
  const leads = await prisma.lead.findMany({ include: { assignedTo: true, proposals: true }, orderBy: { createdAt: "desc" } });
  const header = ["reference", "recue_le", "statut", "prenom", "nom", "email", "telephone", "depart", "arrivee", "date_vol", "flex_jours", "passagers", "budget", "commercial", "source", "medium", "campagne", "propositions", "commission_attendue"];
  const rows = leads.map((l) => [
    l.reference, l.createdAt, statusLabel(l.status), l.firstName, l.lastName, l.email, l.phone, l.departure, l.arrival,
    l.departureDate.toISOString().slice(0, 10), l.flexibilityDays, l.passengers, l.budget, l.assignedTo?.name, l.utmSource, l.utmMedium, l.utmCampaign,
    l.proposals.length, l.proposals.reduce((s, p) => s + (p.commissionAmount ?? 0), 0),
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
  console.info(`[audit] export CSV de ${leads.length} demandes par ${user.email}`);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
