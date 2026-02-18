"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Event, Preset, DisplayConfig } from "@/types/database";

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);

  const [name, setName] = useState(event?.name || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [description, setDescription] = useState(event?.description || "");
  const [presetId, setPresetId] = useState(event?.preset_id || "");
  const [isActive, setIsActive] = useState(event?.is_active ?? true);
  const [moderationEnabled, setModerationEnabled] = useState(event?.moderation_enabled ?? false);
  const [startsAt, setStartsAt] = useState(event?.starts_at?.slice(0, 16) || "");
  const [endsAt, setEndsAt] = useState(event?.ends_at?.slice(0, 16) || "");

  useEffect(() => {
    supabase.from("presets").select("*").order("name").then(({ data }) => {
      setPresets(data || []);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!event) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If a preset is selected and this is a new event, inherit its config
    let displayConfig = event?.display_config || { grid_columns: 3, swap_interval: 6, transition: "fade" };
    let uploadConfig = event?.upload_config || {};
    let primaryColor = event?.primary_color || "#ffffff";
    let logoUrl = event?.logo_url || null;

    if (presetId && !event) {
      const selectedPreset = presets.find((p) => p.id === presetId);
      if (selectedPreset) {
        displayConfig = selectedPreset.display_config;
        uploadConfig = selectedPreset.upload_config;
        primaryColor = selectedPreset.primary_color;
        logoUrl = selectedPreset.logo_url;
      }
    }

    const payload = {
      name,
      slug,
      description: description || null,
      preset_id: presetId || null,
      is_active: isActive,
      moderation_enabled: moderationEnabled,
      display_config: displayConfig,
      upload_config: uploadConfig,
      primary_color: primaryColor,
      logo_url: logoUrl,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    };

    if (event) {
      const { error: updateError } = await supabase
        .from("events")
        .update(payload)
        .eq("id", event.id);
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("events")
        .insert(payload);
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Card className="flex flex-col gap-5">
        <Input label="Event Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Company Party 2026" />
        <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="company-party-2026" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />

        {!event && presets.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Start from Preset</label>
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            >
              <option value="" className="bg-gray-900">No preset (defaults)</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Starts At</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Ends At</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <span className="text-sm text-white/70">Event is active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={moderationEnabled} onChange={(e) => setModerationEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm text-white/70">Enable moderation (selfies need approval)</span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {event ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
