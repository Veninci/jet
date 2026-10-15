"use server";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { LeadStatus, ProposalStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { offerSchema, fieldErrors } from "@/lib/validation";
import { LEAD_STATUSES } from "@/lib/leads";
import { setSetting, getSetting } from "@/lib/settings";
import { getConnector } from "@/connectors/registry";
import type { ProviderId } from "@/connectors/types";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", 12);

// ---------- Authentification ----------
export async function login(_: unknown, fd: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000)) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  const email = s(fd, "email").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Comparaison effectuée même si l'utilisateur n'existe pas (temps de réponse constant).
  const ok = await bcrypt.compare(s(fd, "password"), user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.active) return { error: "Identifiants incorrects." };
  (await cookies()).set(SESSION_COOKIE, await signSession({ uid: user.id, role: user.role, name: user.name }), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- Demandes ----------
async function logEvent(leadId: string, actorId: string, type: string, payload?: object) {
  await prisma.leadEvent.create({ data: { leadId, actorId, type, payload } });
}

export async function updateLeadStatus(fd: FormData) {
  const user = await requireUser();
  const id = s(fd, "id");
  const status = s(fd, "status") as LeadStatus;
  if (!LEAD_STATUSES.some((x) => x.value === status)) return;
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id }, include: { proposals: true } });
  // Garde-fou : "Réservation confirmée" exige une proposition acceptée ET confirmée par l'opérateur.
  if (status === "CONFIRMED" && !lead.proposals.some((p) => p.status === "ACCEPTED" && p.operatorConfirmed)) {
    redirect(`/admin/demandes/${id}?error=confirm`);
  }
  await prisma.lead.update({ where: { id }, data: { status } });
  await logEvent(id, user.id, "status_changed", { from: lead.status, to: status });
  revalidatePath(`/admin/demandes/${id}`);
}

export async function assignLead(fd: FormData) {
  const user = await requireUser();
  const id = s(fd, "id");
  const assignedToId = s(fd, "assignedToId") || null;
  await prisma.lead.update({ where: { id }, data: { assignedToId } });
  await logEvent(id, user.id, "assigned", { to: assignedToId });
  revalidatePath(`/admin/demandes/${id}`);
}

export async function setNextAction(fd: FormData) {
  const user = await requireUser();
  const id = s(fd, "id");
  const v = s(fd, "nextActionAt");
  await prisma.lead.update({ where: { id }, data: { nextActionAt: v ? new Date(v) : null } });
  await logEvent(id, user.id, "next_action_set", { at: v || null });
  revalidatePath(`/admin/demandes/${id}`);
}

export async function addNote(fd: FormData) {
  const user = await requireUser();
  const id = s(fd, "id");
  const body = s(fd, "body").slice(0, 5000);
  if (!body) return;
  await prisma.leadNote.create({ data: { leadId: id, authorId: user.id, body } });
  await logEvent(id, user.id, "note_added");
  revalidatePath(`/admin/demandes/${id}`);
}

export async function addProposal(fd: FormData) {
  const user = await requireUser();
  const leadId = s(fd, "id");
  const price = Number(s(fd, "priceAmount"));
  if (!s(fd, "title") || !Number.isFinite(price) || price <= 0) redirect(`/admin/demandes/${leadId}?error=proposal`);
  const commission = s(fd, "commissionAmount") ? Number(s(fd, "commissionAmount")) : null;
  const p = await prisma.proposal.create({
    data: {
      leadId,
      title: s(fd, "title"),
      operatorName: s(fd, "operatorName") || null,
      aircraft: s(fd, "aircraft") || null,
      priceAmount: Math.round(price),
      commissionAmount: commission != null && Number.isFinite(commission) ? Math.round(commission) : null,
      validUntil: s(fd, "validUntil") ? new Date(s(fd, "validUntil")) : null,
      createdById: user.id,
    },
  });
  await logEvent(leadId, user.id, "proposal_created", { proposalId: p.id, price: p.priceAmount, commission: p.commissionAmount });
  revalidatePath(`/admin/demandes/${leadId}`);
}

