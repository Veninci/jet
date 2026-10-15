# Plateforme Empty Legs — MVP (étape 2)

Site premium + formulaire de demande + base PostgreSQL + administration commerciale + couche de connecteurs fournisseurs.
Nom de marque provisoire : **Aelys** (variable `NEXT_PUBLIC_SITE_NAME`) — à valider par une recherche d'antériorité INPI/EUIPO.

## Stack
Next.js 16 (App Router, TypeScript) · PostgreSQL + Prisma 6 · Tailwind CSS 4 · Zod · sessions JWT signées (jose) + bcrypt · Resend (HTTP) pour les e-mails · Vitest.

## Démarrer
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
