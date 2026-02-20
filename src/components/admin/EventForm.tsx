"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Event } from "@/types/database";

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const presets = useQuery(api.presets.listByName);
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(event?.name || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [description, setDescription] = useState(event?.description || "");
  const [presetId, setPresetId] = useState(event?.presetId || "");
  const [isActive, setIsActive] = useState(event?.isActive ?? true);
  const [moderationEnabled, setModerationEnabled] = useState(event?.moderationEnabled ?? false);
  const [startsAt, setStartsAt] = useState(
    event?.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : ""
  );
  const [endsAt, setEndsAt] = useState(
    event?.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : ""
  );

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

    let displayConfig = event?.displayConfig || { gridColumns: 3, swapInterval: 6, transition: "fade" as const };
    let uploadConfig = event?.uploadConfig || {};
    let primaryColor = event?.primaryColor || "#ffffff";
    let logoUrl = event?.logoUrl;

    if (presetId && !event) {
      const selectedPreset = (presets || []).find((p) => p._id === presetId);
      if (selectedPreset) {
        displayConfig = selectedPreset.displayConfig;
        uploadConfig = selectedPreset.uploadConfig;
        primaryColor = selectedPreset.primaryColor;
        logoUrl = selectedPreset.logoUrl;
      }
    }

    const payload = {
      name,
      slug,
      description: description || undefined,
      presetId: presetId ? (presetId as Id<"presets">) : undefined,
      isActive,
      moderationEnabled,
      displayConfig,
      uploadConfig,
      primaryColor,
      logoUrl,
      startsAt: startsAt ? new Date(startsAt).getTime() : undefined,
      endsAt: endsAt ? new Date(endsAt).getTime() : undefined,
    };

    try {
      if (event) {
        await updateEvent({ id: event._id as Id<"events">, ...payload });
      } else {
        await createEvent(payload);
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Card className="flex flex-col gap-5">
        <Input label="Event Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Company Party 2026" />
        <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="company-party-2026" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />

        {!event && (presets || []).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Start from Preset</label>
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            >
              <option value="" className="bg-gray-900">No preset (defaults)</option>
              {(presets || []).map((p) => (
                <option key={p._id} value={p._id} className="bg-gray-900">{p.name}</option>
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
