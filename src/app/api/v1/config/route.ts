import { json, preflight } from "@/lib/api";
import { site } from "@/lib/config";
import { faq } from "@/content/faq";
import { media } from "@/content/media";

export const OPTIONS = preflight;

/** Configuration partagée : l'app mobile affiche les mêmes textes, contacts et liens légaux que le site. */
export async function GET(req: Request) {
  return json(req, {
    data: {
      brand: { name: site.name, tagline: site.tagline },
      contact: { phone: site.phone || null, email: site.email || null },
      responseTime: site.responseTime,
      legal: {
        terms: `${site.url}/conditions`,
        privacy: `${site.url}/confidentialite`,
        legalNotice: `${site.url}/mentions-legales`,
      },
      heroImage: { url: media.heroJet.src, alt: media.heroJet.alt, credit: media.heroJet.credit },
      faq,
      disclaimer:
        "Les Empty Legs sont soumis à confirmation de l'opérateur. Une demande n'est pas une réservation : aucun paiement n'est demandé avant confirmation écrite.",
    },
  }, { cache: "public, max-age=300" });
}
