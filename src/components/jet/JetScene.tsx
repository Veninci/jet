"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildJet } from "./buildJet";
import { jetState, prefersReducedMotion } from "@/lib/motion/store";

type Pose = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number; s: number };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Jet 3D en vol. `poses` : [entrée, repos, sortie] interpolées selon jetState.intro puis jetState.progress.
 * Rendu suspendu hors écran et onglet masqué ; aucune animation si l'utilisateur réduit les mouvements.
 */
export function JetScene({ className = "", poses }: { className?: string; poses?: { from: Pose; rest: Pose; to: Pose } }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    const reduce = prefersReducedMotion();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.85;
    scene.add(new THREE.HemisphereLight("#dfeaf5", "#c9b9a3", 0.55));
    const sun = new THREE.DirectionalLight("#fff3e2", 3.2);
    sun.position.set(8, 12, 10);
    scene.add(sun);
    const rim = new THREE.DirectionalLight("#cfe1f2", 1.4);
    rim.position.set(-10, 4, -8);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
    camera.position.set(0, 5.5, 26);
    camera.lookAt(0, 0, 0);

    const jet = buildJet();
    const pivot = new THREE.Group();
    pivot.add(jet);
    scene.add(pivot);

    const P = poses ?? {
      from: { x: -18, y: -5, z: -4, yaw: -0.5, pitch: 0.12, roll: -0.5, s: 1 },
      rest: { x: 1, y: -0.6, z: 0, yaw: -0.95, pitch: 0.1, roll: -0.32, s: 1 },
      to: { x: 14, y: 7, z: -24, yaw: -1.05, pitch: 0.22, roll: -0.55, s: 1 },
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Recadrage mobile : on recule la caméra pour garder l'avion entier
      camera.position.z = w < 700 ? 40 : 26;
      camera.updateProjectionMatrix();
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Visibilité mesurée à chaque image : IntersectionObserver se trompe sur un élément épinglé par GSAP.
    const isVisible = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
    };

    const timer = new THREE.Timer();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !isVisible()) return;
      timer.update();
      const t = timer.getElapsed();
      const intro = reduce ? 1 : ease(jetState.intro);
      const prog = reduce ? 0 : jetState.progress;
      const a = intro < 1 ? P.from : P.rest;
      const b = intro < 1 ? P.rest : P.to;
      const k = intro < 1 ? intro : prog * prog * (3 - 2 * prog);
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const bob = reduce ? 0 : Math.sin(t * 0.9) * 0.18;
      // Mobile : avion recentré et descendu derrière le logotype, pour dégager le texte.
      const mobile = el.clientWidth < 700;
      const xs = mobile ? 0.3 : 1;
      const ys = mobile ? -3.2 : 0;
      pivot.position.set(mix(a.x, b.x, k) * xs, mix(a.y, b.y, k) + ys + bob, mix(a.z, b.z, k));
      pivot.rotation.set(
        mix(a.roll, b.roll, k) + (reduce ? 0 : Math.sin(t * 0.7) * 0.025) + pointer.y * 0.04,
        mix(a.yaw, b.yaw, k) + pointer.x * 0.08,
        mix(a.pitch, b.pitch, k) - pointer.y * 0.03,
        "YXZ",
      );
      const s = mix(a.s, b.s, k);
      pivot.scale.setScalar(s);
      renderer.render(scene, camera);
      if (!announced) {
        announced = true;
        window.dispatchEvent(new Event("jet:ready"));
      }
    };
    let announced = false;
    renderer.compile(scene, camera);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      pmrem.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => {
            (mat as THREE.MeshStandardMaterial).map?.dispose();
            mat.dispose();
          });
        }
      });
      renderer.domElement.remove();
    };
  }, [poses]);

  if (failed) return null;
  return <div ref={host} className={className} />;
}
