import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OfferForm } from "../OfferForm";

export default async function EditOffer({ params }: { params: Promise<{ id: string }> }) {
  const offer = await prisma.offer.findUnique({ where: { id: (await params).id } });
  if (!offer) notFound();
  return (<div><h1 className="font-display mb-6 text-3xl">Modifier l&apos;offre {offer.isDemo && "(FICTIVE)"}</h1><OfferForm offer={offer} /></div>);
}
