// Usage : npm run admin:create -- email@domaine.fr "Nom Prénom" 'motdepasse-12-caracteres'
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const [email, name, password] = process.argv.slice(2);
if (!email || !name || !password || password.length < 12) {
  console.error('Usage : npm run admin:create -- email "Nom" motdepasse (12 caractères minimum)');
  process.exit(1);
}
const prisma = new PrismaClient();
await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  create: { email: email.toLowerCase(), name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  update: { name, role: "ADMIN", active: true, passwordHash: await bcrypt.hash(password, 12) },
});
console.log(`Administrateur ${email} prêt.`);
await prisma.$disconnect();
