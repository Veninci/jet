"use client";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

function Cell({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`group flex flex-col justify-center gap-1 px-5 py-3.5 transition hover:bg-white/[0.04] ${className}`}>
      <span className="text-[10px] font-medium tracking-[0.24em] text-champagne uppercase">{label}</span>
      {children}
    </label>
  );
}

const input = "w-full bg-transparent text-[17px] text-pearl outline-none placeholder:text-pearl/45 [color-scheme:dark]";

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
      className="grid overflow-hidden rounded-3xl border border-white/15 bg-night/55 shadow-2xl shadow-black/50 backdrop-blur-2xl
        divide-y divide-white/10 md:grid-cols-[1.2fr_1.2fr_1fr_0.7fr_auto] md:divide-x md:divide-y-0">
      <Cell label="Départ"><input name="from" defaultValue={defaults.from} placeholder="Paris" className={input} autoComplete="off" /></Cell>
      <Cell label="Destination"><input name="to" defaultValue={defaults.to} placeholder="Partout" className={input} autoComplete="off" /></Cell>
      <Cell label="Date"><input name="date" type="date" defaultValue={defaults.date} className={input} /></Cell>
      <Cell label="Passagers">
        <select name="pax" defaultValue={defaults.pax ?? ""} className={`${input} appearance-none`}>
          <option value="" className="bg-night">Tous</option>
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => <option key={n} value={n} className="bg-night">{n}</option>)}
        </select>
      </Cell>
      <div className="p-2.5">
        <button className="lx-btn h-full w-full rounded-2xl px-8 py-4" type="submit">Rechercher</button>
      </div>
    </form>
  );
}
