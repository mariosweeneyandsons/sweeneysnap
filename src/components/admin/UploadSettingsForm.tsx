"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Event, UploadConfig } from "@/types/database";

interface UploadSettingsFormProps {
  event: Event;
  crewToken?: string;
}

const inputClass = "w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground";
const labelClass = "block text-sm font-medium text-foreground-muted mb-1";
const sectionClass = "border-t border-border pt-4";

export function UploadSettingsForm({ event, crewToken }: UploadSettingsFormProps) {
  const config = event.uploadConfig;
  const updateUploadConfig = useMutation(api.events.updateUploadConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Copy & Messaging
  const [welcomeText, setWelcomeText] = useState(config.welcomeText || "");
  const [buttonText, setButtonText] = useState(config.buttonText || "");
  const [successText, setSuccessText] = useState(config.successText || "");

  // Upload Rules
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(config.maxFileSizeMb ?? 0.2);
  const [allowGallery, setAllowGallery] = useState(config.allowGallery !== false);
  const [requireName, setRequireName] = useState(config.requireName !== false);
  const [requireMessage, setRequireMessage] = useState(config.requireMessage ?? false);

  // Session Limits
  const [maxUploadsPerSession, setMaxUploadsPerSession] = useState(config.maxUploadsPerSession ?? 10);
  const [multiPhotoEnabled, setMultiPhotoEnabled] = useState(config.multiPhotoEnabled !== false);

  // Camera Features
  const [countdownSeconds, setCountdownSeconds] = useState(config.countdownSeconds ?? 3);
  const [flashEnabled, setFlashEnabled] = useState(config.flashEnabled !== false);
  const [allowCameraSwitch, setAllowCameraSwitch] = useState(config.allowCameraSwitch !== false);

  // Photo Editor
  const [filtersEnabled, setFiltersEnabled] = useState(config.filtersEnabled !== false);
  const [framesEnabled, setFramesEnabled] = useState(config.framesEnabled !== false);
  const [stickersEnabled, setStickersEnabled] = useState(config.stickersEnabled !== false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const newConfig: UploadConfig = {
        welcomeText: welcomeText || undefined,
        buttonText: buttonText || undefined,
        successText: successText || undefined,
        maxFileSizeMb,
        allowGallery,
        requireName,
        requireMessage,
        maxUploadsPerSession,
        multiPhotoEnabled,
        countdownSeconds,
        flashEnabled,
        allowCameraSwitch,
        filtersEnabled,
        framesEnabled,
        stickersEnabled,
      };
      await updateUploadConfig({
        id: event._id as Id<"events">,
        uploadConfig: newConfig,
        crewToken,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Upload Configuration</h2>

      <div className="space-y-6">
        {/* Copy & Messaging */}
        <section>
          <h3 className="text-label-caps mb-3">
            Copy & Messaging
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Welcome Text</label>
              <input
                className={inputClass}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                placeholder="Take a selfie and see it on the big screen!"
              />
            </div>
            <div>
              <label className={labelClass}>Button Text</label>
              <input
                className={inputClass}
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Upload Selfie"
              />
            </div>
            <div>
              <label className={labelClass}>Success Text</label>
              <input
                className={inputClass}
                value={successText}
                onChange={(e) => setSuccessText(e.target.value)}
                placeholder="Your selfie is on the wall!"
              />
            </div>
          </div>
        </section>

        {/* Upload Rules */}
        <section className={sectionClass}>
          <h3 className="text-label-caps mb-3">
            Upload Rules
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Max File Size (MB)</label>
              <input
                type="number"
                className={inputClass}
                value={maxFileSizeMb}
                onChange={(e) => setMaxFileSizeMb(Math.max(0.1, Math.min(10, Number(e.target.value))))}
                min={0.1}
                max={10}
                step={0.1}
              />
            </div>
            <Toggle label="Allow Gallery Upload" value={allowGallery} onChange={setAllowGallery} />
            <Toggle label="Require Name" value={requireName} onChange={setRequireName} />
            <Toggle label="Require Message" value={requireMessage} onChange={setRequireMessage} />
          </div>
        </section>

        {/* Session Limits */}
        <section className={sectionClass}>
          <h3 className="text-label-caps mb-3">
            Session Limits
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Max Uploads Per Session</label>
              <input
                type="number"
                className={inputClass}
                value={maxUploadsPerSession}
                onChange={(e) => setMaxUploadsPerSession(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
              />
            </div>
            <Toggle label="Multi-Photo Mode" value={multiPhotoEnabled} onChange={setMultiPhotoEnabled} />
          </div>
        </section>

        {/* Camera Features */}
        <section className={sectionClass}>
          <h3 className="text-label-caps mb-3">
            Camera Features
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Countdown Seconds (0 = disabled)</label>
              <input
                type="number"
                className={inputClass}
                value={countdownSeconds}
                onChange={(e) => setCountdownSeconds(Math.max(0, Math.min(10, Number(e.target.value))))}
                min={0}
                max={10}
              />
            </div>
            <Toggle label="Flash Effect" value={flashEnabled} onChange={setFlashEnabled} />
            <Toggle label="Allow Camera Switch" value={allowCameraSwitch} onChange={setAllowCameraSwitch} />
          </div>
        </section>

        {/* Photo Editor */}
        <section className={sectionClass}>
          <h3 className="text-label-caps mb-3">
            Photo Editor
          </h3>
          <div className="space-y-4">
            <Toggle label="Filters" value={filtersEnabled} onChange={setFiltersEnabled} />
            <Toggle label="Frames" value={framesEnabled} onChange={setFramesEnabled} />
            <Toggle label="Stickers" value={stickersEnabled} onChange={setStickersEnabled} />
          </div>
        </section>

        {error && <p className="text-destructive text-sm">{error}</p>}
        {saved && <p className="text-success text-sm">Settings saved!</p>}

        <Button onClick={handleSave} loading={loading} disabled={loading}>
          Save Upload Settings
        </Button>
      </div>
    </Card>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-foreground-muted">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-xs transition-colors ${
          value ? "bg-primary" : "bg-secondary-hover"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-xs bg-foreground transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
