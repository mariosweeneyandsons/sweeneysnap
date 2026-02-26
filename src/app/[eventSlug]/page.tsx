"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UploadForm } from "@/components/upload/UploadForm";
import { EventThemeProvider } from "@/components/EventThemeProvider";
import { deriveBackground, deriveTextColor } from "@/lib/color-utils";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { OfflineQueueIndicator } from "@/components/upload/OfflineQueueIndicator";

export default function UploadPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const event = useQuery(api.events.getBySlug, { slug: eventSlug });
  useServiceWorker();
  const { isOnline, queueCount, flushing } = useOfflineQueue();

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

  const bgColor = deriveBackground(event.primaryColor);
  const textColor = deriveTextColor(event.primaryColor);

  return (
    <EventThemeProvider event={event}>
      <OfflineQueueIndicator isOnline={isOnline} queueCount={queueCount} flushing={flushing} />
      <main
        className="min-h-dvh flex flex-col"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: event.fontFamily ? `"${event.fontFamily}", sans-serif` : undefined,
          // @ts-expect-error -- CSS custom property
          "--event-primary": event.primaryColor,
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {event.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.logoUrl} alt="" className="h-16 md:h-20 w-auto mb-6" />
          )}
          <h1 className="text-2xl font-bold mb-2 text-center">{event.name}</h1>
          <p className="mb-8 text-center" style={{ opacity: 0.6 }}>
            {event.uploadConfig.welcomeText || "Take a selfie and see it on the big screen!"}
          </p>
          <div className="w-full max-w-sm md:max-w-md mx-auto">
            <UploadForm event={event} />
          </div>
        </div>
      </main>
    </EventThemeProvider>
  );
}
