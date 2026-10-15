import { requireUser } from "@/lib/auth";
import { allConnectors } from "@/connectors/registry";
import { getSetting } from "@/lib/settings";
import { demoCatalogEnabled, isProduction, site } from "@/lib/config";
import { setProviderVerified } from "../../actions";
import { TestButton } from "./TestButton";

const yes = (b: boolean) => (b ? "✅" : "—");

export default async function IntegrationsPage() {
  await requireUser("ADMIN");
  const verified = (await getSetting<Record<string, boolean>>("providers.verified")) ?? {};
  const env = [
    ["URL du site", site.url],
    ["Environnement", isProduction ? "production" : "hors production"],
    ["Catalogue fictif", demoCatalogEnabled ? "ACTIVÉ (interdit en production)" : "désactivé"],
    ["E-mails transactionnels (Resend)", process.env.RESEND_API_KEY ? "configuré" : "non configuré — e-mails journalisés en console"],
    ["Notification commerciale", process.env.SALES_NOTIFICATION_EMAIL ?? "non configurée"],
    ["Google Analytics 4", process.env.NEXT_PUBLIC_GA4_ID ? "configuré" : "non configuré"],
    ["Google Ads (conversion)", process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL ? "configuré" : "non configuré"],
  ];
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Intégrations & paramètres</h1>
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="font-medium">Configuration (variables d&apos;environnement serveur)</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{env.map(([k, v]) => (<div key={k}><dt className="text-xs text-mist">{k}</dt><dd>{v}</dd></div>))}</dl>
        <p className="mt-3 text-xs text-mist">Les secrets ne sont jamais affichés ni envoyés au navigateur. Ils se modifient dans l&apos;hébergeur, pas ici.</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {allConnectors.map((c) => {
          const h = c.health();
          return (
            <div key={c.id} className="rounded-lg border border-line bg-white p-5 text-sm">
              <h2 className="font-medium">{c.label}</h2>
              <p className={`mt-1 text-xs ${h.configured ? "text-emerald-800" : "text-amber-800"}`}>{h.detail}</p>
              {h.missing.length > 0 && <p className="mt-1 font-mono text-[11px] text-mist">{h.missing.join(", ")}</p>}
              <dl className="mt-3 grid grid-cols-2 gap-1 text-xs">
                <dt>Recherche</dt><dd>{yes(c.capabilities.search)}</dd>
                <dt>Webhooks</dt><dd>{yes(c.capabilities.webhooks)}</dd>
                <dt>Stockage autorisé</dt><dd>{yes(c.policy.mayStoreResults)}</dd>
                <dt>Prix affichable</dt><dd>{yes(c.policy.mayDisplayPrice)}</dd>
                <dt>Opérateur affichable</dt><dd>{yes(c.policy.mayDisplayOperator)}</dd>
                <dt>Fraîcheur max</dt><dd>{c.policy.freshnessHours} h</dd>
              </dl>
              {c.id !== "manual" && c.id !== "demo" && (
                <>
                  <TestButton provider={c.id} />
                  <form action={setProviderVerified} className="mt-3 flex items-center gap-2 border-t border-line pt-3">
                    <input type="hidden" name="provider" value={c.id} />
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="verified" defaultChecked={verified[c.id]} disabled={!h.configured} /> Validé : réponses réelles testées et conditions d&apos;utilisation lues</label>
                    <button className="btn-ghost px-2 py-1 text-xs" disabled={!h.configured}>OK</button>
                  </form>
                </>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
