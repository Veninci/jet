import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Conditions de service", robots: { index: false } };

export default function Page() {
  return (
    <LegalPage title="Conditions de service">
      <h2>1. Rôle de {site.name}</h2>
      <p>{site.name} est un intermédiaire. [Préciser le mandat retenu après avis juridique : mandataire du client
        (courtier) ou agent de l&apos;opérateur.] {site.name} n&apos;est pas transporteur aérien. Le contrat de transport est
        conclu avec l&apos;opérateur, qui reste seul responsable de l&apos;exécution du vol, de la sécurité et de l&apos;équipage.</p>
      <h2>2. Les étapes, et ce qu&apos;elles engagent</h2>
      <ul>
        <li><strong>Demande</strong> : gratuite, sans engagement. Elle ne réserve aucun vol.</li>
        <li><strong>Proposition</strong> : document écrit indiquant l&apos;opérateur, l&apos;appareil, l&apos;itinéraire, les horaires, le
          prix total, les conditions de paiement et d&apos;annulation, et sa durée de validité.</li>
        <li><strong>Confirmation de l&apos;opérateur</strong> : acceptation écrite par l&apos;opérateur de réaliser le vol aux conditions proposées.</li>
        <li><strong>Réservation définitive</strong> : après signature du contrat par le client et [modalités de paiement à définir].</li>
      </ul>
      <h2>3. Spécificités des Empty Legs</h2>
      <p>Un Empty Leg dépend de la mission principale de l&apos;appareil. L&apos;opérateur peut modifier l&apos;horaire, l&apos;itinéraire
        ou annuler le vol si cette mission change, y compris après réservation. [Conditions de remboursement et
        d&apos;alternative à définir avec chaque opérateur.]</p>
      <h2>4. Prix</h2>
      <p>Les prix affichés sur le site sont indicatifs tant qu&apos;une proposition écrite n&apos;a pas été émise. [Préciser
        la rémunération de l&apos;intermédiaire : commission incluse dans le prix / honoraires distincts.]</p>
      <h2>5. Paiement</h2>
      <p>Aucun paiement n&apos;est collecté sur le site. [Modalités à définir après validation du statut juridique.]</p>
    </LegalPage>
  );
}
