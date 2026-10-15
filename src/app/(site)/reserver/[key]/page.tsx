import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BookingFlow } from "@/components/BookingFlow";
import { getPublicLeg } from "@/connectors/registry";
import { toFlightDTO } from "@/lib/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Réserver", robots: { index: false, follow: false } };

export default async function BookPage({ params }: { params: Promise<{ key: string }> }) {
  const leg = await getPublicLeg(decodeURIComponent((await params).key));
  if (!leg) notFound();
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><BookingFlow flight={toFlightDTO(leg)} /></div>
    </main>
  );
}