export async function updateProposal(fd: FormData) {
  const user = await requireUser();
  const id = s(fd, "proposalId");
  const status = s(fd, "status") as ProposalStatus;
  const operatorConfirmed = fd.get("operatorConfirmed") === "on";
  const p = await prisma.proposal.update({ where: { id }, data: { status, operatorConfirmed } });
  await logEvent(p.leadId, user.id, "proposal_updated", { proposalId: id, status, operatorConfirmed });
  if (status === "SENT") {
    const lead = await prisma.lead.findUniqueOrThrow({ where: { id: p.leadId } });
    if (["NEW", "TO_CALL", "SEARCHING"].includes(lead.status)) {
      await prisma.lead.update({ where: { id: p.leadId }, data: { status: "PROPOSAL_SENT" } });
      await logEvent(p.leadId, user.id, "status_changed", { from: lead.status, to: "PROPOSAL_SENT", auto: true });
    }
  }
  revalidatePath(`/admin/demandes/${p.leadId}`);
}

// ---------- Offres manuelles ----------
export async function saveOffer(_: unknown, fd: FormData) {
  await requireUser();
  const parsed = offerSchema.safeParse({
    ...Object.fromEntries(fd.entries()),
    showAircraft: fd.get("showAircraft") === "on",
    published: fd.get("published") === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const data = {
    ...d,
    fromIcao: d.fromIcao?.toUpperCase(),
    toIcao: d.toIcao?.toUpperCase(),
    departureStart: new Date(d.departureStart),
    departureEnd: new Date(d.departureEnd),
    priceAmount: d.priceKind === "ON_REQUEST" ? null : d.priceAmount,
  };
  const id = s(fd, "id");
  if (id) await prisma.offer.update({ where: { id }, data: { ...data, lastVerifiedAt: new Date() } });
  else await prisma.offer.create({ data: { ...data, source: "manual", lastVerifiedAt: new Date() } });
  revalidatePath("/admin/offres");
  redirect("/admin/offres");
}

export async function offerAction(fd: FormData) {
  await requireUser();
  const id = s(fd, "id");
  const action = s(fd, "action");
  if (action === "verify") await prisma.offer.update({ where: { id }, data: { lastVerifiedAt: new Date(), status: "TO_CONFIRM" } });
  if (action === "unavailable") await prisma.offer.update({ where: { id }, data: { status: "UNAVAILABLE", published: false } });
  if (action === "publish") await prisma.offer.update({ where: { id }, data: { published: true } });
  if (action === "unpublish") await prisma.offer.update({ where: { id }, data: { published: false } });
  revalidatePath("/admin/offres");
}

// ---------- Intégrations ----------
export async function setProviderVerified(fd: FormData) {
  await requireUser("ADMIN");
  const id = s(fd, "provider") as ProviderId;
  const verified = (await getSetting<Record<string, boolean>>("providers.verified")) ?? {};
  verified[id] = fd.get("verified") === "on";
  await setSetting("providers.verified", verified);
  revalidatePath("/admin/integrations");
}

export async function testProvider(_: unknown, fd: FormData) {
  await requireUser("ADMIN");
  const c = getConnector(s(fd, "provider") as ProviderId);
  if (!c) return { ok: false, message: "Connecteur inconnu" };
  const h = c.health();
  if (!h.configured) return { ok: false, message: `Non configuré — manquant : ${h.missing.join(", ")}` };
  const now = new Date();
  try {
    const legs = await c.search({ earliest: now, latest: new Date(now.getTime() + 7 * 86_400_000) });
    return { ok: true, message: `Réponse reçue : ${legs.length} résultat(s) exploitable(s) sur 7 jours. Vérifiez le mapping avant d'activer.` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ---------- Utilisateurs ----------
export async function createUser(_: unknown, fd: FormData) {
  await requireUser("ADMIN");
  const email = s(fd, "email").toLowerCase();
  const password = s(fd, "password");
  if (!email.includes("@") || password.length < 12) return { error: "E-mail valide et mot de passe de 12 caractères minimum requis." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "Cet e-mail existe déjà." };
  await prisma.user.create({
    data: { email, name: s(fd, "name") || email, role: s(fd, "role") === "ADMIN" ? "ADMIN" : "SALES", passwordHash: await bcrypt.hash(password, 12) },
  });
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function toggleUser(fd: FormData) {
  const me = await requireUser("ADMIN");
  const id = s(fd, "id");
  if (id === me.id) return; // on ne se désactive pas soi-même
  const u = await prisma.user.findUniqueOrThrow({ where: { id } });
  await prisma.user.update({ where: { id }, data: { active: !u.active } });
  revalidatePath("/admin/utilisateurs");
}
