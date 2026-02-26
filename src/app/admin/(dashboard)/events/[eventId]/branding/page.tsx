"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BrandAssetManager } from "@/components/admin/BrandAssetManager";

export default function EventBrandingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const event = useQuery(api.events.getById, { id: eventId as Id<"events"> });
  const updateEvent = useMutation(api.events.update);

  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [customCss, setCustomCss] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cssOpen, setCssOpen] = useState(false);

  if (event === undefined) return <div className="text-center py-12 text-white/50">Loading...</div>;
  if (!event) return <div className="text-center py-12 text-white/50">Event not found</div>;

  const currentColor = primaryColor ?? event.primaryColor;
  const currentFont = fontFamily ?? event.fontFamily ?? "";
  const currentCss = customCss ?? event.customCss ?? "";

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
        <Link href={`/admin/events/${eventId}`} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Branding: {event.name}</h1>
          <p className="text-white/50 text-sm">Colors, fonts, assets, and custom CSS</p>
        </div>
      </div>

      <Card className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-white/50 font-mono text-sm">{currentColor}</span>
            </div>
          </div>
          <Input
            label="Font Family"
            value={currentFont}
            onChange={(e) => setFontFamily(e.target.value)}
            placeholder="e.g. Inter, Roboto, Playfair Display"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setCssOpen(!cssOpen)}
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
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
              className="mt-2 w-full h-40 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white font-mono text-sm resize-y"
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
          assets={event.assets || []}
        />
      </Card>
    </div>
  );
}
