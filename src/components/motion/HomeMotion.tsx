"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jetState, prefersReducedMotion } from "@/lib/motion/store";

gsap.registerPlugin(ScrollTrigger);

/**
 * Chorégraphie propre à l'accueil :
 *  - entrée du hero (lettres du logo, titre, jet qui arrive en vol) ;
 *  - hero épinglé : le jet s'éloigne, le logo monte, le ciel passe au crépuscule ;
 *  - Empty Legs en défilement horizontal piloté par le scroll (ordinateur).
 */
export function HomeMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      jetState.intro = 1;
      return;
    }
    const ctx = gsap.context(() => {
      // Entrée : démarre quand la scène 3D a rendu sa première image (ou après 1,5 s),
      // pour ne pas être « sautée » pendant la compilation des shaders sur un appareil lent.
      const intro = gsap.timeline({ defaults: { ease: "expo.out" }, paused: true });
      const start = () => intro.play();
      window.addEventListener("jet:ready", start, { once: true });
      const fallback = window.setTimeout(start, 1500);
      window.addEventListener("jet:cleanup", () => { clearTimeout(fallback); window.removeEventListener("jet:ready", start); }, { once: true });
      gsap.set("[data-hero-letter], [data-hero-line] > span", { y: 0, yPercent: 110 });
      gsap.set("[data-hero-fade]", { opacity: 0, y: 24 });
      jetState.intro = 0;
      intro
        .to(jetState, { intro: 1, duration: 2.6, ease: "power3.out" }, 0)
        .fromTo("[data-hero-letter]", { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.5, stagger: 0.06 }, 0.15)
        .fromTo("[data-hero-line] > span", { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.5)
        .fromTo("[data-hero-fade]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.8);

      // Hero épinglé
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: "#hero", start: "top top", end: "+=110%", pin: true, scrub: 0.6,
            onUpdate: (self) => { jetState.progress = self.progress; },
          },
        })
          .to("[data-hero-letter-out]", { yPercent: -35, opacity: 0, stagger: 0.04, ease: "power2.in" }, 0)
          .to("[data-hero-copy]", { y: -80, opacity: 0, ease: "power2.in" }, 0)
          .to("[data-hero-search]", { y: 60, opacity: 0, ease: "power2.in" }, 0.1)
          .to("[data-hero-dusk]", { opacity: 1, ease: "none" }, 0);
      });
      mm.add("(max-width: 767px)", () => {
        ScrollTrigger.create({
          trigger: "#hero", start: "top top", end: "bottom top", scrub: true,
          onUpdate: (self) => { jetState.progress = self.progress * 0.8; },
        });
      });

      // Défilement horizontal des Empty Legs
      mm.add("(min-width: 1024px)", () => {
        const track = document.querySelector<HTMLElement>("[data-legs-track]");
        const section = document.querySelector<HTMLElement>("[data-legs]");
        if (!track || !section) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);
        if (distance() < 40) return;
        gsap.to(track, {
          x: () => -distance(), ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        });
        gsap.to("[data-legs-progress]", {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });

      // Étapes : la ligne de progression se remplit
      gsap.fromTo("[data-steps-line]", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top 65%", end: "bottom 35%", toggleClass: "is-active" });
      });

      // Carte argile : léger zoom à l'entrée
      gsap.fromTo("[data-clay]", { scale: 0.92, clipPath: "inset(8% 6% 8% 6%)" }, {
        scale: 1, clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: "[data-clay]", start: "top 95%", end: "top 40%", scrub: true },
      });
    });
    return () => {
      ctx.revert();
      window.dispatchEvent(new Event("jet:cleanup"));
    };
  }, []);
  return null;
}
