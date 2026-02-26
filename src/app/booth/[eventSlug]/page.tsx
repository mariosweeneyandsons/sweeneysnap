"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BoothMode } from "@/components/booth/BoothMode";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useEffect } from "react";

export default function BoothPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const event = useQuery(api.events.getBySlug, { slug: eventSlug });
  const { request: requestWakeLock } = useWakeLock();
  const { enter: enterFullscreen } = useFullscreen();

  useEffect(() => {
    requestWakeLock();
    // Request fullscreen on first user interaction
    const handleClick = () => {
      enterFullscreen();
      document.removeEventListener("click", handleClick);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [requestWakeLock, enterFullscreen]);

  if (event === undefined) {
    return (
      <main className="min-h-dvh bg-black text-white flex items-center justify-center">
        <p style={{ opacity: 0.5 }}>Loading...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-dvh bg-black text-white flex items-center justify-center">
        <p style={{ opacity: 0.5 }}>Event not found</p>
      </main>
    );
  }

  return <BoothMode event={event} />;
}
