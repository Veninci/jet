# Cadrage — état au 15/10/2026

## Fournisseurs d'Empty Legs (accès broker)
| Source | API | Accès | Coût connu | Restrictions clés | Confiance |
|---|---|---|---|---|---|
| Avinode Marketplace | Oui : Empty Leg Search, Empty Leg Subscription (watch + webhook `EmptyLegs`, `GET /emptylegs/{id}`, 404 = dépublié) | Adhésion Marketplace obligatoire + API Terms | Pages tarifs indexées : Starter ≈ 740 $/mois, Advanced ≈ 1 058 $/mois, +128 $/utilisateur, engagement 6–12 mois prépayé (snapshots non datés) | Pas d'opérateur ni d'immatriculation dans un résultat public ; attribution Avinode ; pas de revente/partage ; backend obligatoire ; token non exposé | Moyenne (doc lue via extraits, site inaccessible depuis l'environnement) |
| Avi-Go | « Empty Leg API » | Organisations vérifiées | Frais de mise en place + abonnement, sur devis | Inconnues | Faible (marketing) |
| FL3XX (logiciel opérateurs) | `GET /api/external/quote/legs/empty` | Côté opérateur : chaque opérateur doit vous ouvrir l'accès | Inconnu | Accords opérateur par opérateur | Moyenne |
| Charterpad, Jetwist, Flyeasy… | Diffusion d'empty legs alimentée par FL3XX | À contacter | Inconnu | Inconnues | Faible |
| Accords directs opérateurs | Fichier, e-mail, API propre | Contrat | Négociable | Selon contrat | — |

À confirmer auprès d'Avinode avant signature : tarif API exact, inclusion de l'Empty Leg Search dans le plan choisi,
droit d'afficher prix et type d'appareil publiquement, durée de cache autorisée, existence d'une sandbox, signature des webhooks,
formulation d'attribution, cas des « marketing agents » (redistribution).

## Réglementation (interprétations à faire valider par un avocat)
- Code du tourisme L211-1 : la vente de « services de voyage » inclut le transport ; l'exemption vise les transporteurs vendant leurs propres titres, pas un intermédiaire → immatriculation Atout France + garantie financière + RC pro **probablement** requises pour vendre/encaisser. Confiance moyenne.
- Règlement (CE) 1008/2008 : seul un transporteur titulaire d'une licence et d'un CTA exploite le vol.
- RGPD / lignes directrices CNIL cookies ; Google Consent Mode v2 requis pour mesurer les conversions EEA.
- Pas d'encaissement avant définition du statut (mandataire du client vs agent de l'opérateur).

## Feuille de route
1. ✅ Étape 2 (ce dépôt). 2. Étape 3 : identifiants Avinode → valider le mapping → activer. 3. Étape 4 : catalogue réel.
4. Étape 5 : Resend, alertes, conversions hors ligne. 5. Étape 6 : matching (aéroports alternatifs, scoring).
