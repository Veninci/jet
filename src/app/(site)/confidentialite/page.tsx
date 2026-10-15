import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>{site.name}, [adresse]. Contact données personnelles : [e-mail dédié].</p>
      <h2>Données collectées et finalités</h2>
      <ul>
        <li>Demandes de vol (identité, coordonnées, trajet, dates, passagers, budget, commentaires) : traitement de votre demande
          et mesures précontractuelles — base légale : article 6.1.b RGPD.</li>
        <li>Source d&apos;arrivée sur le site (campagne, page d&apos;entrée) : suivi de l&apos;efficacité commerciale — intérêt légitime (6.1.f).</li>
        <li>Mesure d&apos;audience et publicité (Google Analytics, Google Ads) : uniquement avec votre consentement (6.1.a), révocable à tout moment.</li>
      </ul>
      <h2>Destinataires</h2>
      <p>Notre équipe commerciale ; les opérateurs aériens consultés pour votre vol, limités aux informations nécessaires
        (trajet, dates, nombre et identité des passagers lorsque la réservation l&apos;exige) ; nos sous-traitants techniques
        (hébergement [nom, pays], e-mail transactionnel [nom, pays]). [Préciser les transferts hors UE et leurs garanties.]</p>
      <h2>Durées de conservation</h2>
      <ul>
        <li>Prospects sans suite : [3 ans] à compter du dernier contact.</li>
        <li>Clients : durée de la relation, puis archivage selon les obligations légales (pièces comptables : 10 ans).</li>
        <li>Choix relatifs aux cookies : 6 mois.</li>
      </ul>
      <h2>Vos droits</h2>
      <p>Accès, rectification, effacement, limitation, opposition, portabilité : [e-mail]. Réclamation possible auprès de la CNIL (cnil.fr).</p>
      <h2>Sécurité</h2>
      <p>Données hébergées sur une base chiffrée en transit (TLS), accès réservé aux personnes habilitées, comptes nominatifs, journalisation des actions.</p>
    </LegalPage>
  );
}
