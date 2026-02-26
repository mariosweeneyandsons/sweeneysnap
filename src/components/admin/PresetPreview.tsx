"use client";

import { getContrastColor, getGoogleFontUrl } from "@/lib/theme";
import { useEffect } from "react";

interface PresetPreviewProps {
  primaryColor: string;
  fontFamily: string;
  backgroundColor: string;
  gridColumns: number;
  showNames: boolean;
  logoUrl?: string;
}

const PLACEHOLDER_NAMES = ["Alex", "Jamie", "Sam", "Taylor", "Morgan", "Jordan"];
const PLACEHOLDER_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444"];

export function PresetPreview({
  primaryColor,
  fontFamily,
  backgroundColor,
  gridColumns,
  showNames,
  logoUrl,
}: PresetPreviewProps) {
  const contrast = getContrastColor(primaryColor);
  const fontUrl = getGoogleFontUrl(fontFamily);

  useEffect(() => {
    if (!fontUrl) return;
    const linkId = "ss-preview-font";
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

  const cells = Array.from({ length: gridColumns * gridColumns }, (_, i) => i);

  return (
    <div>
      <h3 className="font-semibold mb-3">Live Preview</h3>
      <div
        className="rounded-xs overflow-hidden border border-border-separator"
        style={{
          backgroundColor,
          fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
          aspectRatio: "16/9",
        }}
      >
        {/* Mini overlay */}
        <div className="p-2 flex items-center gap-2">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-4 w-auto" />
          )}
          <span
            className="text-[10px] font-semibold truncate"
            style={{ color: primaryColor }}
          >
            Event Name
          </span>
        </div>

        {/* Mini grid */}
        <div
          className="px-2 pb-2 gap-1"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          }}
        >
          {cells.map((i) => (
            <div
              key={i}
              className="aspect-square rounded-sm overflow-hidden relative"
              style={{
                backgroundColor: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length] + "30",
                border: `1px solid rgba(255,255,255,0.1)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]}40, ${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]}20)`,
                }}
              />
              {showNames && (
                <div className="absolute bottom-0 left-0 right-0 p-0.5 bg-gradient-to-t from-black/60 to-transparent">
                  <p
                    className="text-[6px] font-medium truncate"
                    style={{ color: primaryColor }}
                  >
                    {PLACEHOLDER_NAMES[i % PLACEHOLDER_NAMES.length]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
