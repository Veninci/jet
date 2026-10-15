import { createHash, randomInt } from "node:crypto";

/** Hash salé de l'IP : permet de détecter les abus sans conserver l'adresse en clair. */
export function hashIp(ip: string) {
  return createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex").slice(0, 32);
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function leadReference(date = new Date()) {
  const y = String(date.getUTCFullYear()).slice(2);
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `EL${y}-${s}`;
}
