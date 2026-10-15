import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const links = [
    { href: "/admin", label: "Demandes" },
    { href: "/admin/offres", label: "Offres" },
    ...(user.role === "ADMIN"
      ? [{ href: "/admin/integrations", label: "Intégrations & paramètres" }, { href: "/admin/utilisateurs", label: "Utilisateurs" }]
      : []),
  ];
  return (
    <div className="min-h-dvh bg-[#f4f2ee]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
          <span className="font-display text-xl">Admin</span>
          <nav className="flex flex-wrap gap-4">
            {links.map((l) => <Link key={l.href} href={l.href} className="text-ink-soft hover:text-ink">{l.label}</Link>)}
          </nav>
          <form action={logout} className="ml-auto flex items-center gap-3">
            <span className="text-mist">{user.name} · {user.role === "ADMIN" ? "Administrateur" : "Commercial"}</span>
            <button className="underline">Déconnexion</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
