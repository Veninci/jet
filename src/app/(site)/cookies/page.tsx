import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ConsentLink } from "@/components/ConsentAndAnalytics";

export const metadata: Metadata = { title: "Cookies", robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Cookies et traceurs">
      <h2>Traceurs strictement nécessaires (sans consentement)</h2>
      <ul>
        <li><code>el_consent_v1</code> (stockage local) : mémorise vos choix, 6 mois.</li>
        <li><code>el_attr</code> (stockage de session, effacé à la fermeture de l&apos;onglet) : page d&apos;entrée et paramètres de campagne (utm), associés à votre demande si vous l&apos;envoyez.</li>
        <li><code>el_admin</code> : session de l&apos;espace d&apos;administration (personnel uniquement).</li>
      </ul>
      <h2>Traceurs soumis à consentement</h2>
      <ul>
        <li>Google Analytics 4 : mesure d&apos;audience.</li>
        <li>Google Ads : mesure des conversions publicitaires, identifiant de clic (gclid).</li>
      </ul>
      <p>Aucun de ces traceurs n&apos;est déposé avant votre accord. <ConsentLink /></p>
    </LegalPage>
  );
}
