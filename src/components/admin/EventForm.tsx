"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PublicEvent } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import { PresetPreview } from "./PresetPreview";

interface EventFormProps {
  event?: PublicEvent;
}

function getScheduleStatus(startsAt?: number, endsAt?: number): { label: string; color: string } | null {
  if (!startsAt && !endsAt) return null;
  const now = Date.now();
  if (startsAt && now < startsAt) return { label: "Upcoming", color: "bg-info-bg text-info" };
  if (endsAt && now > endsAt) return { label: "Ended", color: "bg-secondary text-foreground-muted" };
  return { label: "Live", color: "bg-success-bg text-success" };
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
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
  const [aiModerationEnabled, setAiModerationEnabled] = useState(event?.aiModerationEnabled ?? false);
  const [startsAt, setStartsAt] = useState(
    event?.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : ""
  );
  const [endsAt, setEndsAt] = useState(
    event?.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : ""
  );

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const scheduleStatus = useMemo(() => {
    const s = startsAt ? new Date(startsAt).getTime() : undefined;
    const e = endsAt ? new Date(endsAt).getTime() : undefined;
    return getScheduleStatus(s, e);
  }, [startsAt, endsAt]);

  const dateError = useMemo(() => {
    if (startsAt && endsAt) {
      const s = new Date(startsAt).getTime();
      const e = new Date(endsAt).getTime();
      if (e <= s) return "End time must be after start time";
    }
    return null;
  }, [startsAt, endsAt]);

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
    if (dateError) {
      setError(dateError);
      return;
    }
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
      aiModerationEnabled: moderationEnabled ? aiModerationEnabled : false,
      displayConfig,
      uploadConfig,
      primaryColor,
      logoUrl,
      startsAt: startsAt ? new Date(startsAt).getTime() : undefined,
      endsAt: endsAt ? new Date(endsAt).getTime() : undefined,
    };

    try {
      if (event) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateEvent({ id: event._id as Id<"events">, ...payload } as any);
        toast("Event saved successfully", "success");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await createEvent(payload as any);
        toast("Event created successfully", "success");
      }
      router.push("/admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast(msg, "error");
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
            <label className="block text-sm font-medium text-foreground-muted mb-1">Start from Preset</label>
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground"
            >
              <option value="" className="bg-surface">No preset (defaults)</option>
              {(presets || []).map((p) => (
                <option key={p._id} value={p._id} className="bg-surface">{p.name}</option>
              ))}
            </select>
            {(() => {
              const selectedPreset = presetId ? (presets || []).find((p) => p._id === presetId) : null;
              if (!selectedPreset) return null;
              return (
                <div className="mt-3">
                  <PresetPreview
                    primaryColor={selectedPreset.primaryColor}
                    fontFamily={selectedPreset.fontFamily}
                    backgroundColor={selectedPreset.displayConfig.backgroundColor || "#000000"}
                    gridColumns={selectedPreset.displayConfig.gridColumns ?? 3}
                    showNames={selectedPreset.displayConfig.showNames ?? true}
                    logoUrl={selectedPreset.logoUrl}
                  />
                </div>
              );
            })()}
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-foreground-muted">Schedule</span>
            <span className="text-xs text-foreground-faint">Times in {timezone}</span>
            {scheduleStatus && (
              <span className={`px-2 py-0.5 rounded-xs text-xs font-medium ${scheduleStatus.color}`}>
                {scheduleStatus.label}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Starts At</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground pr-8"
                />
                {startsAt && (
                  <button
                    type="button"
                    onClick={() => setStartsAt("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-faint hover:text-foreground-muted text-sm"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Ends At</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground pr-8"
                />
                {endsAt && (
                  <button
                    type="button"
                    onClick={() => setEndsAt("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-faint hover:text-foreground-muted text-sm"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          </div>
          {dateError && <p className="text-destructive text-xs mt-1">{dateError}</p>}
          {(startsAt || endsAt) && (
            <p className="text-foreground-faint text-xs mt-2">
              Events with dates are automatically activated/deactivated by the scheduler.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Event is active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={moderationEnabled} onChange={(e) => setModerationEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Enable moderation (selfies need approval)</span>
          </label>
          {moderationEnabled && (
            <label className="flex items-center gap-2 cursor-pointer ml-6">
              <input type="checkbox" checked={aiModerationEnabled} onChange={(e) => setAiModerationEnabled(e.target.checked)} className="rounded" />
              <span className="text-sm text-foreground-muted">Enable AI content moderation</span>
            </label>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={!!dateError}>
            {event ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
