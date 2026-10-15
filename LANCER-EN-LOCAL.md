# Voir le site MACH sur votre ordinateur

Le site ne s'ouvre à l'adresse `http://localhost:3000` **que s'il est lancé sur votre ordinateur**,
dans une fenêtre de terminal restée ouverte. Sinon le navigateur affiche « Ce site est inaccessible ».

Il suffit de **Node.js** : pas de Docker, pas de base de données à installer.

## La première fois (10 minutes)

### 1. Installer Node.js
Téléchargez la version **LTS** sur https://nodejs.org et installez-la (suivant, suivant…).

### 2. Télécharger le site
Sur https://github.com/Veninci/jet : bouton vert **Code** → **Download ZIP**.
Double-cliquez sur le fichier téléchargé pour le décompresser (vous obtenez un dossier `jet-main`).

### 3. Ouvrir le Terminal dans ce dossier
- **Mac** : ouvrez l'application **Terminal** (Cmd + Espace, tapez « Terminal »).
  Tapez `cd ` (avec un espace après), **glissez le dossier `jet-main`** dans la fenêtre, puis appuyez sur Entrée.
- **Windows** : ouvrez le dossier `jet-main`, clic droit dans un espace vide → **Ouvrir dans le Terminal**.

### 4. Installer puis lancer
Copiez ces deux lignes dans le terminal (Entrée après chacune) :

```bash
npm install
npm run local
```

`npm install` prend une à deux minutes. Ensuite `npm run local` prépare tout et **ouvre le site
dans votre navigateur**. Le terminal affiche :

```
✔ MACH est lancé.
  Site :             http://localhost:3000
  Administration :   http://localhost:3000/admin
     e-mail :        admin@mach.local
     mot de passe :  mach-xxxxxxxxxxxx
```

**Laissez la fenêtre du terminal ouverte** pendant toute la visite.

## Les fois suivantes (1 minute)

Ouvrez le Terminal dans le dossier `jet-main` (étape 3), puis tapez seulement :

```bash
npm run local
```

## Arrêter

Dans la fenêtre du terminal : **Ctrl + C**.

## Bon à savoir

- Les vols affichés sont **fictifs** (marqués « Fictif ») : ils servent à essayer le site.
- Les demandes envoyées arrivent dans l'administration ; aucun e-mail ne part.
- Le mot de passe de l'administration est aussi enregistré dans le fichier `ACCES-ADMIN-LOCAL.txt`.
- Le petit rond « N » en bas à gauche est un outil de développement : il n'existe pas sur le site en ligne.
- Les photos de destination viennent d'Unsplash : il faut être connecté à Internet.
- **Sur votre iPhone** (même Wi-Fi) : ouvrez `http://ADRESSE-IP-DU-MAC:3000`
  (adresse dans Réglages Système → Wi-Fi → Détails). Autorisez Node.js si le Mac le demande.

## En cas de problème

| Ce que vous voyez | Solution |
|---|---|
| `command not found: npm` ou `node` | Node.js n'est pas installé, ou le terminal était déjà ouvert : installez-le, fermez et rouvrez le Terminal |
| `Node.js … est trop ancien` | Installez la version LTS depuis https://nodejs.org |
| `Les dépendances ne sont pas installées` | Tapez `npm install` puis `npm run local` |
| `Le site s'est arrêté` | Il tourne peut-être déjà dans une autre fenêtre : fermez-la (Ctrl + C) et relancez |
| `npm error … ENOENT … package.json` | Le terminal n'est pas dans le bon dossier : refaites l'étape 3 |
| Le navigateur ne s'ouvre pas tout seul | Ouvrez l'adresse affichée dans le terminal (`http://localhost:3000`) |

---

### Option avancée : avec Docker (base PostgreSQL classique)
Pour les développeurs : `docker compose up -d`, mettez `DATABASE_URL="postgresql://mach:mach@localhost:5433/mach"`
dans `.env`, puis `npm run setup` et `npm run dev`.
