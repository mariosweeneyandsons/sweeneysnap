"use client";

import { LayoutPicker } from "./LayoutPicker";
import { DisplayConfig } from "@/types/database";

interface DisplaySettingsFieldsProps {
  config: DisplayConfigFormState;
  onChange: (field: string, value: unknown) => void;
}

export interface DisplayConfigFormState {
  layoutMode: "grid" | "slideshow" | "mosaic";
  layoutTemplateId: string;
  gridColumns: number;
  swapInterval: number;
  transition: "fade" | "slide" | "zoom";
  backgroundColor: string;
  animatedBackground: "none" | "gradient";
  showNames: boolean;
  showMessages: boolean;
  spotlightEnabled: boolean;
  spotlightInterval: number;
  spotlightDuration: number;
  tickerEnabled: boolean;
  tickerText: string;
  countdownEnabled: boolean;
  socialOverlay: string;
  newSelfieSound: "none" | "chime" | "shutter";
  celebrationEffect: "none" | "confetti" | "ripple" | "glow";
}

export function initDisplayConfigState(config: DisplayConfig): DisplayConfigFormState {
  const gridColumns = config.gridColumns ?? 3;
  return {
    layoutMode: config.layoutMode || "grid",
    layoutTemplateId: config.layoutTemplateId || `grid-${gridColumns}x${gridColumns}`,
    gridColumns,
    swapInterval: config.swapInterval ?? 6,
    transition: config.transition || "fade",
    backgroundColor: config.backgroundColor || "#000000",
    animatedBackground: config.animatedBackground || "none",
    showNames: config.showNames ?? true,
    showMessages: config.showMessages ?? false,
    spotlightEnabled: config.spotlightEnabled ?? false,
    spotlightInterval: config.spotlightInterval ?? 30,
    spotlightDuration: config.spotlightDuration ?? 5,
    tickerEnabled: config.tickerEnabled ?? false,
    tickerText: config.tickerText || "",
    countdownEnabled: config.countdownEnabled ?? false,
    socialOverlay: config.socialOverlay || "",
    newSelfieSound: config.newSelfieSound || "none",
    celebrationEffect: config.celebrationEffect || "none",
  };
}

export function buildDisplayConfig(state: DisplayConfigFormState, base?: DisplayConfig): DisplayConfig {
  return {
    ...base,
    gridColumns: state.gridColumns,
    swapInterval: state.swapInterval,
    backgroundColor: state.backgroundColor,
    showNames: state.showNames,
    showMessages: state.showMessages,
    transition: state.transition,
    layoutMode: state.layoutMode,
    layoutTemplateId: state.layoutTemplateId,
    animatedBackground: state.animatedBackground,
    spotlightEnabled: state.spotlightEnabled,
    spotlightInterval: state.spotlightInterval,
    spotlightDuration: state.spotlightDuration,
    tickerEnabled: state.tickerEnabled,
    tickerText: state.tickerText || undefined,
    countdownEnabled: state.countdownEnabled,
    socialOverlay: state.socialOverlay || undefined,
    newSelfieSound: state.newSelfieSound,
    celebrationEffect: state.celebrationEffect,
  };
}

const selectClass = "w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground";
const inputClass = "w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground";
const labelClass = "block text-sm font-medium text-foreground-muted mb-1";
const sectionClass = "border-t border-border pt-4";

