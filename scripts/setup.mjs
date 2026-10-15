// Installation locale en une commande : npm run setup
// 1) crée .env (secret de session généré), 2) attend la base, 3) crée les tables,
// 4) ajoute les vols de démonstration (FICTIFS), 5) crée un compte administrateur local.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const run = (cmd, opts = {}) => execSync(cmd, { stdio: opts.quiet ? "pipe" : "inherit", shell: true, env: process.env });
const step = (n, t) => console.log(`\n\x1b[1m${n}. ${t}\x1b[0m`);

step(1, "Fichier de configuration .env");
if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("   .env créé à partir de .env.example");
}
let env = readFileSync(".env", "utf8");
if (/^AUTH_SECRET=""\s*$/m.test(env) || /change-me/.test(env)) {
  env = env.replace(/^AUTH_SECRET=.*$/m, `AUTH_SECRET="${randomBytes(36).toString("base64url")}"`);
  writeFileSync(".env", env);
  console.log("   Secret de session généré");
}

step(2, "Connexion à la base de données");
let ok = false;
for (let i = 0; i < 30 && !ok; i++) {
  try {
    run("npx prisma db push --skip-generate", { quiet: true });
    ok = true;
  } catch {
    if (i === 0) console.log("   En attente de PostgreSQL (docker compose up -d lancé ?)…");
    await new Promise((r) => setTimeout(r, 2000));
  }
}
if (!ok) {
  console.error("\n\x1b[31mImpossible de joindre la base de données.\x1b[0m");
  console.error("Vérifiez que Docker Desktop est ouvert, puis lancez : docker compose up -d");
  console.error("Ensuite relancez : npm run setup");
  process.exit(1);
}
console.log("   Tables créées");
run("npx prisma generate", { quiet: true });

step(3, "Vols de démonstration (fictifs, marqués comme tels)");
run("npx tsx prisma/seed.ts");

step(4, "Compte administrateur local");
const email = "admin@mach.local";
const password = `mach-${randomBytes(6).toString("hex")}`;
run(`npx tsx scripts/create-admin.ts ${email} "Admin local" ${password}`, { quiet: true });
writeFileSync("ACCES-ADMIN-LOCAL.txt", `Espace d'administration local\nAdresse : http://localhost:3000/admin\nE-mail : ${email}\nMot de passe : ${password}\n`);

console.log(`
\x1b[32m✔ Installation terminée.\x1b[0m

  Lancer le site :      npm run dev
  Puis ouvrir :         http://localhost:3000
  Administration :      http://localhost:3000/admin
     e-mail :           ${email}
     mot de passe :     ${password}
  (identifiants aussi enregistrés dans ACCES-ADMIN-LOCAL.txt)
`);
