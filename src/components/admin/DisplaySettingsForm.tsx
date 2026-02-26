"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Event, DisplayConfig } from "@/types/database";
import { useToast } from "@/components/ui/Toast";

interface DisplaySettingsFormProps {
  event: Event;
  backHref: string;
  onConfigChange?: (config: DisplayConfig) => void;
  crewToken?: string;
}

const selectClass = "w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-foreground";
const inputClass = "w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-foreground";
const labelClass = "block text-sm font-medium text-foreground-muted mb-1";
const sectionClass = "border-t border-border pt-4";

export function DisplaySettingsForm({ event, backHref, onConfigChange, crewToken }: DisplaySettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const config = event.displayConfig;
  const updateDisplayConfig = useMutation(api.events.updateDisplayConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing settings
  const [gridColumns, setGridColumns] = useState(config.gridColumns ?? 3);
  const [swapInterval, setSwapInterval] = useState(config.swapInterval ?? 6);
  const [backgroundColor, setBackgroundColor] = useState(config.backgroundColor || "#000000");
  const [showNames, setShowNames] = useState(config.showNames ?? true);
  const [showMessages, setShowMessages] = useState(config.showMessages ?? false);
  const [transition, setTransition] = useState<"fade" | "slide" | "zoom">(config.transition || "fade");

  // New settings
  const [layoutMode, setLayoutMode] = useState<"grid" | "slideshow" | "mosaic">(config.layoutMode || "grid");
  const [animatedBackground, setAnimatedBackground] = useState<"none" | "gradient">(config.animatedBackground || "none");
  const [spotlightEnabled, setSpotlightEnabled] = useState(config.spotlightEnabled ?? false);
  const [spotlightInterval, setSpotlightInterval] = useState(config.spotlightInterval ?? 30);
  const [spotlightDuration, setSpotlightDuration] = useState(config.spotlightDuration ?? 5);
  const [tickerEnabled, setTickerEnabled] = useState(config.tickerEnabled ?? false);
  const [tickerText, setTickerText] = useState(config.tickerText || "");
  const [countdownEnabled, setCountdownEnabled] = useState(config.countdownEnabled ?? false);
  const [socialOverlay, setSocialOverlay] = useState(config.socialOverlay || "");
  const [newSelfieSound, setNewSelfieSound] = useState<"none" | "chime" | "shutter">(config.newSelfieSound || "none");
  const [celebrationEffect, setCelebrationEffect] = useState<"none" | "confetti" | "ripple" | "glow">(config.celebrationEffect || "none");

  const buildConfig = useCallback((): DisplayConfig => ({
    ...config,
    gridColumns,
    swapInterval,
    backgroundColor,
    showNames,
    showMessages,
    transition,
    layoutMode,
    animatedBackground,
    spotlightEnabled,
    spotlightInterval,
    spotlightDuration,
    tickerEnabled,
    tickerText: tickerText || undefined,
    countdownEnabled,
    socialOverlay: socialOverlay || undefined,
    newSelfieSound,
    celebrationEffect,
  }), [config, gridColumns, swapInterval, backgroundColor, showNames, showMessages, transition, layoutMode, animatedBackground, spotlightEnabled, spotlightInterval, spotlightDuration, tickerEnabled, tickerText, countdownEnabled, socialOverlay, newSelfieSound, celebrationEffect]);

  useEffect(() => {
    onConfigChange?.(buildConfig());
  }, [buildConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const displayConfig = buildConfig();

    try {
      // Cast needed: config spreads storage IDs as string, but mutation expects Id<"_storage">
      await updateDisplayConfig({
        id: event._id as Id<"events">,
        displayConfig: displayConfig as typeof displayConfig & {
          backgroundImageId?: Id<"_storage">;
          backgroundVideoId?: Id<"_storage">;
        },
        crewToken,
      });
      toast("Display settings saved", "success");
      router.push(backHref);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="flex flex-col gap-5">
        {/* Layout Mode */}
        <div>
          <label className={labelClass}>Layout Mode</label>
          <select
            value={layoutMode}
            onChange={(e) => setLayoutMode(e.target.value as "grid" | "slideshow" | "mosaic")}
            className={selectClass}
          >
            <option value="grid" className="bg-surface">Grid</option>
            <option value="slideshow" className="bg-surface">Slideshow</option>
            <option value="mosaic" className="bg-surface">Mosaic</option>
          </select>
        </div>

        {/* Grid & Timing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Grid Size</label>
            <select
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
              className={selectClass}
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="bg-surface">{n}x{n} ({n * n} frames)</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Swap Interval (sec)</label>
            <input
              type="number"
              min={2}
              max={30}
              value={swapInterval}
              onChange={(e) => setSwapInterval(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        {/* Transition */}
        <div>
          <label className={labelClass}>Transition</label>
          <select
            value={transition}
            onChange={(e) => setTransition(e.target.value as "fade" | "slide" | "zoom")}
            className={selectClass}
          >
            <option value="fade" className="bg-surface">Fade</option>
            <option value="slide" className="bg-surface">Slide</option>
            <option value="zoom" className="bg-surface">Zoom</option>
          </select>
        </div>

        {/* Background */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Background</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-foreground-muted font-mono text-sm">{backgroundColor}</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Animated Background</label>
              <select
                value={animatedBackground}
                onChange={(e) => setAnimatedBackground(e.target.value as "none" | "gradient")}
                className={selectClass}
              >
                <option value="none" className="bg-surface">None</option>
                <option value="gradient" className="bg-surface">Animated Gradient</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Display Options</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} className="rounded" />
              <span className="text-sm text-foreground-muted">Show names on display</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showMessages} onChange={(e) => setShowMessages(e.target.checked)} className="rounded" />
              <span className="text-sm text-foreground-muted">Show messages on display</span>
            </label>
          </div>
        </div>

        {/* Spotlight */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Spotlight</h3>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input type="checkbox" checked={spotlightEnabled} onChange={(e) => setSpotlightEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Enable spotlight mode</span>
          </label>
          {spotlightEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Interval (sec)</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={spotlightInterval}
                  onChange={(e) => setSpotlightInterval(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Duration (sec)</label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={spotlightDuration}
                  onChange={(e) => setSpotlightDuration(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        {/* Ticker */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Ticker Bar</h3>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input type="checkbox" checked={tickerEnabled} onChange={(e) => setTickerEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Enable scrolling ticker</span>
          </label>
          {tickerEnabled && (
            <div>
              <label className={labelClass}>Ticker Text</label>
              <input
                type="text"
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="Welcome to our event! Share your selfies..."
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Countdown</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={countdownEnabled} onChange={(e) => setCountdownEnabled(e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Show countdown timer (uses event start/end dates)</span>
          </label>
        </div>

        {/* Social Overlay */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Social Overlay</h3>
          <div>
            <label className={labelClass}>Hashtag / Handle</label>
            <input
              type="text"
              value={socialOverlay}
              onChange={(e) => setSocialOverlay(e.target.value)}
              placeholder="#EventHashtag @handle"
              className={inputClass}
            />
          </div>
        </div>

        {/* Sound & Effects */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Sound & Effects</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>New Selfie Sound</label>
              <select
                value={newSelfieSound}
                onChange={(e) => setNewSelfieSound(e.target.value as "none" | "chime" | "shutter")}
                className={selectClass}
              >
                <option value="none" className="bg-surface">None</option>
                <option value="chime" className="bg-surface">Chime</option>
                <option value="shutter" className="bg-surface">Shutter</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Celebration Effect</label>
              <select
                value={celebrationEffect}
                onChange={(e) => setCelebrationEffect(e.target.value as "none" | "confetti" | "ripple" | "glow")}
                className={selectClass}
              >
                <option value="none" className="bg-surface">None</option>
                <option value="confetti" className="bg-surface">Confetti</option>
                <option value="ripple" className="bg-surface">Ripple</option>
                <option value="glow" className="bg-surface">Glow</option>
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push(backHref)}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Display Settings</Button>
        </div>
      </Card>
    </form>
  );
}
