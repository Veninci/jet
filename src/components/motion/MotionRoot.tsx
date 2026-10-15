"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/motion/store";

declare global {
  interface Window { __motionReady?: boolean; __lenis?: Lenis }
}

gsap.registerPlugin(ScrollTrigger);

/**
 * Moteur d'animation du site public :
 *  - défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger ;
 *  - animations déclaratives par attributs data-* (voir setupReveals).
 * Désactivé intégralement si l'utilisateur a demandé à réduire les mouvements.
 */
export function MotionRoot() {
  const pathname = usePathname();

  // Défilement fluide : une seule instance pour toute la session
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -80 }, wheelMultiplier: 0.9 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Animations déclaratives, recréées à chaque page
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    if (prefersReducedMotion()) {
      window.__motionReady = true;
      return;
    }
    const ctx = gsap.context(() => setupReveals());
    window.__motionReady = true;
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 600);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}

function setupReveals() {
  const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);

  // Apparition simple
  q("[data-reveal]").forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 48 }, {
      opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: Number(el.dataset.delay ?? 0),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  // Groupes en cascade
  q("[data-reveal-group]").forEach((group) => {
    const items = group.querySelectorAll("[data-reveal-item]");
    gsap.fromTo(items, { opacity: 0, y: 56 }, {
      opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09,
      scrollTrigger: { trigger: group, start: "top 85%", once: true },
    });
  });

  // Titres : chaque mot monte depuis un masque
  q("[data-split]:not([data-split='manual'])").forEach((el) => {
    gsap.fromTo(el.querySelectorAll(".w > span"), { y: 0, yPercent: 105 }, {
      y: 0, yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.045,
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  // Texte qui s'éclaire mot à mot au fil du scroll
  q("[data-scrub-words]").forEach((el) => {
    gsap.fromTo(el.querySelectorAll(".sw"), { opacity: 0.12 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
    });
  });

  // Images révélées par un rideau, puis légère parallaxe interne
  q("[data-clip]").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    const img = el.querySelector("img, [data-parallax-inner]");
    if (img) {
      gsap.fromTo(img, { scale: 1.25, yPercent: -6 }, {
        scale: 1.1, yPercent: 6, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  });

  // Parallaxe (data-parallax = intensité, ex. 0.2 ou -0.15)
  q("[data-parallax]").forEach((el) => {
    const k = Number(el.dataset.parallax ?? 0.2);
    gsap.fromTo(el, { yPercent: -k * 100 }, {
      yPercent: k * 100, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Grand logo du pied de page
  q("[data-grow]").forEach((el) => {
    gsap.fromTo(el, { yPercent: 40, scale: 0.86, opacity: 0.2 }, {
      yPercent: 0, scale: 1, opacity: 1, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
    });
  });
}
