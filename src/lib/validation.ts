import { z } from "zod";

z.config(z.locales.fr());

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide");

export const leadSchema = z
  .object({
    departure: z.string().trim().min(2, "Indiquez une ville ou un aéroport de départ").max(120),
    arrival: z.string().trim().min(2, "Indiquez une ville ou un aéroport d'arrivée").max(120),
    departureDate: isoDate,
    returnDate: isoDate.optional().or(z.literal("").transform(() => undefined)),
    tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]).default("ONE_WAY"),
    flexibilityDays: z.coerce.number().int().min(0).max(14).default(0),
    passengers: z.coerce.number().int().min(1, "Au moins 1 passager").max(19, "19 passagers maximum"),
    budget: z
      .union([z.literal(""), z.coerce.number().int().min(0).max(10_000_000)])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    firstName: z.string().trim().min(1, "Prénom requis").max(80),
    lastName: z.string().trim().min(1, "Nom requis").max(80),
    email: z.string().trim().toLowerCase().email("E-mail invalide").max(200),
    phone: z
      .string()
      .trim()
      .min(6, "Téléphone requis")
      .max(30)
      .regex(/^[+0-9 ().-]+$/, "Téléphone invalide"),
    comments: optionalText(2000),
    offerId: optionalText(40),
    consentContact: z.literal(true, { error: "Votre accord est nécessaire pour que nous puissions vous recontacter" }),
    // Acquisition (renseignés automatiquement côté client)
    utmSource: optionalText(120),
    utmMedium: optionalText(120),
    utmCampaign: optionalText(200),
    utmTerm: optionalText(200),
    gclid: optionalText(300),
    landingPage: optionalText(500),
    referrer: optionalText(500),
    // Pot de miel anti-robots : doit rester vide
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (new Date(v.departureDate) < today) {
      ctx.addIssue({ code: "custom", path: ["departureDate"], message: "La date doit être aujourd'hui ou plus tard" });
    }
    if (v.tripType === "ROUND_TRIP") {
      if (!v.returnDate) ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Date de retour requise" });
      else if (v.returnDate < v.departureDate)
        ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Le retour doit suivre le départ" });
    }
  });

export type LeadInput = z.infer<typeof leadSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const offerSchema = z
  .object({
    fromCity: z.string().trim().min(2).max(80),
    fromAirport: z.string().trim().min(2).max(120),
    fromIcao: optionalText(4),
    toCity: z.string().trim().min(2).max(80),
    toAirport: z.string().trim().min(2).max(120),
    toIcao: optionalText(4),
    departureStart: z.string().min(10),
    departureEnd: z.string().min(10),
    maxPassengers: z.union([z.literal(""), z.coerce.number().int().min(1).max(19)]).optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    aircraftCategory: optionalText(60),
    aircraftType: optionalText(80),
    showAircraft: z.coerce.boolean().default(false),
    priceKind: z.enum(["ON_REQUEST", "INDICATIVE", "CONFIRMED"]),
    priceAmount: z.union([z.literal(""), z.coerce.number().int().min(0)]).optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    conditions: optionalText(1000),
    provenance: z.string().trim().min(5, "Indiquez la provenance (opérateur, canal, date)").max(500),
    published: z.coerce.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (new Date(v.departureEnd) < new Date(v.departureStart))
      ctx.addIssue({ code: "custom", path: ["departureEnd"], message: "Fin de créneau avant le début" });
    if (v.priceKind !== "ON_REQUEST" && v.priceAmount === undefined)
      ctx.addIssue({ code: "custom", path: ["priceAmount"], message: "Prix requis pour ce type de tarif" });
  });
