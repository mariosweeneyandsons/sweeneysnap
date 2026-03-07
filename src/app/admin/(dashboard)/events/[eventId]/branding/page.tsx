"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BrandAssetManager } from "@/components/admin/BrandAssetManager";
import { FontPicker } from "@/components/admin/FontPicker";
import { CustomFontUpload } from "@/components/admin/CustomFontUpload";

export default function EventBrandingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });
  const updateEvent = useMutation(api.events.update);

  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [customCss, setCustomCss] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cssOpen, setCssOpen] = useState(false);
  const [fontUploadOpen, setFontUploadOpen] = useState(false);

  if (event === undefined) return <div className="text-center py-12 text-foreground-faint">Loading...</div>;
  if (!event) return <div className="text-center py-12 text-foreground-faint">Event not found</div>;

  const currentColor = primaryColor ?? event.primaryColor;
  const currentFont = fontFamily ?? event.fontFamily ?? "Inter";
  const currentCss = customCss ?? event.customCss ?? "";
  const eventAssets = event.assets || [];
  const customFonts = eventAssets.filter((a) => a.type === "font");

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEvent({
        id: event._id,
        slug: event.slug,
        name: event.name,
        description: event.description,
        isActive: event.isActive,
        presetId: event.presetId,
        uploadConfig: event.uploadConfig,
        displayConfig: event.displayConfig,
        logoUrl: event.logoUrl,
        primaryColor: currentColor,
        fontFamily: currentFont || undefined,
        customCss: currentCss || undefined,
        moderationEnabled: event.moderationEnabled,
        aiModerationEnabled: event.aiModerationEnabled,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${eventId}`} className="text-foreground-faint hover:text-foreground-emphasis transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Branding: {event.name}</h1>
          <p className="text-foreground-faint text-sm">Colors, fonts, assets, and custom CSS</p>
        </div>
      </div>

      <Card className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-foreground-faint font-mono text-sm">{currentColor}</span>
            </div>
          </div>
          <FontPicker
            value={currentFont}
            onChange={(f) => setFontFamily(f)}
            customFonts={customFonts}
            onUploadCustomFont={() => setFontUploadOpen(true)}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setCssOpen(!cssOpen)}
            className="flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground-emphasis transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${cssOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Custom CSS
          </button>
          {cssOpen && (
            <textarea
              value={currentCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder={`.selfie-frame { border-radius: 50%; }\n.display-overlay { opacity: 0.5; }`}
              className="mt-2 w-full h-40 rounded-lg border border-border bg-input-bg px-3 py-2 text-foreground font-mono text-sm resize-y"
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>Save Branding</Button>
        </div>
      </Card>

      <Card>
        <BrandAssetManager
          target={{ type: "event", id: eventId }}
          assets={eventAssets}
        />
      </Card>

      <CustomFontUpload
        target={{ type: "event", id: eventId }}
        open={fontUploadOpen}
        onClose={() => setFontUploadOpen(false)}
        onUploaded={(name) => setFontFamily(name)}
      />
    </div>
  );
}
