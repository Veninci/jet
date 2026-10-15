"use client";
import { useState } from "react";
import type { Photo as PhotoT } from "@/content/media";

/**
 * Image avec repli élégant : si la photo ne charge pas (réseau, CDN), le fond dégradé reste
 * visible au lieu d'une icône d'image cassée.
 */
export function Photo({ photo, className = "", priority = false, sizes }: { photo: PhotoT; className?: string; priority?: boolean; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div aria-hidden={failed || undefined} className={`absolute inset-0 overflow-hidden sky ${className}`}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt={photo.alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
