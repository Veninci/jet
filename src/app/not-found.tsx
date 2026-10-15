import Link from "next/link";

export default function NotFound() {
  return (
    <main className="sky flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="t-hero text-[34vw] text-ink/10 sm:text-[240px]">404</p>
      <h1 className="t-display -mt-[0.6em] text-[44px] sm:text-[63px]">Ce vol a décollé.</h1>
      <p className="t-body mt-4 text-ink/70">Les Empty Legs partent vite. D&apos;autres vous attendent.</p>
      <Link href="/vols" className="pill mt-10">Voir les vols</Link>
    </main>
  );
}
