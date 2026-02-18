"use client";

import { useRealtimeSelfies } from "@/hooks/useRealtimeSelfies";
import { SelfieGrid } from "./SelfieGrid";
import { EmptyState } from "./EmptyState";
import { DisplayOverlay } from "./DisplayOverlay";
import { Event, Selfie, DisplayConfig } from "@/types/database";
import { useEffect } from "react";

interface DisplayWallProps {
  event: Event;
  initialSelfies: Selfie[];
}

export function DisplayWall({ event, initialSelfies }: DisplayWallProps) {
  const config = event.display_config as DisplayConfig;
  const selfies = useRealtimeSelfies(event.id, initialSelfies);

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

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: config.background_color || "#000000" }}
    >
      <DisplayOverlay event={event} />
      {selfies.length === 0 ? (
        <EmptyState event={event} />
      ) : (
        <SelfieGrid selfies={selfies} config={config} />
      )}
    </div>
  );
}
