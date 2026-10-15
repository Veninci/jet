/** État d'animation partagé entre les déclencheurs de scroll (GSAP) et la scène 3D. */
export const jetState = {
  /** Progression du scroll dans le hero (0 → 1). */
  progress: 0,
  /** Apparition initiale (0 → 1), animée au chargement. */
  intro: 0,
};

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

if (typeof window !== "undefined") (window as unknown as { __jetState?: typeof jetState }).__jetState = jetState;
