import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { SESSION_COOKIE, verifySession } from "./session";

/** Vérifie la session ET l'état du compte en base (un compte désactivé perd l'accès immédiatement). */
export async function requireUser(role?: "ADMIN") {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) redirect("/admin/login");
  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user || !user.active) redirect("/admin/login");
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/admin?denied=1");
  return user;
}
