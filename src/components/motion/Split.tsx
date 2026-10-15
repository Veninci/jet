/** Découpe un texte en mots masqués pour l'animation [data-split]. Rendu serveur, lisible sans JS. */
export function Split({ text, className = "", as: Tag = "span", manual = false }: {
  text: string; className?: string; as?: "span" | "h1" | "h2" | "h3" | "p"; manual?: boolean;
}) {
  const lines = text.split("\n");
  return (
    <Tag className={className} data-split={manual ? "manual" : ""}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(" ").map((w, i, arr) => (
            <span key={i}><span className="w"><span>{w}</span></span>{i < arr.length - 1 ? " " : ""}</span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

/** Texte dont les mots s'éclairent progressivement au scroll ([data-scrub-words]). */
export function ScrubWords({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={className} data-scrub-words="">
      {text.split(" ").map((w, i) => <span key={i} className="sw">{w} </span>)}
    </p>
  );
}
