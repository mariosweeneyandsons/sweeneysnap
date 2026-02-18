"use client";

import { Event } from "@/types/database";

interface DisplayOverlayProps {
  event: Event;
}

export function DisplayOverlay({ event }: DisplayOverlayProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3">
        {event.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.logo_url} alt="" className="h-10 w-auto" />
        )}
        <h1 className="text-white/80 font-semibold text-lg">{event.name}</h1>
      </div>
    </div>
  );
}
