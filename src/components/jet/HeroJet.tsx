"use client";
import dynamic from "next/dynamic";

// Three.js chargé à la demande : n'alourdit pas le premier affichage du texte.
export const HeroJet = dynamic(() => import("./JetScene").then((m) => m.JetScene), { ssr: false });
