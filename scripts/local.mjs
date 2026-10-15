// Lancement local en une commande, sans Docker : npm run local
// 1) démarre une base PostgreSQL intégrée (PGlite, données dans .local-db/),
// 2) crée/actualise les tables, les vols de démonstration (FICTIFS) et le compte admin local,
// 3) lance le site et ouvre le navigateur. Ctrl + C arrête tout.
import { spawn, execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import net from "node:net";
import path from "node:path";

const root = process.cwd();
const bold = (t) => `\x1b[1m${t}\x1b[0m`;
const step = (t) => console.log(`\n${bold("→ " + t)}`);
const fail = (msg) => {
  console.error(`\n\x1b[31m✖ ${msg}\x1b[0m\n`);
  cleanup();
  process.exit(1);
};

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) fail(`Node.js ${process.versions.node} est trop ancien : installez la version LTS depuis https://nodejs.org`);
if (!existsSync(path.join(root, "node_modules"))) fail("Les dépendances ne sont pas installées : lancez d'abord  npm install");

const children = [];
let stopping = false;
function cleanup() {
  stopping = true;
  for (const c of children) if (!c.killed) c.kill("SIGINT");
}
process.on("SIGINT", () => { cleanup(); process.exit(0); });
process.on("SIGTERM", () => { cleanup(); process.exit(0); });

function freePort(start) {
  return new Promise((resolve) => {
    const tryPort = (p) => {
      const srv = net.createServer();
      srv.once("error", () => tryPort(p + 1));
      srv.once("listening", () => srv.close(() => resolve(p)));
      srv.listen(p, "127.0.0.1");
    };
    tryPort(start);
  });
}
const waitFor = async (check, tries = 60, delay = 1000) => {
  for (let i = 0; i < tries; i++) {
    if (await check()) return true;
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
};
const portOpen = (port) => new Promise((resolve) => {
  const s = net.connect(port, "127.0.0.1");
  s.once("connect", () => { s.end(); resolve(true); });
  s.once("error", () => resolve(false));
});

// ---------- Configuration ----------
step("Configuration");
if (!existsSync(".env")) copyFileSync(".env.example", ".env");
let env = readFileSync(".env", "utf8");
if (/^AUTH_SECRET=""\s*$/m.test(env) || /change-me/.test(env)) {
  env = env.replace(/^AUTH_SECRET=.*$/m, `AUTH_SECRET="${randomBytes(36).toString("base64url")}"`);
  writeFileSync(".env", env);
}
console.log("  .env prêt");

// ---------- Base de données intégrée ----------
step("Base de données intégrée (PGlite)");
const dbPort = await freePort(5434);
const server = path.join(root, "node_modules/@electric-sql/pglite-socket/dist/scripts/server.js");
const db = spawn(process.execPath, [server, `--db=${path.join(root, ".local-db")}`, `--port=${dbPort}`, "--max-connections=10"], { stdio: ["ignore", "pipe", "pipe"] });
children.push(db);
db.stdout.on("data", (d) => process.env.DEBUG && process.stdout.write(d));
db.stderr.on("data", (d) => process.env.DEBUG && process.stderr.write(d));
if (!(await waitFor(() => portOpen(dbPort), 60, 500))) fail("La base intégrée n'a pas démarré.");
// pgbouncer=true : PGlite partage une seule session, Prisma ne doit pas réutiliser de requêtes préparées nommées.
const DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${dbPort}/postgres?sslmode=disable&pgbouncer=true&connection_limit=1`;
const childEnv = { ...process.env, DATABASE_URL, APP_ENV: "development", DEMO_CATALOG: "true" };
const run = (cmd) => execSync(cmd, { stdio: "pipe", shell: true, env: childEnv });
try {
  run("npx prisma db push --skip-generate");
  run("npx prisma generate");
} catch (e) {
  fail(`Création des tables impossible :\n${e.stderr?.toString() ?? e.message}`);
}
console.log("  Tables prêtes");

// Les vols de démo sont recréés à chaque lancement : ils restent « récents » (sinon ils expirent après 24 h).
run("npx tsx prisma/seed.ts");
console.log("  Vols de démonstration (fictifs) actualisés");

let access = existsSync("ACCES-ADMIN-LOCAL.txt") ? readFileSync("ACCES-ADMIN-LOCAL.txt", "utf8") : "";
if (!access) {
  const password = `mach-${randomBytes(6).toString("hex")}`;
  run(`npx tsx scripts/create-admin.ts admin@mach.local "Admin local" ${password}`);
  access = `Espace d'administration local\nAdresse : /admin\nE-mail : admin@mach.local\nMot de passe : ${password}\n`;
  writeFileSync("ACCES-ADMIN-LOCAL.txt", access);
}
const pw = access.match(/Mot de passe : (\S+)/)?.[1];

// ---------- Site ----------
step("Démarrage du site (la première fois prend environ une minute)");
const webPort = await freePort(3000);
const nextBin = path.join(root, "node_modules/next/dist/bin/next");
const web = spawn(process.execPath, [nextBin, "dev", "-p", String(webPort)], { stdio: ["ignore", "pipe", "inherit"], env: childEnv });
children.push(web);
web.stdout.on("data", (d) => process.env.DEBUG && process.stdout.write(d));
web.on("exit", (code) => {
  if (code && !stopping) fail("Le site s'est arrêté.\n  S'il est déjà ouvert dans une autre fenêtre de terminal, fermez-la (Ctrl + C) puis relancez.\n  Pour voir le détail de l'erreur : DEBUG=1 npm run local");
});

const url = `http://localhost:${webPort}`;
const ready = await waitFor(async () => {
  try { return (await fetch(url)).ok; } catch { return false; }
}, 180, 1000);
if (!ready) fail("Le site ne répond pas.");

console.log(`
\x1b[32m✔ MACH est lancé.\x1b[0m

  Site :             ${bold(url)}
  Administration :   ${url}/admin
     e-mail :        admin@mach.local
     mot de passe :  ${pw}

  Laissez cette fenêtre ouverte pendant la visite.  Ctrl + C pour arrêter.
`);

const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start \"\"" : "xdg-open";
try { execSync(`${opener} ${url}`, { stdio: "ignore", shell: true }); } catch { /* ouvrir le lien à la main */ }
