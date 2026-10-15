import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { LEAD_STATUSES, statusLabel, statusTone } from "@/lib/leads";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { addNote, addProposal, assignLead, setNextAction, updateLeadStatus, updateProposal } from "../../../actions";

const EVENT_LABELS: Record<string, string> = {
  created: "Demande reçue",
  status_changed: "Statut modifié",
  assigned: "Attribution",
  note_added: "Note ajoutée",
  proposal_created: "Proposition créée",
  proposal_updated: "Proposition mise à jour",
  next_action_set: "Relance planifiée",
  email_not_sent: "E-mail non envoyé",
  exported: "Export",
};

const PROPOSAL_STATUS = { DRAFT: "Brouillon", SENT: "Envoyée", ACCEPTED: "Acceptée par le client", DECLINED: "Refusée", EXPIRED: "Expirée" } as const;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function LeadDetail({ params, searchParams }: Props) {
  await requireUser();
  const { id } = await params;
  const { error } = await searchParams;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      events: { include: { actor: true }, orderBy: { createdAt: "desc" } },
      proposals: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) notFound();
  const users = await prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const snap = lead.offerSnapshot as { key?: string; isDemo?: boolean } | null;

  return (
    <div>
      <Link href="/admin" className="text-sm underline">← Demandes</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{lead.firstName} {lead.lastName}</h1>
        <span className="font-mono text-sm text-mist">{lead.reference}</span>
        <span className={`rounded-full px-2 py-1 text-xs ${statusTone(lead.status)}`}>{statusLabel(lead.status)}</span>
      </div>
      {error === "confirm" && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">Impossible de passer en « Réservation confirmée » : il faut une proposition acceptée par le client ET confirmée par écrit par l&apos;opérateur.</p>}
      {error === "proposal" && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">Proposition incomplète : intitulé et prix requis.</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-medium">Demande</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-mist">Trajet</dt><dd>{lead.departure} → {lead.arrival} ({lead.tripType === "ROUND_TRIP" ? "aller-retour" : "aller simple"})</dd></div>
              <div><dt className="text-xs text-mist">Dates</dt><dd>{formatDate(lead.departureDate)}{lead.returnDate ? ` → ${formatDate(lead.returnDate)}` : ""} · flex ±{lead.flexibilityDays} j</dd></div>
              <div><dt className="text-xs text-mist">Passagers</dt><dd>{lead.passengers}</dd></div>
              <div><dt className="text-xs text-mist">Budget</dt><dd>{lead.budget ? formatMoney(lead.budget) : "Non précisé"}</dd></div>
              <div><dt className="text-xs text-mist">E-mail</dt><dd><a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
              <div><dt className="text-xs text-mist">Téléphone</dt><dd><a className="underline" href={`tel:${lead.phone.replace(/\s/g, "")}`}>{lead.phone}</a></dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-mist">Commentaires</dt><dd className="whitespace-pre-wrap">{lead.comments ?? "—"}</dd></div>
              {snap && <div className="sm:col-span-2"><dt className="text-xs text-mist">Offre consultée</dt><dd className="font-mono text-xs">{snap.key}{snap.isDemo ? " (FICTIVE — démo)" : ""}</dd></div>}
              <div className="sm:col-span-2"><dt className="text-xs text-mist">Acquisition</dt><dd className="text-xs">
                source={lead.utmSource ?? "—"} · medium={lead.utmMedium ?? "—"} · campagne={lead.utmCampaign ?? "—"} · terme={lead.utmTerm ?? "—"} · gclid={lead.gclid ? "oui" : "non"} · entrée={lead.landingPage ?? "—"} · référent={lead.referrer ?? "—"}
              </dd></div>
              <div className="sm:col-span-2 text-xs text-mist">Consentement contact : {lead.consentAt ? formatDateTime(lead.consentAt) : "—"}</div>
            </dl>
          </section>

          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-medium">Propositions commerciales</h2>
            <div className="mt-3 space-y-3">
              {lead.proposals.map((p) => (
                <form key={p.id} action={updateProposal} className="rounded-md border border-line p-3 text-sm">
                  <input type="hidden" name="proposalId" value={p.id} />
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{p.title}</strong>
                    <span>{formatMoney(p.priceAmount, p.currency)} · commission {p.commissionAmount != null ? formatMoney(p.commissionAmount, p.currency) : "—"}</span>
                  </div>
                  <p className="text-xs text-mist">{[p.operatorName, p.aircraft].filter(Boolean).join(" · ") || "Opérateur / appareil non renseignés"}{p.validUntil ? ` · valable jusqu'au ${formatDateTime(p.validUntil)}` : ""}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <select name="status" defaultValue={p.status} className="field w-auto py-1.5 text-sm">
                      {Object.entries(PROPOSAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="operatorConfirmed" defaultChecked={p.operatorConfirmed} /> Confirmée par écrit par l&apos;opérateur</label>
                    <button className="btn-ghost py-1.5 text-xs">Enregistrer</button>
                  </div>
                </form>
              ))}
            </div>
            <form action={addProposal} className="mt-4 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
              <input type="hidden" name="id" value={lead.id} />
              <input name="title" placeholder="Intitulé (ex. LFPB → LFMN, Citation CJ3)" className="field py-2 sm:col-span-2" required />
              <input name="operatorName" placeholder="Opérateur" className="field py-2" />
              <input name="aircraft" placeholder="Appareil" className="field py-2" />
              <input name="priceAmount" type="number" min={1} placeholder="Prix client TTC (€)" className="field py-2" required />
              <input name="commissionAmount" type="number" min={0} placeholder="Commission attendue (€)" className="field py-2" />
              <label className="text-xs text-mist sm:col-span-2">Validité de l&apos;offre<input name="validUntil" type="datetime-local" className="field mt-1 py-2" /></label>
              <button className="btn-primary py-2 sm:col-span-2">Ajouter la proposition</button>
            </form>
          </section>

          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-medium">Notes internes</h2>
            <form action={addNote} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <textarea name="body" rows={3} className="field" placeholder="Compte rendu d'appel, contraintes, préférences…" required />
              <button className="btn-primary self-start py-2">Ajouter</button>
            </form>
            <ul className="mt-4 space-y-3 text-sm">
              {lead.notes.map((n) => (
                <li key={n.id} className="border-l-2 border-gold/50 pl-3"><p className="whitespace-pre-wrap">{n.body}</p><p className="mt-1 text-xs text-mist">{n.author?.name ?? "—"} · {formatDateTime(n.createdAt)}</p></li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-line bg-white p-5 text-sm">
            <h2 className="font-medium">Suivi</h2>
            <form action={updateLeadStatus} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <select name="status" defaultValue={lead.status} className="field py-2">{LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
              <button className="btn-primary py-2">OK</button>
            </form>
            <form action={assignLead} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <select name="assignedToId" defaultValue={lead.assignedToId ?? ""} className="field py-2">
                <option value="">Non attribuée</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button className="btn-primary py-2">OK</button>
            </form>
            <form action={setNextAction} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <input type="datetime-local" name="nextActionAt" aria-label="Prochaine relance" className="field py-2" defaultValue={lead.nextActionAt ? new Date(lead.nextActionAt.getTime() - lead.nextActionAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} />
              <button className="btn-primary py-2">OK</button>
            </form>
          </section>
          <section className="rounded-lg border border-line bg-white p-5 text-sm">
            <h2 className="font-medium">Historique</h2>
            <ol className="mt-3 space-y-2">
              {lead.events.map((e) => (
                <li key={e.id} className="text-xs">
                  <span className="text-mist">{formatDateTime(e.createdAt)}</span> — {EVENT_LABELS[e.type] ?? e.type}
                  {e.actor && <span className="text-mist"> par {e.actor.name}</span>}
                  {e.type === "status_changed" && e.payload && typeof e.payload === "object" && "to" in e.payload && <span> → {statusLabel(String((e.payload as { to: string }).to) as never)}</span>}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
