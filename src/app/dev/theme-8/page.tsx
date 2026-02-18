"use client";

import { useState } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import Link from "next/link";

const breadcrumbs = [
  { id: "event", label: "Event" },
  { id: "upload", label: "Upload" },
  { id: "display", label: "Display" },
  { id: "branding", label: "Branding" },
  { id: "links", label: "Links" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label
        className="block text-[11px] text-[#4a7ab5] mb-1"
        style={{ fontVariant: "small-caps", letterSpacing: "0.05em" }}
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
      className="w-full bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-sm text-[#e8f0ff] focus:outline-none focus:border-white transition"
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
      className="w-full bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-sm text-[#e8f0ff] focus:outline-none focus:border-white transition resize-none"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(74,122,181,0.1) 23px, rgba(74,122,181,0.1) 24px)",
        backgroundSize: "100% 24px",
        lineHeight: "24px",
      }}
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
        className="w-20 bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-sm text-[#e8f0ff] focus:outline-none focus:border-white transition"
      />
      {suffix && (
        <span
          className="text-[10px] text-[#4a7ab5]/60"
          style={{ fontVariant: "small-caps" }}
        >
          {suffix}
        </span>
      )}
    </div>
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
      className="w-full bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-sm text-[#e8f0ff] focus:outline-none focus:border-white transition appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CrosshairToggle({
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
      className={`w-6 h-6 rounded-[2px] border flex items-center justify-center text-sm font-mono transition ${
        checked
          ? "border-white bg-white/10 text-white"
          : "border-[#4a7ab5]/50 bg-transparent text-[#4a7ab5]/30"
      }`}
    >
      +
    </button>
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
      <div className="relative">
        <div
          className="w-6 h-6 rounded-[2px] border border-[#4a7ab5]/50"
          style={{ backgroundColor: value }}
        />
        {/* Dimension lines */}
        <div className="absolute -top-1 left-0 right-0 h-[1px] bg-[#4a7ab5]/20" />
        <div className="absolute -left-1 top-0 bottom-0 w-[1px] bg-[#4a7ab5]/20" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-2 py-1 text-xs font-mono text-[#e8f0ff] focus:outline-none focus:border-white transition"
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
          className="flex-1 bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-xs font-mono text-[#4a7ab5] focus:outline-none focus:border-white transition"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-[10px] text-white hover:bg-white/10 transition"
          style={{ fontVariant: "small-caps" }}
        >
          {copied ? "done" : "copy"}
        </button>
      </div>
    </Field>
  );
}

