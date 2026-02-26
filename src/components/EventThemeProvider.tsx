"use client";

import { useEffect } from "react";
import { Event } from "@/types/database";
import { getEventThemeVars, getGoogleFontUrl, sanitizeCss } from "@/lib/theme";

interface EventThemeProviderProps {
  event: Event;
  children: React.ReactNode;
}

export function EventThemeProvider({ event, children }: EventThemeProviderProps) {
  const themeVars = getEventThemeVars(event);
  const fontUrl = getGoogleFontUrl(event.fontFamily || "");
  const cleanCss = sanitizeCss(event.customCss || "");

  // Dynamically load Google Font
  useEffect(() => {
    if (!fontUrl) return;
    const linkId = "ss-google-font";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (link) {
      link.href = fontUrl;
    } else {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }, [fontUrl]);

  return (
    <div style={themeVars as React.CSSProperties}>
      {cleanCss && (
        <style dangerouslySetInnerHTML={{ __html: cleanCss }} />
      )}
      {children}
    </div>
  );
}