export function DisplaySettingsFields({ config, onChange }: DisplaySettingsFieldsProps) {
  const isSlideshow = config.layoutMode === "slideshow";

  return (
    <div className="flex flex-col gap-5">
      {/* Layout Mode Toggle */}
      <div>
        <label className={labelClass}>Layout Mode</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange("layoutMode", "grid")}
            className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
              !isSlideshow
                ? "bg-primary text-primary-foreground"
                : "bg-input-bg text-foreground-muted border border-border hover:text-foreground"
            }`}
          >
            Grid / Creative
          </button>
          <button
            type="button"
            onClick={() => onChange("layoutMode", "slideshow")}
            className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
              isSlideshow
                ? "bg-primary text-primary-foreground"
                : "bg-input-bg text-foreground-muted border border-border hover:text-foreground"
            }`}
          >
            Slideshow
          </button>
        </div>
      </div>

      {/* Layout Picker (only for non-slideshow) */}
      {!isSlideshow && (
        <div>
          <label className={labelClass}>Layout Template</label>
          <LayoutPicker
            value={config.layoutTemplateId}
            onChange={(id) => onChange("layoutTemplateId", id)}
          />
        </div>
      )}

      {/* Swap Interval & Transition */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Swap Interval (sec)</label>
          <input
            type="number"
            min={2}
            max={30}
            value={config.swapInterval}
            onChange={(e) => onChange("swapInterval", Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Transition</label>
          <select
            value={config.transition}
            onChange={(e) => onChange("transition", e.target.value)}
            className={selectClass}
          >
            <option value="fade" className="bg-surface">Fade</option>
            <option value="slide" className="bg-surface">Slide</option>
            <option value="zoom" className="bg-surface">Zoom</option>
          </select>
        </div>
      </div>

      {/* Background */}
      <div className={sectionClass}>
        <h3 className="text-label-caps mb-3">Background</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onChange("backgroundColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-foreground-muted font-mono text-sm">{config.backgroundColor}</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Animated Background</label>
            <select
              value={config.animatedBackground}
              onChange={(e) => onChange("animatedBackground", e.target.value)}
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
        <h3 className="text-label-caps mb-3">Display Options</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={config.showNames} onChange={(e) => onChange("showNames", e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Show names on display</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={config.showMessages} onChange={(e) => onChange("showMessages", e.target.checked)} className="rounded" />
            <span className="text-sm text-foreground-muted">Show messages on display</span>
          </label>
        </div>
      </div>

      {/* Spotlight */}
      <div className={sectionClass}>
        <h3 className="text-label-caps mb-3">Spotlight</h3>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={config.spotlightEnabled} onChange={(e) => onChange("spotlightEnabled", e.target.checked)} className="rounded" />
          <span className="text-sm text-foreground-muted">Enable spotlight mode</span>
        </label>
        {config.spotlightEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Interval (sec)</label>
              <input type="number" min={10} max={120} value={config.spotlightInterval} onChange={(e) => onChange("spotlightInterval", Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duration (sec)</label>
              <input type="number" min={3} max={15} value={config.spotlightDuration} onChange={(e) => onChange("spotlightDuration", Number(e.target.value))} className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {/* Ticker */}
      <div className={sectionClass}>
        <h3 className="text-label-caps mb-3">Ticker Bar</h3>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={config.tickerEnabled} onChange={(e) => onChange("tickerEnabled", e.target.checked)} className="rounded" />
          <span className="text-sm text-foreground-muted">Enable scrolling ticker</span>
        </label>
        {config.tickerEnabled && (
          <div>
            <label className={labelClass}>Ticker Text</label>
            <input type="text" value={config.tickerText} onChange={(e) => onChange("tickerText", e.target.value)} placeholder="Welcome to our event! Share your selfies..." className={inputClass} />
          </div>
        )}
      </div>

      {/* Countdown */}
      <div className={sectionClass}>
        <h3 className="text-label-caps mb-3">Countdown</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={config.countdownEnabled} onChange={(e) => onChange("countdownEnabled", e.target.checked)} className="rounded" />
          <span className="text-sm text-foreground-muted">Show countdown timer (uses event start/end dates)</span>
        </label>
      </div>

      {/* Social Overlay */}
      <div className={sectionClass}>
        <h3 className="text-label-caps mb-3">Social Overlay</h3>
        <div>
          <label className={labelClass}>Hashtag / Handle</label>
          <input type="text" value={config.socialOverlay} onChange={(e) => onChange("socialOverlay", e.target.value)} placeholder="#EventHashtag @handle" className={inputClass} />
        </div>
      </div>

      {/* Sound & Effects */}
      <div className={sectionClass}>
        <h3 className="text-label-caps mb-3">Sound & Effects</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>New Selfie Sound</label>
            <select value={config.newSelfieSound} onChange={(e) => onChange("newSelfieSound", e.target.value)} className={selectClass}>
              <option value="none" className="bg-surface">None</option>
              <option value="chime" className="bg-surface">Chime</option>
              <option value="shutter" className="bg-surface">Shutter</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Celebration Effect</label>
            <select value={config.celebrationEffect} onChange={(e) => onChange("celebrationEffect", e.target.value)} className={selectClass}>
              <option value="none" className="bg-surface">None</option>
              <option value="confetti" className="bg-surface">Confetti</option>
              <option value="ripple" className="bg-surface">Ripple</option>
              <option value="glow" className="bg-surface">Glow</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