function SectionCard({
  title,
  id,
  children,
  delay = 0,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      id={id}
      className="bg-[#1e2f52] border border-[#4a7ab5]/30 rounded-[2px] p-5 mb-4"
      initial={{ clipPath: "inset(0 100% 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0% 0)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <h3
        className="text-sm text-white mb-4 pb-2 border-b border-[#4a7ab5]/20"
        style={{ fontVariant: "small-caps", letterSpacing: "0.08em" }}
      >
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

export default function BlueprintTheme() {
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

  const [activeSection, setActiveSection] = useState("event");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen text-[#e8f0ff] relative"
      style={{
        backgroundColor: "#1a2744",
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(74,122,181,0.05) 39px, rgba(74,122,181,0.05) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(74,122,181,0.05) 39px, rgba(74,122,181,0.05) 40px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      {/* Title block header */}
      <div className="sticky top-0 z-20 bg-[#1a2744]/95 backdrop-blur-sm border-b-2 border-[#4a7ab5]/30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dev"
              className="text-[10px] text-[#4a7ab5] hover:text-white transition"
              style={{ fontVariant: "small-caps" }}
            >
              &larr; index
            </Link>
            <div className="border border-[#4a7ab5]/30 rounded-[2px] px-4 py-1.5 flex items-center gap-6">
              <div>
                <div className="text-[9px] text-[#4a7ab5]/50" style={{ fontVariant: "small-caps" }}>
                  project
                </div>
                <div className="text-xs text-white" style={{ fontVariant: "small-caps" }}>
                  sweeneysnap
                </div>
              </div>
              <div className="w-[1px] h-6 bg-[#4a7ab5]/20" />
              <div>
                <div className="text-[9px] text-[#4a7ab5]/50" style={{ fontVariant: "small-caps" }}>
                  drawing
                </div>
                <div className="text-xs text-white" style={{ fontVariant: "small-caps" }}>
                  event settings
                </div>
              </div>
              <div className="w-[1px] h-6 bg-[#4a7ab5]/20" />
              <div>
                <div className="text-[9px] text-[#4a7ab5]/50" style={{ fontVariant: "small-caps" }}>
                  rev
                </div>
                <div className="text-xs text-white font-mono">
                  A
                </div>
              </div>
              <div className="w-[1px] h-6 bg-[#4a7ab5]/20" />
              <div>
                <div className="text-[9px] text-[#4a7ab5]/50" style={{ fontVariant: "small-caps" }}>
                  date
                </div>
                <div className="text-xs text-white font-mono">
                  2026-02-18
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb nav */}
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-1 text-xs border-t border-[#4a7ab5]/10">
          <span className="text-[#4a7ab5]/40" style={{ fontVariant: "small-caps" }}>
            spec
          </span>
          {breadcrumbs.map((bc) => (
            <span key={bc.id} className="flex items-center gap-1">
              <span className="text-[#4a7ab5]/30">&gt;</span>
              <button
                type="button"
                onClick={() => scrollTo(bc.id)}
                className={`transition ${
                  activeSection === bc.id
                    ? "text-white underline underline-offset-4"
                    : "text-[#4a7ab5]/60 hover:text-white"
                }`}
                style={{ fontVariant: "small-caps" }}
              >
                {bc.label}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Content — 3-column grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1 */}
          <div>
            <SectionCard title="Event Basics" id="event" delay={0}>
              <Field label="event name">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field label="slug">
                <TextInput value={slug} onChange={setSlug} />
              </Field>
              <Field label="description">
                <TextArea value={description} onChange={setDescription} />
              </Field>
              <Field label="start date">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-sm text-[#e8f0ff] focus:outline-none focus:border-white transition [color-scheme:dark]"
                />
              </Field>
              <Field label="end date">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1a2744] border border-[#4a7ab5]/50 rounded-[2px] px-3 py-2 text-sm text-[#e8f0ff] focus:outline-none focus:border-white transition [color-scheme:dark]"
                />
              </Field>
              <div className="flex gap-6">
                <Field label="active">
                  <CrosshairToggle checked={active} onChange={setActive} />
                </Field>
                <Field label="moderation">
                  <CrosshairToggle checked={moderationEnabled} onChange={setModerationEnabled} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Branding" id="branding" delay={0.1}>
              <Field label="logo url">
                <TextInput value={logoUrl} onChange={setLogoUrl} />
              </Field>
              <Field label="primary color">
                <ColorInput value={primaryColor} onChange={setPrimaryColor} />
              </Field>
              <Field label="font family">
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
            </SectionCard>
          </div>

          {/* Column 2 */}
          <div>
            <SectionCard title="Upload Config" id="upload" delay={0.15}>
              <Field label="welcome text">
                <TextArea value={welcomeText} onChange={setWelcomeText} />
              </Field>
              <Field label="button text">
                <TextInput value={buttonText} onChange={setButtonText} />
              </Field>
              <Field label="success text">
                <TextArea value={successText} onChange={setSuccessText} />
              </Field>
              <div className="flex gap-6">
                <Field label="require name">
                  <CrosshairToggle checked={requireName} onChange={setRequireName} />
                </Field>
                <Field label="require message">
                  <CrosshairToggle checked={requireMessage} onChange={setRequireMessage} />
                </Field>
              </div>
              <Field label="max file size">
                <NumberInput value={maxFileSize} onChange={setMaxFileSize} min={1} max={50} suffix="mb" />
              </Field>
            </SectionCard>
          </div>

          {/* Column 3 */}
          <div>
            <SectionCard title="Display Config" id="display" delay={0.2}>
              <Field label="grid columns">
                <NumberInput value={gridColumns} onChange={setGridColumns} min={1} max={8} />
              </Field>
              <Field label="swap interval">
                <NumberInput value={swapInterval} onChange={setSwapInterval} min={1} max={60} suffix="sec" />
              </Field>
              <Field label="transition">
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
              <Field label="background color">
                <ColorInput value={bgColor} onChange={setBgColor} />
              </Field>
              <div className="flex gap-6">
                <Field label="show names">
                  <CrosshairToggle checked={showNames} onChange={setShowNames} />
                </Field>
                <Field label="show messages">
                  <CrosshairToggle checked={showMessages} onChange={setShowMessages} />
                </Field>
              </div>
              <Field label="frame color">
                <ColorInput value={frameBorderColor} onChange={setFrameBorderColor} />
              </Field>
              <Field label="frame width">
                <NumberInput value={frameBorderWidth} onChange={setFrameBorderWidth} min={0} max={10} suffix="px" />
              </Field>
              <Field label="overlay opacity">
                <NumberInput value={overlayOpacity} onChange={setOverlayOpacity} min={0} max={100} suffix="%" />
              </Field>
            </SectionCard>

            <SectionCard title="Quick Links" id="links" delay={0.25}>
              <CopyLink label="upload url" url={demoEvent.uploadUrl} />
              <CopyLink label="display url" url={demoEvent.displayUrl} />
              <CopyLink label="crew url" url={demoEvent.crewUrl} />
              <Field label="scan reference">
                <div className="bg-[#1a2744] border border-[#4a7ab5]/30 rounded-[2px] p-4 inline-block">
                  <QRCodeSVG
                    value={demoEvent.uploadUrl}
                    size={100}
                    bgColor="#1a2744"
                    fgColor="#e8f0ff"
                  />
                  <div
                    className="text-[9px] text-[#4a7ab5]/50 mt-2 text-center"
                    style={{ fontVariant: "small-caps" }}
                  >
                    scan reference
                  </div>
                </div>
              </Field>
            </SectionCard>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="border-2 border-white/20 rounded-[2px] px-6 py-2.5 text-sm text-white hover:bg-white/10 transition"
            style={{ fontVariant: "small-caps", letterSpacing: "0.05em" }}
          >
            save specification
          </button>
        </div>
      </div>
    </div>
  );
}
