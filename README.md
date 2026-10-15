# Plateforme Empty Legs — MVP (étape 2)

Site premium (thème sombre) + réservation en 2 écrans + base PostgreSQL + administration commerciale + API publique v1 partagée avec l'app mobile (Rork) + couche de connecteurs fournisseurs.
Marque : **MACH** (variable `NEXT_PUBLIC_SITE_NAME`). Antériorités à vérifier (INPI/EUIPO) : des opérateurs charter « Mach Aviation » et « MachJet » existent. Pas de symbole ® tant que la marque n'est pas enregistrée.

## Stack
Next.js 16 (App Router, TypeScript) · PostgreSQL + Prisma 6 · Tailwind CSS 4 · Zod · sessions JWT signées (jose) + bcrypt · Resend (HTTP) pour les e-mails · Vitest.
Animation : GSAP 3.15 + ScrollTrigger (licence « Standard no charge », usage commercial gratuit), Lenis (MIT), Three.js r186 (MIT), police Inter Tight (OFL).

## Direction artistique et animations
- Style : ciel d'aube, encre `#000d10`, pilules, une seule carte argile `#bc7155` par page (référence « Hyer Aviation » fournie).
- Hero : jet d'affaires 3D modélisé en code (`src/components/jet/`), qui entre en vol puis s'éloigne au scroll pendant que le logotype monte et que le ciel passe au crépuscule.
- Section « verre » : moteur du skill *Premium 3D Glass* fourni par le client, porté dans `src/components/glass/engine.js`
  (cœur inchangé ; adaptations listées en tête du fichier). Silhouette du jet : `public/glass/jet.svg`, validée par l'outil du skill (0 croisement).
  **À vérifier : les droits d'utilisation commerciale du code de ce moteur** (l'archive ne contient pas de licence pour lui, seulement pour Three.js et Space Grotesk).
- Animations déclaratives par attributs : `data-reveal`, `data-reveal-group`/`data-reveal-item`, `data-split`, `data-scrub-words`, `data-clip`, `data-parallax`, `data-grow` (`src/components/motion/MotionRoot.tsx`).
- Accessibilité : tout est désactivé si l'utilisateur a demandé à réduire les animations (le verre s'affiche alors à plat) ; le contenu reste dans le HTML pour le SEO.
- Les pages Google Ads (`/lp/*`) n'ont volontairement aucune 3D, pour un affichage immédiat.

## Démarrer
> Pas développeur ? Suivez **[LANCER-EN-LOCAL.md](LANCER-EN-LOCAL.md)** : Node.js suffit, `npm install` puis `npm run local` (base PostgreSQL intégrée via PGlite, navigateur ouvert automatiquement).

```bash
cp .env.example .env            # renseigner DATABASE_URL et AUTH_SECRET (openssl rand -base64 48)
npm install
npx prisma db push              # crée le schéma (en production : prisma migrate deploy)
npm run db:seed                 # OPTIONNEL : 5 offres FICTIVES (refusé si APP_ENV=production)
npm run admin:create -- vous@domaine.fr "Votre Nom" 'mot-de-passe-12-car'
npm run dev                     # http://localhost:3000 — admin : /admin
npm test                        # tests unitaires
```

## Ce qui fonctionne (testé de bout en bout dans Chromium, desktop + iPhone 13)
- Accueil, catalogue (cartes/liste, filtres), fiche vol avec demande pré-remplie, page de demande, 3 pages d'itinéraires SEO, 3 pages d'atterrissage Google Ads (noindex), pages légales (modèles), sitemap.xml, robots.txt (bloque tout hors production), JSON-LD FAQ/Organization/Breadcrumb.
- `POST /api/leads` : validation, pot de miel, limitation de débit, attribution (utm, gclid si consentement), hash d'IP, e-mails client + commercial (journalisés en console sans clé Resend, et tracés dans l'historique).
- Admin : connexion, rôles ADMIN/SALES, demandes triées par priorité, statuts, attribution, relances, notes, propositions avec commission, historique, export CSV (anti-injection de formules), offres manuelles avec provenance obligatoire et expiration automatique à 24 h, utilisateurs, page intégrations.
- Garde-fous : « Réservation confirmée » impossible sans proposition acceptée **et** confirmée par écrit par l'opérateur ; catalogue fictif impossible en production ; un fournisseur API n'alimente le site qu'après validation manuelle par un admin.
- Consentement : aucun traceur avant choix ; Consent Mode v2 ; gtag.js chargé seulement après accord. Évènements `search_flights`, `view_flight`, `generate_lead` (+ conversion Google Ads).

## API mobile (v1) — une seule source de vérité pour le web et l'app
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/v1/flights?from&to&date&pax` | Vols publiables (fraîcheur + masquage appliqués) |
| GET | `/api/v1/flights/{id}` | Détail (404 si expiré) |
| POST | `/api/v1/requests` | Demande de réservation (`X-Client: mobile`) — jamais une réservation |
| GET | `/api/v1/config` | Marque, contacts, liens légaux, FAQ, image d'accueil |
| GET | `/api/v1/openapi` | Contrat OpenAPI 3.1 |

Le site web utilise lui-même `/api/v1/requests`. Prompt prêt à coller dans Rork : `docs/rork-prompt.md`.

## Photos
`src/content/media.ts` : 9 photos sous licence Unsplash gratuite (pages « Free Photo », à revérifier une par une
avant production), chargées depuis `unsplash.com/photos/{id}/download`. **Non vérifié visuellement** : l'environnement
de développement bloque Unsplash. Recommandé en production : télécharger les fichiers dans `/public/media` ou un CDN
(`NEXT_PUBLIC_MEDIA_BASE`). En cas d'échec de chargement, un dégradé sombre remplace l'image.

## Ce qui NE fonctionne PAS encore / non testé
- **Connecteur Avinode** (`src/connectors/avinode.ts`) : écrit d'après la documentation publique, **jamais exécuté contre l'API**. En-têtes, chemin de recherche et schéma de réponse marqués `TODO(avinode)`. Nécessite : adhésion Marketplace + accès API + identifiants.
- Envoi réel d'e-mails : nécessite `RESEND_API_KEY` et un domaine vérifié.
- Webhooks Avinode, alertes e-mail, moteur de matching, import des conversions hors ligne Google Ads : étapes 3, 5 et 6.
- Visuel d'accueil : illustration vectorielle provisoire → remplacer par une photo sous licence (`public/images/hero.jpg`, `HeroArt photo`).
- Limiteur de débit en mémoire : à remplacer par Redis si plusieurs instances.

## Architecture
```
src/connectors/   types.ts (contrat + politique d'affichage/stockage par fournisseur)
                  policy.ts (fraîcheur, masquage) · registry.ts (agrégation publique)
                  manual.ts (offres saisies + démo) · avinode.ts (à valider)
src/app/(site)/   pages publiques        src/app/admin/   back-office + server actions
src/app/api/leads/ réception des demandes  prisma/schema.prisma  modèle de données
```
Ajouter un fournisseur = un fichier qui implémente `EmptyLegConnector` + une ligne dans `registry.ts`.

Voir `docs/cadrage.md` pour l'analyse fournisseurs, réglementation, coûts et feuille de route.
