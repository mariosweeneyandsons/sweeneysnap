"use client";

import { useState, useMemo } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

function Panel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#00ff88]/20 rounded-sm bg-[#0d1225]/80 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#00ff88] text-xs font-mono uppercase tracking-[0.2em]">
          // {label}
        </span>
        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#00ff88]/60 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-sm font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88]/50 transition"
    />
  );
}

function TextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-sm font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88]/50 transition resize-none"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-20 bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-sm font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 transition"
      />
      {suffix && (
        <span className="text-[10px] font-mono text-[#00ff88]/40 uppercase">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${
          checked ? "bg-[#00ff88]/30" : "bg-[#060a14]"
        } border ${checked ? "border-[#00ff88]/50" : "border-[#00ff88]/20"}`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full absolute top-[2px] transition-all ${
            checked
              ? "left-[22px] bg-[#00ff88] shadow-[0_0_8px_#00ff88]"
              : "left-[2px] bg-[#555]"
          }`}
        />
      </div>
      {label && (
        <span className="text-xs font-mono text-[#00ff88]/60">{label}</span>
      )}
    </button>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-sm font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 transition appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-sm border border-[#00ff88]/20"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-xs font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 transition"
      />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  );
}

function CopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-xs font-mono text-[#00ff88]/70 focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 transition"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="border border-[#00ff88]/30 rounded-sm px-3 py-2 text-[10px] font-mono uppercase text-[#00ff88] hover:bg-[#00ff88]/10 transition"
        >
          {copied ? "OK" : "CPY"}
        </button>
      </div>
    </Field>
  );
}

