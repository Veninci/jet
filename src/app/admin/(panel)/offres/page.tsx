import Link from "next/link";
import { prisma } from "@/lib/db";
import { offerAction } from "../../actions";
import { formatDateTime, timeAgo } from "@/lib/format";
import { isPubliclyShowable } from "@/connectors/policy";
import { manualConnector } from "@/connectors/manual";

export default async function OffersPage() {
  const offers = await prisma.offer.findMany({ orderBy: [{ isDemo: "asc" }, { departureStart: "asc" }], include: { _count: { select: { leads: true } } } });
  const now = new Date();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Offres Empty Leg</h1>
        <Link href="/admin/offres/nouvelle" className="btn-primary py-2">Nouvelle offre</Link>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-ink-soft">Uniquement des offres obtenues par un canal autorisé (opérateur, plateforme dont les conditions permettent la diffusion). Une offre n&apos;est visible que si elle est publiée, future et vérifiée depuis moins de {manualConnector.policy.freshnessHours} h.</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line text-xs text-mist uppercase"><tr><th className="p-3">Trajet</th><th className="p-3">Créneau</th><th className="p-3">Vérifiée</th><th className="p-3">Visible</th><th className="p-3">Demandes</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {offers.map((o) => {
              const visible = o.published && isPubliclyShowable(o, manualConnector.policy, now);
              return (
                <tr key={o.id} className="border-b border-line/60">
                  <td className="p-3"><Link className="underline" href={`/admin/offres/${o.id}`}>{o.fromCity} → {o.toCity}</Link>{o.isDemo && <span className="ml-2 rounded bg-red-100 px-1.5 text-xs text-red-800">FICTIF</span>}</td>
                  <td className="p-3 text-xs">{formatDateTime(o.departureStart)} – {formatDateTime(o.departureEnd)}</td>
                  <td className="p-3 text-xs">{timeAgo(o.lastVerifiedAt)}</td>
                  <td className="p-3 text-xs">{visible ? "✅ oui" : o.status === "UNAVAILABLE" ? "Indisponible" : o.published ? "⚠️ non (périmée)" : "Brouillon"}</td>
                  <td className="p-3">{o._count.leads}</td>
                  <td className="p-3">
                    <form action={offerAction} className="flex flex-wrap gap-1">
                      <input type="hidden" name="id" value={o.id} />
                      <button name="action" value="verify" className="btn-ghost px-2 py-1 text-xs">Revérifiée</button>
                      <button name="action" value={o.published ? "unpublish" : "publish"} className="btn-ghost px-2 py-1 text-xs">{o.published ? "Dépublier" : "Publier"}</button>
                      <button name="action" value="unavailable" className="btn-ghost px-2 py-1 text-xs">Plus dispo</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {offers.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-mist">Aucune offre.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
