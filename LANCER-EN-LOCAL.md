# Voir le site MACH sur votre ordinateur

Comptez 15 minutes la première fois, puis 1 minute les fois suivantes.
Les commandes se tapent dans le **Terminal** (Mac) ou **PowerShell** (Windows).

## 1. Installer deux logiciels (une seule fois)

| Logiciel | Où le trouver | Vérification dans le terminal |
|---|---|---|
| **Node.js** (version LTS) | https://nodejs.org → bouton « LTS » | `node -v` affiche `v20.9` ou plus |
| **Docker Desktop** (fait tourner la base de données) | https://www.docker.com/products/docker-desktop | `docker --version` affiche un numéro de version |

Après l'installation, **ouvrez Docker Desktop** et attendez qu'il indique qu'il est démarré (« Engine running »).

## 2. Récupérer le code (une seule fois)

Sur https://github.com/Veninci/jet → bouton vert **Code** → **Download ZIP**, puis décompressez le dossier
(par exemple sur le Bureau). Si vous utilisez Git : `git clone https://github.com/Veninci/jet.git`.

Ouvrez ensuite le terminal **dans ce dossier** :
- Mac : tapez `cd ` (avec un espace), glissez le dossier dans la fenêtre du terminal, puis Entrée
- Windows : ouvrez le dossier, clic droit dans un espace vide → *Ouvrir dans le Terminal*

Vérification : `ls` (Mac) ou `dir` (Windows) affiche notamment `package.json`.

## 3. Installer (une seule fois)

```bash
docker compose up -d
npm install
npm run setup
```

Vérification : le terminal affiche **« ✔ Installation terminée. »** avec l'e-mail et le mot de passe
de l'espace d'administration. Ils sont aussi enregistrés dans le fichier `ACCES-ADMIN-LOCAL.txt`.

## 4. Lancer le site (à chaque fois)

```bash
docker compose up -d
npm run dev
```

Puis ouvrez **http://localhost:3000** dans votre navigateur (Chrome ou Safari).

- Le site : http://localhost:3000
- Les vols : http://localhost:3000/vols
- L'administration : http://localhost:3000/admin (identifiants de l'étape 3)

La première page met quelques secondes à s'afficher (compilation). Pour un rendu plus fluide,
identique à la mise en ligne, utilisez `npm run demo` à la place de `npm run dev` (plus long à démarrer).

**Arrêter** : dans le terminal, `Ctrl + C`, puis `docker compose down`.

## Voir le site sur votre iPhone (même Wi-Fi)

Lancez le site, trouvez l'adresse IP de l'ordinateur (Mac : Réglages → Wi-Fi → Détails ;
Windows : `ipconfig`, ligne « Adresse IPv4 »), puis ouvrez `http://ADRESSE-IP:3000` sur l'iPhone.
Si la page ne s'ouvre pas, le pare-feu de l'ordinateur bloque l'accès : autorisez Node.js quand il le demande.

## Ce que vous verrez

- Les vols affichés sont **fictifs** (marqués « Fictif ») : ils servent à tester le site.
- Les demandes envoyées arrivent dans l'administration. Les e-mails ne partent pas :
  ils s'affichent dans le terminal (aucune clé d'envoi configurée).
- Les photos viennent d'Unsplash et nécessitent une connexion Internet.
- En mode `npm run dev`, un petit rond « N » en bas à gauche est l'outil de développement de Next.js :
  il n'apparaît pas sur le site en ligne.

## En cas de problème

| Message | Solution |
|---|---|
| `Impossible de joindre la base de données` | Ouvrez Docker Desktop, attendez qu'il soit démarré, relancez `docker compose up -d` puis `npm run setup` |
| `port is already allocated` (5433) | Un autre programme utilise ce port : changez `5433` dans `docker-compose.yml` et dans `.env` |
| `Port 3000 is in use` | Lancez `npm run dev -- -p 3001` et ouvrez http://localhost:3001 |
| `npm` ou `node` introuvable | Réinstallez Node.js puis fermez et rouvrez le terminal |
| Mot de passe admin perdu | Relancez `npm run setup` : un nouveau mot de passe est créé |
