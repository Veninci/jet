/**
 * Visuel vectoriel de remplacement (aucune photo sous licence disponible dans le dépôt).
 * À remplacer par une photographie professionnelle sous licence : placer /public/images/hero.jpg
 * et passer `photo` à true dans la page d'accueil.
 */
export function HeroArt({ photo = false }: { photo?: boolean }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
    );
  }
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1422" />
          <stop offset="0.55" stopColor="#1d2f4b" />
          <stop offset="0.82" stopColor="#7a6a5a" />
          <stop offset="1" stopColor="#c9a77a" />
        </linearGradient>
        <radialGradient id="sun" cx="0.72" cy="0.86" r="0.5">
          <stop offset="0" stopColor="#f3d9a8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f3d9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fuselage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9ecf1" />
          <stop offset="1" stopColor="#9aa3b2" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sky)" />
      <rect width="1440" height="900" fill="url(#sun)" />
      <g opacity="0.18" fill="#fff">
        <ellipse cx="260" cy="640" rx="420" ry="26" />
        <ellipse cx="1180" cy="700" rx="520" ry="30" />
        <ellipse cx="760" cy="760" rx="680" ry="34" />
      </g>
      {/* Silhouette de jet d'affaires */}
      <g className="max-md:hidden" transform="translate(1080 210) rotate(-7) scale(0.82)">
        <path d="M-330 40 C -250 18, 120 6, 250 12 C 300 15, 338 28, 352 40 C 338 52, 300 62, 250 64 C 120 70, -250 62, -330 40 Z" fill="url(#fuselage)" />
        <path d="M-60 44 L 70 44 L -40 150 L -95 150 Z" fill="#c4cad4" />
        <path d="M-60 36 L 40 36 L -30 -40 L -70 -40 Z" fill="#aeb6c2" opacity="0.7" />
        <path d="M-300 36 L -250 34 L -300 -48 L -332 -48 Z" fill="#b9c0cb" />
        <rect x="-240" y="22" width="70" height="26" rx="13" fill="#d9dee5" />
        <g fill="#1b2a40">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (<ellipse key={i} cx={10 + i * 30} cy="30" rx="7" ry="6" />))}
        </g>
        <path d="M290 22 C 312 24, 330 30, 342 38 L 300 36 Z" fill="#1b2a40" />
      </g>
      <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0b1422" stopOpacity="0.55" />
        <stop offset="0.6" stopColor="#0b1422" stopOpacity="0.15" />
        <stop offset="1" stopColor="#0b1422" stopOpacity="0" />
      </linearGradient>
      <rect width="1440" height="900" fill="url(#veil)" />
    </svg>
  );
}
