# Prompt Rork — application mobile MACH

Copier le bloc ci-dessous dans Rork. Remplacer `https://VOTRE-DOMAINE` par l'URL du site déployé
(l'API doit être en ligne : Rork ne peut pas joindre `localhost`).

---

```
Crée une application mobile iOS et Android (Expo, React Native, Expo Router, TypeScript) nommée « MACH »,
pour réserver des vols Empty Leg en jet privé. L'app est un client d'une API existante : elle ne doit avoir
AUCUNE base de données ni backend propre. Toutes les données viennent de l'API ci-dessous.

## Positionnement et ton
Luxe discret, aviation d'affaires européenne. Français, vouvoiement. Phrases courtes. Jamais de promesse
que le vol est garanti : un Empty Leg est toujours « à confirmer » par l'opérateur.

## Design (thème sombre unique)
- Fond : #07080B. Surfaces : #0D1015, #141820, #1C212B. Bordures : blanc à 8–10 % d'opacité.
- Texte principal : #F3EFE7 (perle). Secondaire : #A3A9B4. Tertiaire : #6F7682.
- Accent unique : champagne #CFB37E (survol #E6D3A8). Erreur : #FCA5A5 sur fond rouge à 10 %.
- Titres : Cormorant Garamond (300/400, italique pour les accents), très grands, interlignage serré.
  Texte et interface : Inter. Libellés en petites capitales espacées (letterSpacing ≈ 2.5, taille 10–11).
- Boutons principaux : pilule pleine champagne, texte #07080B en capitales, hauteur 52.
  Boutons secondaires : pilule contour blanc 20 %.
- Cartes : coins 24, image de destination en haut (ratio 4:3) avec dégradé vers le bas,
  ville de départ — ville d'arrivée en Cormorant 32 sur l'image.
- Photos plein écran avec dégradé noir ; si une image ne charge pas, afficher un dégradé radial sombre
  (#2A2F3A → #07080B) à la place, jamais une image cassée.
- Animations douces (fondu + montée de 12 px, 600 ms, easing cubic-bezier(0.22,1,0.36,1)). Retour haptique léger
  sur les compteurs et la validation.
- Zones tactiles ≥ 44 pt, respect des safe areas, support du texte dynamique.

## API (base : https://VOTRE-DOMAINE/api/v1) — contrat OpenAPI : GET /openapi
- GET /config → { data: { brand, contact{phone,email}, responseTime, legal{terms,privacy,legalNotice},
  heroImage{url,alt,credit}, faq[{q,a}], disclaimer } }
- GET /flights?from=&to=&date=AAAA-MM-JJ&pax= → { data: Flight[], meta{count} }
  (date = fenêtre ± 3 jours ; sans date = 60 prochains jours)
- GET /flights/{id} (id encodé avec encodeURIComponent) → { data: Flight } ; 404 = plus disponible
- POST /requests (en-tête "X-Client: mobile", JSON) → 201 { data: { reference, status:"received", isBooking:false } }
  ; 422 { error, fields: { nomDuChamp: message } } ; 429 trop de demandes.
  Corps : { offerId?, departure, arrival, departureDate (AAAA-MM-JJ), returnDate?, tripType ("ONE_WAY"|"ROUND_TRIP"),
  flexibilityDays (0–14), passengers (1–19), cabinBags?, holdBags?, budget?, firstName, lastName, email, phone,
  comments?, consentContact: true }

Flight = { id, isDemo, status:"to_confirm", from{city,airport,icao}, to{city,airport,icao},
  departureWindow{start,end,timezone}, maxPassengers|null, aircraft{category,type}, 
  price{amount,currency,kind:"indicative"|"operator"}|null, conditions|null, lastVerifiedAt,
  image{url,alt,credit}, attribution|null }

L'URL de base est une constante de configuration (EXPO_PUBLIC_API_URL), pas codée en dur dans les écrans.
Utiliser TanStack Query (cache 30 s, tirer pour rafraîchir), états de chargement en squelettes, état vide élégant,
message d'erreur réseau avec bouton « Réessayer ».

## Écrans
1. Accueil : photo plein écran (heroImage), titre « Le luxe du jet privé, plus accessible. » (la seconde partie en
   italique champagne), carte de recherche vitrée (Départ, Destination, Date, Passagers), puis carrousel horizontal
   « Empty Legs à saisir » (GET /flights), puis 3 engagements (Opérateurs certifiés, Prix transparents, Conseiller dédié).
2. Résultats : liste de cartes Flight + filtres en feuille modale (date, passagers, budget max). Si vide :
   « Aucun vol affiché sur ce trajet » + bouton « Vol sur mesure ».
3. Détail du vol : grande photo, ville — ville, date, créneau horaire en heure de Paris, aéroports + codes OACI,
   capacité, appareil, « Vérifié il y a X min » (lastVerifiedAt), liste « Ce qu'il faut savoir » (le vol peut
   changer ; prix pour l'appareil entier, total exact dans la proposition écrite ; opérateur nommé dans la
   proposition). Barre fixe en bas : prix + bouton « Réserver ».
4. Réservation (2 étapes, barre de progression) :
   a) « Qui voyage ? » : compteurs Passagers (max = maxPassengers), Bagages cabine, Bagages en soute, Précisions.
   b) « Vos coordonnées » : prénom, nom, e-mail, téléphone, case NON pré-cochée « J'accepte d'être recontacté… »
      avec lien vers la politique de confidentialité (legal.privacy). Bouton « Demander la réservation ».
   Récapitulatif repliable : trajet, date, voyageurs, prix (« Prix indicatif — pour l'appareil entier »).
   Envoi : POST /requests avec offerId = Flight.id, departure/arrival = "Ville (Aéroport)", departureDate =
   départ du créneau, flexibilityDays 0. Afficher les erreurs 422 sous chaque champ.
5. Confirmation : coche champagne, « Demande envoyée », référence, frise en 4 étapes (Demande reçue →
   Vérification auprès de l'opérateur [responseTime] → Proposition écrite → Confirmation et paiement, uniquement
   après votre accord). Mention : « Ceci n'est pas encore une réservation. »
6. Vol sur mesure : même parcours en 2 étapes (trajet aller simple / aller-retour, dates, flexibilité,
   passagers, budget facultatif → coordonnées).
7. Mes demandes : liste locale (AsyncStorage) des références envoyées depuis l'appareil, avec trajet et date.
8. Réglages / À propos : contact (appel, e-mail), FAQ (config.faq), liens légaux ouverts dans le navigateur intégré,
   crédits photo.

## Règles impératives
- Si Flight.isDemo est true : badge rouge « FICTIF » sur la carte et bandeau « Démonstration : vol inventé,
  non réservable » sur le détail.
- Ne jamais afficher « confirmé », « garanti » ou « réservé » pour un vol ; le statut affiché est
  « Disponibilité à confirmer ».
- Aucun paiement dans l'app.
- Aucun traceur publicitaire ni analytics tiers sans consentement explicite.
- Ne stocker aucune donnée personnelle hors de l'appareil, en dehors de l'envoi à POST /requests.
- Navigation par onglets : Vols · Sur mesure · Mes demandes · Plus.
```

---

## Ce qui est garanti côté serveur (déjà développé et testé)
- Les mêmes vols, prix, photos et règles de fraîcheur que le site (une seule source de vérité).
- Les demandes de l'app arrivent dans le même back-office, marquées « App mobile », avec les bagages.
- Validation, anti-abus (5 demandes / 10 min / IP) et e-mails identiques au site.

## À faire au moment de brancher Rork
1. Déployer le site (l'API doit être joignable en HTTPS).
2. Renseigner `EXPO_PUBLIC_API_URL` dans Rork.
3. Si vous testez l'app dans le navigateur (Expo Web / aperçu Rork), ajouter son origine à `API_CORS_ORIGINS`.
4. Vérifier : une demande envoyée depuis l'app apparaît dans `/admin` avec l'étiquette « App mobile ».
