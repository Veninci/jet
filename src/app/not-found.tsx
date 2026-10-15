import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="lx-eyebrow">Introuvable</p>
      <h1 className="font-display mt-4 text-6xl font-light">Ce vol a peut-être décollé.</h1>
      <p className="mt-4 text-smoke">Les Empty Legs partent vite. D&apos;autres vols vous attendent.</p>
      <Link href="/vols" className="lx-btn mt-10">Voir les vols</Link>
    </main>
  );
}
