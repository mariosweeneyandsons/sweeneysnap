"use client";

import { SelfieGrid } from "./SelfieGrid";
import { SlideshowView } from "./SlideshowView";
import { MosaicView } from "./MosaicView";
import { EmptyState } from "./EmptyState";
import { DisplayOverlay } from "./DisplayOverlay";
import { AnimatedBackground } from "./AnimatedBackground";
import { TickerBar } from "./TickerBar";
import { EventCountdownOverlay } from "./EventCountdownOverlay";
import { QRCodeSVG } from "qrcode.react";
import { PublicEvent, SelfieWithUrls } from "@/types/database";
import { useEffect } from "react";

interface DisplayWallProps {
  event: PublicEvent;
  selfies: SelfieWithUrls[];
  backgroundImageUrl?: string | null;
  backgroundVideoUrl?: string | null;
}

export function DisplayWall({ event, selfies, backgroundImageUrl, backgroundVideoUrl }: DisplayWallProps) {
  const config = event.displayConfig;
  const layoutMode = config.layoutMode || "grid";

  // Auto-hide cursor after 3s of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const hide = () => {
      document.body.style.cursor = "none";
    };
    const show = () => {
      document.body.style.cursor = "default";
      clearTimeout(timeout);
      timeout = setTimeout(hide, 3000);
    };
    document.addEventListener("mousemove", show);
    timeout = setTimeout(hide, 3000);
    return () => {
      document.removeEventListener("mousemove", show);
      clearTimeout(timeout);
      document.body.style.cursor = "default";
    };
  }, []);

  const renderLayout = () => {
    if (selfies.length === 0) {
      return <EmptyState event={event} />;
    }
    switch (layoutMode) {
      case "slideshow":
        return <SlideshowView selfies={selfies} config={config} />;
      case "mosaic":
        return <MosaicView selfies={selfies} config={config} />;
      default:
        return <SelfieGrid selfies={selfies} config={config} />;
    }
  };

  // Find background asset from brand assets
  const bgAsset = (event.assets || []).find((a) => a.type === "background");

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundColor: config.backgroundColor || "#000000",
        fontFamily: event.fontFamily ? `"${event.fontFamily}", sans-serif` : undefined,
        "--primary-color": event.primaryColor,
      } as React.CSSProperties}
    >
      {/* Background layers */}
      {config.animatedBackground === "gradient" && (
        <AnimatedBackground primaryColor={event.primaryColor} />
      )}
      {backgroundVideoUrl && (
        <video
          src={backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {backgroundImageUrl && !backgroundVideoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {bgAsset && !backgroundImageUrl && !backgroundVideoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgAsset.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Content */}
      <div className="relative z-[1] w-full h-full">
        <DisplayOverlay event={event} />
        {config.countdownEnabled && (
          <EventCountdownOverlay startsAt={event.startsAt} endsAt={event.endsAt} />
        )}
        {renderLayout()}
        {selfies.length > 0 && (
          <div className="absolute bottom-4 right-4 opacity-70 bg-white rounded-lg p-1.5">
            <QRCodeSVG
              value={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/${event.slug}`}
              size={96}
            />
          </div>
        )}
      </div>

      {/* Ticker bar */}
      {config.tickerEnabled && config.tickerText && (
        <TickerBar text={config.tickerText} />
      )}
    </div>
  );
}
