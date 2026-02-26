"use client";

import { PublicEvent } from "@/types/database";

interface DisplayOverlayProps {
  event: PublicEvent;
}

export function DisplayOverlay({ event }: DisplayOverlayProps) {
  const socialOverlay = event.displayConfig.socialOverlay;
  const logoAsset = (event.assets || []).find((a) => a.type === "logo");
  const logoSrc = event.logoUrl || logoAsset?.url;

  return (
    <div className="display-overlay absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3">
        {logoSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="" className="h-10 w-auto" />
        )}
        <div>
          <h1
            className="font-semibold text-lg"
            style={{ color: `var(--ss-primary, rgba(255,255,255,0.8))` }}
          >
            {event.name}
          </h1>
          {socialOverlay && (
            <p className="text-white/50 text-sm">{socialOverlay}</p>
          )}
        </div>
      </div>
    </div>
  );
}
