"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function ViewTracker({ event, params }: { event: "view_flight"; params: Record<string, unknown> }) {
  useEffect(() => { track(event, params); }, [event, params]);
  return null;
}
