import { demoCatalogEnabled } from "@/lib/config";
import { getSetting } from "@/lib/settings";
import { avinodeConnector } from "./avinode";
import { demoConnector, manualConnector } from "./manual";
import { isPubliclyShowable, redactForPublic } from "./policy";
import type { EmptyLeg, EmptyLegConnector, ProviderId, SearchQuery } from "./types";

export const allConnectors: EmptyLegConnector[] = [manualConnector, avinodeConnector, demoConnector];

export function getConnector(id: ProviderId) {
  return allConnectors.find((c) => c.id === id);
}

/**
 * Un fournisseur externe n'alimente le site public que si :
 *  1) ses identifiants sont présents, ET
 *  2) un administrateur a validé manuellement l'intégration (réponse réelle testée, conditions lues).
 */
export async function activeConnectors(): Promise<EmptyLegConnector[]> {
  // Base indisponible (build, incident) : on continue sans fournisseur externe plutôt que de planter la page.
  const verified = (await getSetting<Record<string, boolean>>("providers.verified").catch((e) => {
    console.error("[registry] lecture des réglages impossible :", (e as Error).message);
    return null;
  })) ?? {};
  return allConnectors.filter((c) => {
    if (c.id === "demo") return demoCatalogEnabled;
    if (c.id === "manual") return true;
    return c.health().configured && verified[c.id] === true;
  });
}

export type PublicLeg = EmptyLeg & { attribution?: string };

/** Recherche agrégée publique : fraîcheur + masquage appliqués ici, une seule fois, pour toutes les sources. */
export async function searchPublic(q: SearchQuery): Promise<{ legs: PublicLeg[]; errors: string[] }> {
  const connectors = await activeConnectors();
  const errors: string[] = [];
  const now = new Date();
  const results = await Promise.all(
    connectors.map(async (c) => {
      try {
        const legs = await c.search(q);
        return legs
          .filter((l) => isPubliclyShowable(l, c.policy, now))
          .map((l) => ({ ...redactForPublic(l, c.policy), attribution: c.policy.attribution }));
      } catch (e) {
        errors.push(`${c.id}: ${(e as Error).message}`);
        return [];
      }
    }),
  );
  const legs = results.flat().sort((a, b) => a.departureStart.getTime() - b.departureStart.getTime());
  return { legs, errors };
}

export async function getPublicLeg(key: string): Promise<PublicLeg | null> {
  const [provider, ...rest] = key.split(":");
  const id = rest.join(":");
  const c = (await activeConnectors()).find((x) => x.id === provider);
  if (!c?.getById || !id) return null;
  const leg = await c.getById(id);
  if (!leg || !isPubliclyShowable(leg, c.policy)) return null;
  return { ...redactForPublic(leg, c.policy), attribution: c.policy.attribution };
}
