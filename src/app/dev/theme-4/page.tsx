"use client";

import { useState } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

const scenes = [
  { number: 1, label: "Setup" },
  { number: 2, label: "Upload" },
  { number: 3, label: "Display" },
  { number: 4, label: "Branding" },
  { number: 5, label: "Links" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs uppercase tracking-[0.1em] text-[#c9a84c] mb-1.5"
        style={{ fontFamily: "Georgia, serif" }}
      >
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
      className="w-full bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition"
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
      className="w-full bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition resize-none"
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
        className="w-24 bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition"
      />
      {suffix && (
        <span className="text-xs text-[#c9a84c]/50">{suffix}</span>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full relative transition-colors ${
        checked ? "bg-[#c9a84c]" : "bg-[#333]"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-[#f5f0e8] absolute top-1 transition-all ${
          checked ? "left-[22px]" : "left-[4px]"
        }`}
      />
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
      className="w-full bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition appearance-none"
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
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded border border-[#c9a84c]/20"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm font-mono text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition"
      />
    </div>
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
          className="flex-1 bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm font-mono text-[#c9a84c]/70 focus:outline-none focus:border-[#c9a84c] transition"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="bg-[#c9a84c] text-[#1a1a1a] px-4 py-2.5 rounded text-xs font-semibold hover:bg-[#d4b45c] transition"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Field>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
  );
}

function FilmStrip({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`fixed top-0 bottom-0 w-8 z-30 ${
        side === "left" ? "left-0" : "right-0"
      } bg-[#111] flex flex-col items-center justify-between py-4`}
    >
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="w-3 h-4 rounded-sm bg-[#1a1a1a] border border-[#333] flex-shrink-0"
        />
      ))}
    </div>
  );
}

export default function FilmSetTheme() {
  const [activeScene, setActiveScene] = useState(0);
  const [direction, setDirection] = useState(1);

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

  const goTo = (index: number) => {
    setDirection(index > activeScene ? 1 : -1);
    setActiveScene(index);
  };

  const sceneContent = [
    // Scene 1: Setup
    <div key="setup" className="space-y-5">
      <Field label="Event Name">
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label="Slug">
        <TextInput value={slug} onChange={setSlug} />
      </Field>
      <Field label="Description">
        <TextArea value={description} onChange={setDescription} />
      </Field>
      <Row>
        <Field label="Start Date">
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition [color-scheme:dark]"
          />
        </Field>
        <Field label="End Date">
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#111] border border-[#c9a84c]/20 rounded px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c] transition [color-scheme:dark]"
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
    </div>,

    // Scene 2: Upload
    <div key="upload" className="space-y-5">
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
          <Toggle checked={requireMessage} onChange={setRequireMessage} />
        </Field>
      </Row>
    </div>,

    // Scene 3: Display
    <div key="display" className="space-y-5">
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
        <Field label="Background Color">
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
    </div>,

    // Scene 4: Branding
    <div key="branding" className="space-y-5">
      <Field label="Logo URL">
        <TextInput value={logoUrl} onChange={setLogoUrl} />
      </Field>
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
    </div>,

    // Scene 5: Links
    <div key="links" className="space-y-5">
      <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
      <CopyLink label="Display URL" url={demoEvent.displayUrl} />
      <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
      <Field label="QR Code">
        <div className="bg-[#111] border border-[#c9a84c]/20 rounded p-5 inline-block">
          <QRCodeSVG
            value={demoEvent.uploadUrl}
            size={140}
            bgColor="#111111"
            fgColor="#c9a84c"
          />
        </div>
      </Field>
    </div>,
  ];

  return (
    <div
      className="min-h-screen text-[#f5f0e8] relative"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Film grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Film strips */}
      <FilmStrip side="left" />
      <FilmStrip side="right" />

      <div className="relative z-10 px-16 py-8">
        <Link
          href="/dev"
          className="text-xs text-[#c9a84c]/40 hover:text-[#c9a84c] transition-colors mb-6 inline-block"
        >
          &larr; Back
        </Link>

        {/* Clapboard header */}
        <div className="mb-10">
          <div
            className="h-10 rounded-t-lg flex items-center px-4 gap-3"
            style={{
              background:
                "repeating-linear-gradient(135deg, #1a1a1a, #1a1a1a 10px, #c9a84c 10px, #c9a84c 20px)",
            }}
          >
            <span className="bg-[#1a1a1a] text-[#c9a84c] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              SweeneySnap
            </span>
          </div>
          <div className="bg-[#222] border border-[#c9a84c]/20 rounded-b-lg px-6 py-5">
            <h1
              className="text-3xl text-[#f5f0e8] mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Event Settings
            </h1>
            <p className="text-sm text-[#c9a84c]/50">
              Scene {activeScene + 1} of {scenes.length} &mdash;{" "}
              {scenes[activeScene].label}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {scenes.map((scene, i) => (
            <div key={scene.number} className="flex items-center">
              <button
                type="button"
                onClick={() => goTo(i)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <motion.div
                  animate={{
                    scale: activeScene === i ? 1.2 : 1,
                    backgroundColor:
                      activeScene === i ? "#c9a84c" : i < activeScene ? "#c9a84c" : "#333",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    color: activeScene === i || i < activeScene ? "#1a1a1a" : "#666",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {scene.number}
                </motion.div>
                <span
                  className={`text-[10px] uppercase tracking-wider transition-colors ${
                    activeScene === i
                      ? "text-[#c9a84c]"
                      : "text-[#666] group-hover:text-[#999]"
                  }`}
                >
                  {scene.label}
                </span>
              </button>
              {i < scenes.length - 1 && (
                <div
                  className={`w-16 h-[2px] mx-2 mt-[-18px] transition-colors ${
                    i < activeScene ? "bg-[#c9a84c]" : "bg-[#333]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Scene content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#222] border border-[#c9a84c]/10 rounded-lg p-8 min-h-[400px] overflow-hidden">
            <h2
              className="text-xl text-[#c9a84c] mb-6 group cursor-default"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <span className="bg-gradient-to-r from-[#c9a84c] to-[#e8c55a] bg-clip-text hover:text-transparent transition-all duration-300">
                {scenes[activeScene].label}
              </span>
            </h2>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeScene}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {sceneContent[activeScene]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => goTo(Math.max(0, activeScene - 1))}
              disabled={activeScene === 0}
              className="px-5 py-2.5 border border-[#c9a84c]/20 rounded text-sm text-[#c9a84c] hover:bg-[#c9a84c]/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: "Georgia, serif" }}
            >
              &larr; Previous
            </button>

            {activeScene === scenes.length - 1 ? (
              <button
                type="button"
                className="px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider bg-[#cc3333] text-white hover:shadow-[0_0_20px_rgba(204,51,51,0.4)] transition-shadow"
              >
                ACTION!
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  goTo(Math.min(scenes.length - 1, activeScene + 1))
                }
                className="px-5 py-2.5 bg-[#c9a84c] text-[#1a1a1a] rounded text-sm font-semibold hover:bg-[#d4b45c] transition"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
