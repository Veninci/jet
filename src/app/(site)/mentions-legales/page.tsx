import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>{site.name} — [forme sociale, capital], [adresse du siège]. RCS [ville et numéro]. TVA intracommunautaire [numéro].
        Directeur de la publication : [nom]. Contact : [e-mail], [téléphone].</p>
      <p>[Le cas échéant : immatriculation au registre des opérateurs de voyages et de séjours Atout France n° IM…,
        garant financier : …, assureur RC professionnelle : …]</p>
      <h2>Hébergeur</h2>
      <p>[Nom, adresse et téléphone de l&apos;hébergeur].</p>
      <h2>Nature du service</h2>
      <p>{site.name} agit en qualité d&apos;intermédiaire. {site.name} n&apos;est pas un transporteur aérien et n&apos;exploite
        aucun aéronef. Les vols sont réalisés par des transporteurs titulaires d&apos;un certificat de transporteur aérien et
        d&apos;une licence d&apos;exploitation, identifiés dans chaque proposition.</p>
    </LegalPage>
  );
}
