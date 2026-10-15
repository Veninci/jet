"use client";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

export function SearchBox({ defaults = {} }: { defaults?: { from?: string; to?: string; date?: string; pax?: string } }) {
  const router = useRouter();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const k of ["from", "to", "date", "pax"]) {
      const v = String(fd.get(k) ?? "").trim();
      if (v) params.set(k, v);
    }
    track("search_flights", Object.fromEntries(params));
    router.push(`/vols?${params.toString()}#resultats`);
  }
  return (
    <form onSubmit={onSubmit} role="search" aria-label="Rechercher un Empty Leg"
      className="grid gap-2 rounded-lg bg-white/95 p-2 shadow-2xl shadow-black/20 backdrop-blur sm:grid-cols-[1fr_1fr_0.9fr_0.6fr_auto]">
      <label className="sr-only" htmlFor="sb-from">Départ</label>
      <input id="sb-from" name="from" defaultValue={defaults.from} placeholder="Départ" className="field border-transparent" />
      <label className="sr-only" htmlFor="sb-to">Arrivée</label>
      <input id="sb-to" name="to" defaultValue={defaults.to} placeholder="Arrivée" className="field border-transparent" />
      <label className="sr-only" htmlFor="sb-date">Date</label>
      <input id="sb-date" name="date" type="date" defaultValue={defaults.date} className="field border-transparent" />
      <label className="sr-only" htmlFor="sb-pax">Passagers</label>
      <input id="sb-pax" name="pax" type="number" min={1} max={19} defaultValue={defaults.pax} placeholder="Pax" inputMode="numeric" className="field border-transparent" />
      <button className="btn-primary" type="submit">Trouver mon vol</button>
    </form>
  );
}
