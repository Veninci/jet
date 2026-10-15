import type { LeadStatus } from "@prisma/client";

export const LEAD_STATUSES: { value: LeadStatus; label: string; tone: string }[] = [
  { value: "NEW", label: "Nouveau prospect", tone: "bg-sky-100 text-sky-900" },
  { value: "TO_CALL", label: "À rappeler", tone: "bg-amber-100 text-amber-900" },
  { value: "SEARCHING", label: "En cours de recherche", tone: "bg-violet-100 text-violet-900" },
  { value: "PROPOSAL_SENT", label: "Proposition envoyée", tone: "bg-indigo-100 text-indigo-900" },
  { value: "CONFIRMED", label: "Réservation confirmée", tone: "bg-emerald-100 text-emerald-900" },
  { value: "LOST", label: "Perdu", tone: "bg-stone-200 text-stone-700" },
];

export const statusLabel = (s: LeadStatus) => LEAD_STATUSES.find((x) => x.value === s)?.label ?? s;
export const statusTone = (s: LeadStatus) => LEAD_STATUSES.find((x) => x.value === s)?.tone ?? "";

/**
 * Score de priorité de traitement (plus haut = rappeler d'abord).
 * Règle simple et explicable : départ proche, demande récente non traitée, budget renseigné.
 */
export function leadPriority(
  lead: { status: LeadStatus; departureDate: Date; createdAt: Date; budget: number | null },
  now = new Date(),
) {
  if (lead.status === "CONFIRMED" || lead.status === "LOST") return 0;
  const daysToDeparture = (lead.departureDate.getTime() - now.getTime()) / 86_400_000;
  const hoursSinceCreated = (now.getTime() - lead.createdAt.getTime()) / 3_600_000;
  let score = 0;
  if (daysToDeparture < 0) score += 0;
  else if (daysToDeparture <= 3) score += 50;
  else if (daysToDeparture <= 10) score += 30;
  else if (daysToDeparture <= 30) score += 15;
  else score += 5;
  if (lead.status === "NEW") score += hoursSinceCreated > 2 ? 30 : 20;
  if (lead.status === "TO_CALL") score += 15;
  if (lead.budget) score += 10;
  return score;
}
