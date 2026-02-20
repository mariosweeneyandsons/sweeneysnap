"use client";

import { SelfieGrid } from "./SelfieGrid";
import { EmptyState } from "./EmptyState";
import { DisplayOverlay } from "./DisplayOverlay";
import { Event, Selfie } from "@/types/database";
import { useEffect } from "react";

interface DisplayWallProps {
  event: Event;
  selfies: Selfie[];
}

export function DisplayWall({ event, selfies }: DisplayWallProps) {
  const config = event.displayConfig;

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
      style={{ backgroundColor: config.backgroundColor || "#000000" }}
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
