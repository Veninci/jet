"use client";
import { useEffect, useRef, useState } from "react";
import type { GlassStage } from "./engine";
import { prefersReducedMotion } from "@/lib/motion/store";

const ICONS: Record<string, React.ReactNode> = {
  shield: <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z M9 12l2 2 4-4" />,
  euro: <path d="M17 6.5A7 7 0 1 0 17 17.5 M4 10.5h9 M4 13.5h9" />,
  people: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5 M16 4.5a3.5 3.5 0 0 1 0 6.8 M18 14.8c2 .7 3.2 2.3 3.5 5.2" />,
  globe: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" />,
};

export type Chapter = { a: string; b: string };
const chapters = {
  c1: { a: "Le vide,", b: "réinventé." },
  c2: { a: "Un trajet,", b: "pas un compromis." },
  c3: { a: "Ce que nous", b: "vous garantissons." },
  c4: { a: "Simple,", b: "par conception." },
};
const benefits = [
  { icon: "shield", text: "Uniquement des opérateurs titulaires d'un certificat de transporteur aérien." },
  { icon: "euro", text: "Prix total et conditions écrits avant tout engagement de votre part." },
  { icon: "people", text: "Un conseiller unique, de la demande jusqu'au décollage." },
  { icon: "globe", text: "Aéroports alternatifs étudiés pour multiplier les options." },
];
// Chiffres réels du service (pas de statistiques inventées) : parcours, paiement, fraîcheur des vols.
const figures = [
  { value: 2, suffix: "", label: "écrans pour<br>demander un vol" },
  { value: 0, suffix: " €", label: "demandé avant<br>confirmation écrite" },
  { value: 24, suffix: " h", label: "au plus depuis la vérification<br>d'un vol affiché" },
];

function Title({ c }: { c: Chapter }) {
  return (
    <h2 className="slide-title">
      <span className="line"><span className="line-inner">{c.a}</span></span>
      <span className="line muted"><span className="line-inner">{c.b}</span></span>
    </h2>
  );
}

function Chapters({ staticMode }: { staticMode: boolean }) {
  const cls = staticMode ? "slide-static" : "slide";
  return (
    <>
      <div className={cls} data-slide="1">
        <p className="slide-kicker">01 — Le principe</p>
        <Title c={chapters.c1} />
        <p className="slide-desc">Un Empty Leg est un jet qui doit se repositionner sans passagers. Son opérateur le propose à prix réduit : nous vous y installons.</p>
      </div>
      <div className={cls} data-slide="2">
        <p className="slide-kicker">02 — La différence</p>
        <Title c={chapters.c2} />
        <p className="slide-desc">Même appareil, même équipage, même opérateur certifié qu&apos;un affrètement classique. Seuls l&apos;horaire et l&apos;itinéraire sont fixés par la mission de l&apos;avion — et nous les vérifions avant de vous proposer le vol.</p>
      </div>
      <div className={cls} data-slide="3">
        <p className="slide-kicker">03 — Nos engagements</p>
        <Title c={chapters.c3} />
        <ul className="benefits">
          {benefits.map((b) => (
            <li key={b.icon} className="benefit">
              <span className="benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[b.icon]}</svg></span>
              <p>{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className={cls} data-slide="4">
        <p className="slide-kicker">04 — Le parcours</p>
        <Title c={chapters.c4} />
        <p className="slide-desc">Réserver un Empty Leg ne devrait pas demander plus d&apos;effort que le vol lui-même.</p>
        <dl className="figures">
          {figures.map((f) => (
            <div key={f.label} className="figure">
              <dt><span className="figure-value" data-count={f.value} data-decimals="0">{f.value}</span>{f.suffix}</dt>
              <dd dangerouslySetInnerHTML={{ __html: f.label }} />
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}

/**
 * Section cinématique « verre » : un jet en verre optique se décompose en quatre fragments
 * puis se recompose au fil du scroll (moteur du skill Premium 3D Glass, adapté).
 * Repli sans WebGL ou mouvements réduits : chapitres affichés à plat, sans 3D.
 */
export function GlassStory() {
  const stage = useRef<HTMLElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"cinema" | "static">("cinema");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const webgl2 = (() => {
      try { return Boolean(document.createElement("canvas").getContext("webgl2")); } catch { return false; }
    })();
    if (prefersReducedMotion() || !webgl2) {
      setMode("static");
      return;
    }
    let engine: GlassStage | null = null;
    let cancelled = false;
    import("./engine.js").then(({ mountGlassStage }) => {
      if (cancelled || !root.current || !canvas.current || !stage.current) return;
      return mountGlassStage({
        root: root.current,
        canvas: canvas.current,
        stage: stage.current,
        shapeUrl: "/glass/jet.svg",
        // Ciel d'aube → crépuscule → horizon argile → nuit
        palette: ["#4a7fc1", "#6d6fd0", "#9b7bb8", "#bc7155", "#3a2a52"],
        onReady: () => setReady(true),
      }).then((e) => {
        if (cancelled) e.destroy();
        else {
          engine = e;
          (window as unknown as { __glass?: GlassStage }).__glass = e;
        }
      });
    }).catch((err) => {
      console.error("[glass]", err);
      setMode("static");
    });
    return () => {
      cancelled = true;
      engine?.destroy();
    };
  }, []);

  if (mode === "static") {
    return (
      <section aria-label="Notre approche" className="glass-static bg-hull py-24 text-white">
        <div className="wrap grid gap-20"><Chapters staticMode /></div>
      </section>
    );
  }

  return (
    <section ref={stage} aria-label="Notre approche" className="glass-stage relative h-[600vh] bg-black">
      <div ref={root} className="sticky top-0 h-[100svh] overflow-hidden text-white">
        <canvas ref={canvas} aria-hidden="true" className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} />
        <Chapters staticMode={false} />
        <div className="story-dashes" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => <div key={i} className="story-dash"><div className="story-dash-fill" data-dash={i} /></div>)}
        </div>
      </div>
    </section>
  );
}