function LivePreview({
  gridColumns,
  bgColor,
}: {
  gridColumns: number;
  bgColor: string;
}) {
  const cells = useMemo(() => {
    const colors = [
      "#00ff88",
      "#ffaa00",
      "#ff4466",
      "#00d4ff",
      "#ff0080",
      "#6366f1",
      "#22d3ee",
      "#f97316",
      "#a855f7",
      "#ef4444",
      "#10b981",
      "#eab308",
      "#3b82f6",
      "#ec4899",
      "#14b8a6",
      "#f59e0b",
    ];
    return Array.from({ length: gridColumns * gridColumns }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
    }));
  }, [gridColumns]);

  return (
    <div className="rounded-sm border border-[#00ff88]/20 overflow-hidden">
      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          backgroundColor: bgColor,
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="aspect-square rounded-sm opacity-70"
            style={{ backgroundColor: cell.color }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CommandCenterTheme() {
  const [name, setName] = useState(demoEvent.name);
  const [slug, setSlug] = useState(demoEvent.slug);
  const [description, setDescription] = useState(demoEvent.description);
  const [startDate, setStartDate] = useState(demoEvent.startDate);
  const [endDate, setEndDate] = useState(demoEvent.endDate);
  const [active, setActive] = useState(demoEvent.active);
  const [moderationEnabled, setModerationEnabled] = useState(
    demoEvent.moderationEnabled
  );

  const [welcomeText, setWelcomeText] = useState(demoEvent.welcomeText);
  const [buttonText, setButtonText] = useState(demoEvent.buttonText);
  const [successText, setSuccessText] = useState(demoEvent.successText);
  const [requireName, setRequireName] = useState(demoEvent.requireName);
  const [requireMessage, setRequireMessage] = useState(
    demoEvent.requireMessage
  );
  const [maxFileSize, setMaxFileSize] = useState(demoEvent.maxFileSize);

  const [gridColumns, setGridColumns] = useState(demoEvent.gridColumns);
  const [swapInterval, setSwapInterval] = useState(demoEvent.swapInterval);
  const [transition, setTransition] = useState(demoEvent.transition);
  const [bgColor, setBgColor] = useState(demoEvent.bgColor);
  const [showNames, setShowNames] = useState(demoEvent.showNames);
  const [showMessages, setShowMessages] = useState(demoEvent.showMessages);
  const [frameBorderColor, setFrameBorderColor] = useState(
    demoEvent.frameBorderColor
  );
  const [frameBorderWidth, setFrameBorderWidth] = useState(
    demoEvent.frameBorderWidth
  );
  const [overlayOpacity, setOverlayOpacity] = useState(
    demoEvent.overlayOpacity
  );

  const [logoUrl, setLogoUrl] = useState(demoEvent.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(demoEvent.primaryColor);
  const [fontFamily, setFontFamily] = useState(demoEvent.fontFamily);

  const [cursorVisible, setCursorVisible] = useState(true);
  useState(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  });

  return (
    <div
      className="min-h-screen font-mono text-[#e0e0e0] relative"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.1) 2px, rgba(0,255,136,0.1) 4px)",
        }}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0e1a]/95 border-b border-[#00ff88]/20 px-4 py-2 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dev"
            className="text-[10px] font-mono text-[#00ff88]/50 hover:text-[#00ff88] transition"
          >
            &larr; EXIT
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] text-[#00ff88] uppercase tracking-wider">
              Live
            </span>
          </div>
          <span className="text-[10px] text-[#ffaa00]/70">
            SYS:NOMINAL
          </span>
        </div>
        <span className="text-[10px] text-[#00ff88]/30">
          SWEENEYSNAP COMMAND v1.0
        </span>
      </div>

      <div className="flex">
        {/* Left column — Preview & Stats */}
        <div className="w-[400px] min-h-[calc(100vh-40px)] border-r border-[#00ff88]/20 p-5 flex-shrink-0 sticky top-[40px] self-start overflow-y-auto max-h-[calc(100vh-40px)]">
          <div className="text-xs text-[#00ff88]/40 uppercase tracking-wider mb-3">
            // display preview
          </div>
          <LivePreview gridColumns={gridColumns} bgColor={bgColor} />

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Grid", value: `${gridColumns}×${gridColumns}` },
              { label: "Swap", value: `${swapInterval}s` },
              { label: "FX", value: transition },
              { label: "Overlay", value: `${overlayOpacity}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#060a14] border border-[#00ff88]/10 rounded-sm p-3"
              >
                <div className="text-[9px] text-[#00ff88]/40 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-sm text-[#ffaa00] font-mono">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-xs text-[#00ff88]/40 uppercase tracking-wider mb-3">
              // quick actions
            </div>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full border border-[#00ff88]/30 rounded-sm px-3 py-2 text-xs font-mono text-[#00ff88] hover:bg-[#00ff88]/10 transition text-left"
              >
                &gt; DEPLOY CHANGES
              </button>
              <button
                type="button"
                className="w-full border border-[#ffaa00]/30 rounded-sm px-3 py-2 text-xs font-mono text-[#ffaa00] hover:bg-[#ffaa00]/10 transition text-left"
              >
                &gt; RESET TO DEFAULTS
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs text-[#00ff88]/40 uppercase tracking-wider mb-3">
              // qr beacon
            </div>
            <div className="bg-[#060a14] border border-[#00ff88]/10 rounded-sm p-4 inline-block">
              <QRCodeSVG
                value={demoEvent.uploadUrl}
                size={120}
                bgColor="#060a14"
                fgColor="#00ff88"
              />
            </div>
          </div>
        </div>

        {/* Right column — Control Panels */}
        <div className="flex-1 p-5 overflow-y-auto">
          <h1 className="text-xl text-[#00ff88] mb-1 flex items-center gap-1">
            {name}
            <span
              className={`inline-block w-2 h-5 bg-[#00ff88] ${
                cursorVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          </h1>
          <p className="text-xs text-[#00ff88]/30 mb-6">
            EVENT CONFIGURATION INTERFACE
          </p>

          {/* Event Basics */}
          <Panel label="Event Module">
            <Field label="Event Name">
              <TextInput value={name} onChange={setName} />
            </Field>
            <Row>
              <Field label="Slug">
                <TextInput value={slug} onChange={setSlug} />
              </Field>
              <div />
            </Row>
            <Field label="Description">
              <TextArea value={description} onChange={setDescription} />
            </Field>
            <Row>
              <Field label="Start Date">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-sm font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 transition [color-scheme:dark]"
                />
              </Field>
              <Field label="End Date">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#060a14] border border-[#00ff88]/20 rounded-sm px-3 py-2 text-sm font-mono text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 transition [color-scheme:dark]"
                />
              </Field>
            </Row>
            <Row>
              <Field label="Active">
                <Toggle checked={active} onChange={setActive} />
              </Field>
              <Field label="Moderation">
                <Toggle
                  checked={moderationEnabled}
                  onChange={setModerationEnabled}
                />
              </Field>
            </Row>
          </Panel>

          {/* Upload Config */}
          <Panel label="Upload Module">
            <Field label="Welcome Text">
              <TextArea value={welcomeText} onChange={setWelcomeText} />
            </Field>
            <Row>
              <Field label="Button Text">
                <TextInput value={buttonText} onChange={setButtonText} />
              </Field>
              <Field label="Max File Size">
                <NumberInput
                  value={maxFileSize}
                  onChange={setMaxFileSize}
                  min={1}
                  max={50}
                  suffix="MB"
                />
              </Field>
            </Row>
            <Field label="Success Text">
              <TextArea value={successText} onChange={setSuccessText} />
            </Field>
            <Row>
              <Field label="Require Name">
                <Toggle checked={requireName} onChange={setRequireName} />
              </Field>
              <Field label="Require Message">
                <Toggle
                  checked={requireMessage}
                  onChange={setRequireMessage}
                />
              </Field>
            </Row>
          </Panel>

          {/* Display Config */}
          <Panel label="Display Module">
            <Row>
              <Field label="Grid Columns">
                <NumberInput
                  value={gridColumns}
                  onChange={setGridColumns}
                  min={1}
                  max={8}
                />
              </Field>
              <Field label="Swap Interval">
                <NumberInput
                  value={swapInterval}
                  onChange={setSwapInterval}
                  min={1}
                  max={60}
                  suffix="sec"
                />
              </Field>
            </Row>
            <Row>
              <Field label="Transition">
                <SelectInput
                  value={transition}
                  onChange={setTransition}
                  options={[
                    { value: "fade", label: "Fade" },
                    { value: "slide", label: "Slide" },
                    { value: "zoom", label: "Zoom" },
                    { value: "none", label: "None" },
                  ]}
                />
              </Field>
              <Field label="BG Color">
                <ColorInput value={bgColor} onChange={setBgColor} />
              </Field>
            </Row>
            <Row>
              <Field label="Show Names">
                <Toggle checked={showNames} onChange={setShowNames} />
              </Field>
              <Field label="Show Messages">
                <Toggle checked={showMessages} onChange={setShowMessages} />
              </Field>
            </Row>
            <Row>
              <Field label="Frame Border Color">
                <ColorInput
                  value={frameBorderColor}
                  onChange={setFrameBorderColor}
                />
              </Field>
              <Field label="Frame Border Width">
                <NumberInput
                  value={frameBorderWidth}
                  onChange={setFrameBorderWidth}
                  min={0}
                  max={10}
                  suffix="px"
                />
              </Field>
            </Row>
            <Field label="Overlay Opacity">
              <NumberInput
                value={overlayOpacity}
                onChange={setOverlayOpacity}
                min={0}
                max={100}
                suffix="%"
              />
            </Field>
          </Panel>

          {/* Branding */}
          <Panel label="Branding Module">
            <Field label="Logo URL">
              <TextInput value={logoUrl} onChange={setLogoUrl} />
            </Field>
            <Row>
              <Field label="Primary Color">
                <ColorInput value={primaryColor} onChange={setPrimaryColor} />
              </Field>
              <Field label="Font Family">
                <SelectInput
                  value={fontFamily}
                  onChange={setFontFamily}
                  options={[
                    { value: "Inter", label: "Inter" },
                    { value: "Georgia", label: "Georgia" },
                    { value: "Monaco", label: "Monaco" },
                    { value: "system-ui", label: "System UI" },
                  ]}
                />
              </Field>
            </Row>
          </Panel>

          {/* Quick Links */}
          <Panel label="Links Module">
            <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
            <CopyLink label="Display URL" url={demoEvent.displayUrl} />
            <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
          </Panel>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e1a]/95 border-t border-[#00ff88]/20 px-4 py-1.5 flex items-center justify-between backdrop-blur-sm">
        <span className="text-[9px] font-mono text-[#00ff88]/30">
          LOG: {new Date().toISOString()}
        </span>
        <span className="text-[9px] font-mono text-[#00ff88]/30">
          STATUS: ALL SYSTEMS OPERATIONAL
        </span>
      </div>
    </div>
  );
}
