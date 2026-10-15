import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { toggleUser } from "../../actions";
import { UserForm } from "./UserForm";

export default async function UsersPage() {
  const me = await requireUser("ADMIN");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, include: { _count: { select: { leads: true } } } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Utilisateurs</h1>
      <UserForm />
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-mist uppercase"><tr><th className="p-3">Nom</th><th className="p-3">E-mail</th><th className="p-3">Rôle</th><th className="p-3">Demandes</th><th className="p-3">État</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id} className="border-b border-line/60">
              <td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.role === "ADMIN" ? "Administrateur" : "Commercial"}</td><td className="p-3">{u._count.leads}</td>
              <td className="p-3">{u.id === me.id ? "Vous" : (
                <form action={toggleUser}><input type="hidden" name="id" value={u.id} /><button className="btn-ghost px-2 py-1 text-xs">{u.active ? "Désactiver" : "Réactiver"}</button></form>
              )}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
