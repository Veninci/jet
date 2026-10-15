"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { site } from "@/lib/config";

const links = [
  { href: "/vols", label: "Empty Legs" },
  { href: "/demande", label: "Vol sur mesure" },
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#faq", label: "Questions" },
];

/**
 * En-tête fixe : transparent sur le hero, fond blanc dès qu'on défile,
 * masqué quand on descend, révélé quand on remonte. Menu plein écran animé sur mobile.
 */
export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 240 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    if (open) {
      window.__lenis?.stop();
      gsap.fromTo(el, { clipPath: "circle(0% at calc(100% - 44px) 44px)" }, { clipPath: "circle(150% at calc(100% - 44px) 44px)", duration: 0.9, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll("[data-menu-item]"), { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.25 });
    } else {
      window.__lenis?.start();
    }
  }, [open]);

  const dark = tone === "dark" && !scrolled;
  const text = dark ? "text-white" : "text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter] duration-500 ease-[var(--ease-out-expo)]
          ${hidden && !open ? "-translate-y-full" : "translate-y-0"} ${scrolled ? "bg-white/80 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className={`wrap flex items-center justify-between py-4 ${text}`}>
          <Link href="/" className="text-[26px] font-bold tracking-[-0.05em]" aria-label={`${site.name} — accueil`}>
            {site.name}
          </Link>
          <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-[17px] md:flex">
            {links.slice(0, 3).map((l) => (
              <Link key={l.href} href={l.href} className="group relative py-1">
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/vols" className={`hidden sm:inline-flex ${dark ? "pill-ghost" : "pill"} py-3`}>Réserver</Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="menu-plein-ecran"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((o) => !o)}
              className={`relative z-[60] grid size-12 place-items-center rounded-full transition md:hidden ${open ? "bg-white text-ink" : dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
              <span className={`block h-[2px] w-5 bg-current transition duration-500 ${open ? "translate-y-0 rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute block h-[2px] w-5 bg-current transition duration-500 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </div>
      </header>

      <div id="menu-plein-ecran" ref={menu} hidden={!open}
        className="fixed inset-0 z-[55] flex flex-col justify-between bg-ink px-5 pt-28 pb-10 text-white md:hidden">
        <nav aria-label="Menu" className="flex flex-col gap-2">
          {links.map((l) => (
            <span key={l.href} className="overflow-hidden">
              <Link data-menu-item href={l.href} onClick={() => setOpen(false)} className="block text-[52px] leading-[1.05] font-bold tracking-[-0.03em]">{l.label}</Link>
            </span>
          ))}
        </nav>
        <div className="space-y-4">
          <Link href="/vols" onClick={() => setOpen(false)} className="pill w-full bg-white text-ink">Réserver un vol</Link>
          {site.phone && <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block text-center text-[17px] text-ash">{site.phone}</a>}
        </div>
      </div>
    </>
  );
}
