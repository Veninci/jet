"use client";
import { useActionState } from "react";
import type { Offer } from "@prisma/client";
import { saveOffer } from "../../actions";

const local = (d?: Date) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function OfferForm({ offer }: { offer?: Offer }) {
  const [state, action, pending] = useActionState(saveOffer, null);
  const e = (k: string) => state?.errors?.[k] && <p className="text-xs text-red-700">{state.errors[k]}</p>;
  const f = (name: keyof Offer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="text-xs text-mist">{label}
      <input name={name} defaultValue={(offer?.[name] as string | number | undefined) ?? ""} className="field mt-1 py-2 text-sm" {...props} />{e(name)}
    </label>
  );
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
      {offer && <input type="hidden" name="id" value={offer.id} />}
      {f("fromCity", "Ville de départ", { required: true })}
      {f("fromAirport", "Aéroport de départ", { required: true })}
      {f("fromIcao", "OACI départ", { maxLength: 4 })}
      {f("toCity", "Ville d'arrivée", { required: true })}
      {f("toAirport", "Aéroport d'arrivée", { required: true })}
      {f("toIcao", "OACI arrivée", { maxLength: 4 })}
      <label className="text-xs text-mist">Départ au plus tôt (heure locale navigateur)<input type="datetime-local" name="departureStart" defaultValue={local(offer?.departureStart)} className="field mt-1 py-2 text-sm" required />{e("departureStart")}</label>
      <label className="text-xs text-mist">Départ au plus tard<input type="datetime-local" name="departureEnd" defaultValue={local(offer?.departureEnd)} className="field mt-1 py-2 text-sm" required />{e("departureEnd")}</label>
      {f("maxPassengers", "Passagers max", { type: "number", min: 1, max: 19 })}
      {f("aircraftCategory", "Catégorie (ex. Light jet)")}
      {f("aircraftType", "Type d'appareil")}
      <label className="flex items-center gap-2 self-end text-xs"><input type="checkbox" name="showAircraft" defaultChecked={offer?.showAircraft} /> Afficher le type d&apos;appareil (si la source l&apos;autorise)</label>
      <label className="text-xs text-mist">Type de prix
        <select name="priceKind" defaultValue={offer?.priceKind ?? "ON_REQUEST"} className="field mt-1 py-2 text-sm">
          <option value="ON_REQUEST">Sur demande</option><option value="INDICATIVE">Indicatif</option><option value="CONFIRMED">Communiqué par l&apos;opérateur</option>
        </select></label>
      {f("priceAmount", "Prix (€)", { type: "number", min: 0 })}
      <label className="text-xs text-mist sm:col-span-2 lg:col-span-3">Conditions affichées<textarea name="conditions" defaultValue={offer?.conditions ?? ""} rows={2} className="field mt-1 text-sm" /></label>
      <label className="text-xs text-mist sm:col-span-2 lg:col-span-3">Provenance (obligatoire, interne) : opérateur, canal, date, autorisation de diffusion
        <textarea name="provenance" defaultValue={offer?.provenance ?? ""} rows={2} className="field mt-1 text-sm" required />{e("provenance")}</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={offer?.published} /> Publier sur le site</label>
      <p className="text-xs text-mist sm:col-span-2">L&apos;enregistrement vaut vérification de disponibilité à l&apos;instant. Sans nouvelle vérification, l&apos;offre disparaît du site après 24 h.</p>
      <button className="btn-primary sm:col-span-2 lg:col-span-3" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}
