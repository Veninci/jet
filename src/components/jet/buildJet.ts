import * as THREE from "three";

/**
 * Jet d'affaires modélisé procéduralement (aucun modèle 3D externe, aucune licence tierce).
 * Repère : nez vers +X, haut +Y, envergure sur Z. Longueur du fuselage ≈ 10 unités.
 */
const INK = "#000d10";

const L = 10; // longueur fuselage
const R = 0.62; // rayon max

function fuselageRadius(t: number) {
  // t = 0 queue → 1 nez
  const smooth = (a: number, b: number, x: number) => {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return k * k * (3 - 2 * k);
  };
  if (t < 0.3) return 0.08 + (R - 0.08) * smooth(0, 0.3, t);
  if (t < 0.78) return R;
  const s = (t - 0.78) / 0.22;
  return R * Math.pow(Math.max(0, 1 - Math.pow(s, 2.3)), 0.52);
}

function livery(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6f7f9";
  g.fillRect(0, 0, W, H);
  const X = (u: number) => u * W; // tour (u)
  const Y = (t: number) => (1 - t) * H; // longueur (t : queue 0 → nez 1)

  // Liseré sombre effilé sous les hublots, des deux côtés
  const stripe = (uMid: number, dir: 1 | -1) => {
    g.beginPath();
    g.moveTo(X(uMid), Y(0.1));
    g.lineTo(X(uMid + dir * 0.026), Y(0.16));
    g.lineTo(X(uMid + dir * 0.026), Y(0.74));
    g.quadraticCurveTo(X(uMid + dir * 0.02), Y(0.86), X(uMid - dir * 0.004), Y(0.9));
    g.lineTo(X(uMid - dir * 0.004), Y(0.86));
    g.lineTo(X(uMid), Y(0.2));
    g.closePath();
    g.fillStyle = INK;
    g.fill();
  };
  stripe(0.045, 1);
  stripe(0.455, -1);
  // côté +Z : u proche de 0 et de 1 (raccord)
  g.save();
  g.translate(W, 0);
  stripe(0.045, 1);
  g.restore();

  // Hublots ovales
  const windows = (u: number) => {
    for (let i = 0; i < 7; i++) {
      const t = 0.44 + i * 0.047;
      g.beginPath();
      g.ellipse(X(u), Y(t), 0.024 * W, 0.0115 * H, 0, 0, Math.PI * 2);
      g.fillStyle = "#0b1a22";
      g.fill();
    }
  };
  windows(0.968);
  windows(0.532);

  // Pare-brise (haut avant)
  g.fillStyle = "#0a141b";
  const pane = (u0: number, u1: number) => {
    g.beginPath();
    g.moveTo(X(u0), Y(0.872));
    g.lineTo(X(u1), Y(0.872));
    g.lineTo(X(u1 - 0.01), Y(0.918));
    g.lineTo(X(u0 + 0.02), Y(0.912));
    g.closePath();
    g.fill();
  };
  pane(0.6, 0.735);
  pane(0.765, 0.9);

  // Porte (côté gauche) : simple contour
  g.strokeStyle = "rgba(0,13,16,0.35)";
  g.lineWidth = 3;
  g.strokeRect(X(0.505), Y(0.81), 0.05 * W, 0.045 * H);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function extrude(points: [number, number][], depth: number, bevel = 0.035) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

export function buildJet() {
  const jet = new THREE.Group();

  const white = new THREE.MeshPhysicalMaterial({ color: "#f5f6f8", roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 });
  const ink = new THREE.MeshPhysicalMaterial({ color: INK, roughness: 0.35, metalness: 0.2, clearcoat: 0.6 });
  const metal = new THREE.MeshStandardMaterial({ color: "#b9bec6", roughness: 0.35, metalness: 0.8 });

  // ---- Fuselage (tour) ----
  const N = 180;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.0001, -L / 2)];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new THREE.Vector2(Math.max(0.0001, fuselageRadius(t)), (t - 0.5) * L));
  }
  const fus = new THREE.LatheGeometry(pts, 96);
  fus.rotateZ(-Math.PI / 2); // axe Y → X, nez vers +X
  // Queue relevée (forme typique d'un jet d'affaires)
  const pos = fus.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const t = x / L + 0.5;
    if (t < 0.32) pos.setY(i, pos.getY(i) + Math.pow((0.32 - t) / 0.32, 2) * 0.55);
  }
  fus.computeVertexNormals();
  const fusMat = white.clone();
  fusMat.map = livery();
  jet.add(new THREE.Mesh(fus, fusMat));

  // ---- Ailes basses, en flèche, avec dièdre ----
  const wingPlan: [number, number][] = [
    [0.7, 0], [-1.25, 4.7], [-1.95, 4.75], [-1.75, 0],
  ];
  for (const side of [-1, 1] as const) {
    const geo = extrude(wingPlan.map(([x, y]) => [x, y * side]) as [number, number][], 0.07, 0.05);
    geo.rotateX(-Math.PI / 2);
    const wing = new THREE.Mesh(geo, white);
    wing.position.set(-0.4, -0.38, 0);
    wing.rotation.x = side === 1 ? 0.075 : -0.075;
    jet.add(wing);

    // Winglet
    const wl = new THREE.Mesh(extrude([[0, 0], [0.75, 0], [0.98, 0.85], [0.68, 0.85]], 0.05, 0.02), ink);
    wl.position.set(-2.35, -0.38 + 4.72 * 0.075, -4.72 * side);
    wl.rotation.x = side === 1 ? 0.15 : -0.15;
    jet.add(wl);
  }

  // ---- Empennage en T ----
  const fin = new THREE.Mesh(extrude([[-3.0, 0], [-4.75, 0], [-5.2, 2.05], [-4.45, 2.05]], 0.1, 0.04), white);
  fin.position.y = 0.55;
  jet.add(fin);
  const finTip = new THREE.Mesh(extrude([[-4.45, 1.55], [-5.08, 1.55], [-5.2, 2.05], [-4.45, 2.05]], 0.115, 0.04), ink);
  finTip.position.y = 0.55;
  jet.add(finTip);
  const hstabGeo = extrude([[-4.4, 0], [-5.05, 1.95], [-5.4, 1.95], [-5.15, 0], [-5.4, -1.95], [-5.05, -1.95]], 0.06, 0.03);
  hstabGeo.rotateX(-Math.PI / 2);
  const hstab = new THREE.Mesh(hstabGeo, white);
  hstab.position.y = 2.6;
  jet.add(hstab);

  // ---- Réacteurs arrière ----
  const nacPts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const r = 0.36 * Math.pow(Math.sin(Math.PI * (0.12 + 0.76 * t)), 0.35);
    nacPts.push(new THREE.Vector2(r, (t - 0.5) * 1.9));
  }
  for (const side of [-1, 1]) {
    const nac = new THREE.LatheGeometry(nacPts, 48);
    nac.rotateZ(-Math.PI / 2);
    const m = new THREE.Mesh(nac, white);
    m.position.set(-3.15, 0.42, 1.08 * side);
    jet.add(m);
    const intake = new THREE.Mesh(new THREE.CircleGeometry(0.27, 40), ink);
    intake.rotation.y = Math.PI / 2;
    intake.position.set(-3.15 + 0.94, 0.42, 1.08 * side);
    jet.add(intake);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 12, 48), metal);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-3.15 + 0.93, 0.42, 1.08 * side);
    jet.add(ring);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.55), white);
    pylon.position.set(-3.25, 0.42, 0.72 * side);
    jet.add(pylon);
  }

  jet.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = false;
  });
  return jet;
}
