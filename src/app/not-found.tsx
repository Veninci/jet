import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="font-display text-5xl">Page introuvable</h1>
      <p className="mt-4 text-ink-soft">Ce vol n&apos;est peut-être plus proposé.</p>
      <Link href="/vols" className="btn-primary mt-8">Voir les vols disponibles</Link>
    </main>
  );
}
