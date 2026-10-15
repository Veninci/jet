import Link from "next/link";
import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { LEAD_STATUSES, leadPriority, statusLabel, statusTone } from "@/lib/leads";
import { formatDate, formatDateTime, timeAgo } from "@/lib/format";

type SP = Record<string, string | undefined>;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireUser();
  const sp = await searchParams;
  const where: Prisma.LeadWhereInput = {};
  if (sp.status) where.status = sp.status as LeadStatus;
  if (sp.mine) where.assignedToId = me.id;
  if (sp.q) {
    const q = sp.q;
    where.OR = ["reference", "lastName", "firstName", "email", "phone", "departure", "arrival"].map((f) => ({ [f]: { contains: q, mode: "insensitive" } }));
  }
  const [leads, counts, commission] = await Promise.all([
    prisma.lead.findMany({ where, include: { assignedTo: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.proposal.aggregate({ _sum: { commissionAmount: true }, where: { status: { in: ["SENT", "ACCEPTED"] } } }),
  ]);
  const now = new Date();
  const sorted = sp.sort === "recent" ? leads : [...leads].sort((a, b) => leadPriority(b, now) - leadPriority(a, now));
  const count = (s: LeadStatus) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl">Demandes</h1>
        {me.role === "ADMIN" && <a href="/admin/export" className="btn-ghost py-2 text-xs">Exporter CSV</a>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {LEAD_STATUSES.map((s) => (
          <Link key={s.value} href={`/admin?status=${s.value}`} className={`rounded-lg border bg-white p-3 ${sp.status === s.value ? "border-ink" : "border-line"}`}>
            <p className="text-xs text-mist">{s.label}</p><p className="text-2xl font-semibold">{count(s.value)}</p>
          </Link>
        ))}
        <div className="rounded-lg border border-line bg-white p-3">
          <p className="text-xs text-mist">Commissions en jeu</p>
          <p className="text-2xl font-semibold">{(commission._sum.commissionAmount ?? 0).toLocaleString("fr-FR")} €</p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-2 text-sm">
        <input name="q" defaultValue={sp.q} placeholder="Rechercher (nom, réf., trajet…)" className="field max-w-xs py-2" />
        <select name="status" defaultValue={sp.status ?? ""} className="field w-auto py-2">
          <option value="">Tous statuts</option>
          {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select name="sort" defaultValue={sp.sort ?? "priority"} className="field w-auto py-2">
          <option value="priority">Priorité de traitement</option>
          <option value="recent">Plus récentes</option>
        </select>
        <label className="flex items-center gap-2 px-2"><input type="checkbox" name="mine" value="1" defaultChecked={Boolean(sp.mine)} /> Mes demandes</label>
        <button className="btn-primary py-2">Filtrer</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line text-xs text-mist uppercase">
            <tr><th className="p-3">Réf.</th><th className="p-3">Prospect</th><th className="p-3">Trajet</th><th className="p-3">Date vol</th><th className="p-3">Pax / budget</th><th className="p-3">Statut</th><th className="p-3">Commercial</th><th className="p-3">Source</th><th className="p-3">Reçue</th></tr>
          </thead>
          <tbody>
            {sorted.map((l) => (
              <tr key={l.id} className="border-b border-line/60 hover:bg-ivory">
                <td className="p-3 font-mono text-xs"><Link className="underline" href={`/admin/demandes/${l.id}`}>{l.reference}</Link></td>
                <td className="p-3">{l.firstName} {l.lastName}<div className="text-xs text-mist">{l.phone}</div></td>
                <td className="p-3">{l.departure} → {l.arrival}{l.offerId && <div className="text-xs text-gold-deep">depuis une fiche vol</div>}{l.channel === "mobile" && <div className="text-xs text-indigo-700">app mobile</div>}</td>
                <td className="p-3">{formatDate(l.departureDate)}{l.flexibilityDays ? ` ±${l.flexibilityDays}j` : ""}</td>
                <td className="p-3">{l.passengers} pax<div className="text-xs text-mist">{l.budget ? `${l.budget.toLocaleString("fr-FR")} €` : "—"}</div></td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${statusTone(l.status)}`}>{statusLabel(l.status)}</span>
                  {l.nextActionAt && <div className={`mt-1 text-xs ${l.nextActionAt < now ? "text-red-700" : "text-mist"}`}>↻ {formatDateTime(l.nextActionAt)}</div>}</td>
                <td className="p-3 text-xs">{l.assignedTo?.name ?? <span className="text-red-700">Non attribuée</span>}</td>
                <td className="p-3 text-xs">{l.utmSource ?? (l.referrer ? `réf. ${l.referrer}` : "direct")}{l.utmCampaign && <div className="text-mist">{l.utmCampaign}</div>}</td>
                <td className="p-3 text-xs text-mist">{timeAgo(l.createdAt)}</td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-mist">Aucune demande.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
