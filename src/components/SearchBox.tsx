"use client";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col justify-center gap-0.5 px-6 py-3 transition hover:bg-ink/[0.03] md:rounded-full">
      <span className="text-[13px] font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}
const input = "w-full min-w-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-ash";

/** Barre de recherche en pilule, dans l'esprit d'un formulaire de réservation de compagnie. */
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
      className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-white p-1.5 md:flex md:items-center md:rounded-full md:p-2">
      <div className="col-span-2 md:flex-[1.2]"><Cell label="Départ"><input name="from" defaultValue={defaults.from} placeholder="Paris, Genève…" className={input} autoComplete="off" /></Cell></div>
      <span aria-hidden className="hidden h-10 w-px bg-pebble md:block" />
      <div className="col-span-2 border-t border-pebble md:flex-[1.2] md:border-0"><Cell label="Destination"><input name="to" defaultValue={defaults.to} placeholder="Partout" className={input} autoComplete="off" /></Cell></div>
      <span aria-hidden className="hidden h-10 w-px bg-pebble md:block" />
      <div className="border-t border-pebble md:flex-1 md:border-0"><Cell label="Date"><input name="date" type="date" defaultValue={defaults.date} className={input} /></Cell></div>
      <span aria-hidden className="hidden h-10 w-px bg-pebble md:block" />
      <div className="border-t border-l border-pebble md:flex-[0.7] md:border-0"><Cell label="Passagers">
        <select name="pax" defaultValue={defaults.pax ?? ""} className={`${input} appearance-none`}>
          <option value="">Tous</option>
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Cell></div>
      <button type="submit" aria-label="Rechercher" className="col-span-2 mt-1.5 flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-[17px] font-bold text-white transition duration-300 hover:scale-[1.03] md:mt-0 md:size-14 md:shrink-0 md:p-0">
        <span className="md:hidden">Rechercher</span>
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </form>
  );
}
