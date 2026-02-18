"use client";

import { useState, useRef } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import Link from "next/link";

const sections = [
  { id: "event", label: "Event" },
  { id: "upload", label: "Upload" },
  { id: "display", label: "Display" },
  { id: "branding", label: "Branding" },
  { id: "links", label: "Links" },
];

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
      className="tracking-[0.05em] transition-colors"
      style={{
        color: checked ? "#c45a5a" : "#666666",
        textDecoration: checked ? "underline" : "none",
        textDecorationColor: "#c45a5a",
        textUnderlineOffset: "4px",
      }}
    >
      {checked ? "Enabled" : "Disabled"}
    </button>
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
    <motion.div
      className="flex items-start gap-4 mb-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <label
        className="w-[180px] flex-shrink-0 text-sm text-[#666666] pt-2 text-right"
        style={{ letterSpacing: "0.05em" }}
      >
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </motion.div>
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
      className="w-full bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors"
      style={{ letterSpacing: "0.05em" }}
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
      className="w-full bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors resize-none"
      style={{ letterSpacing: "0.05em" }}
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
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-20 bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors"
        style={{ letterSpacing: "0.05em" }}
      />
      {suffix && (
        <span className="text-xs text-[#444444]" style={{ letterSpacing: "0.05em" }}>
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
      className="w-full bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors appearance-none"
      style={{ letterSpacing: "0.05em" }}
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
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm font-mono text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors"
        style={{ letterSpacing: "0.05em" }}
      />
    </div>
  );
}

function CopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm font-mono text-[#555555] focus:outline-none focus:border-b-[#c45a5a] transition-colors"
          style={{ letterSpacing: "0.05em" }}
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs text-[#666666] hover:text-[#c45a5a] transition-colors"
          style={{ letterSpacing: "0.05em" }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
    </Field>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center my-16 pl-[196px]">
      <div className="w-3 h-[1px] bg-[#c45a5a]" />
    </div>
  );
}

export default function DarkroomTheme() {
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
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#999999] relative" style={{ letterSpacing: "0.05em" }}>
      {/* Margin line */}
      <div className="fixed top-0 bottom-0 left-[199px] w-[1px] bg-[#222222] z-10 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-8 pt-12 pb-24">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Link
            href="/dev"
            className="text-xs text-[#666666] hover:text-[#c45a5a] transition-colors mb-12 inline-block"
            style={{ letterSpacing: "0.05em" }}
          >
            back
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <h1 className="text-2xl text-[#999999] font-light mb-2" style={{ letterSpacing: "0.1em" }}>
            Event Settings
          </h1>
          <div className="w-3 h-[1px] bg-[#c45a5a]" />
        </motion.div>

        {/* TOC Nav */}
        <motion.nav
          className="flex items-center gap-1 mb-16 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {sections.map((s, i) => (
            <span key={s.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`transition-opacity hover:text-[#c45a5a] ${
                  activeSection === s.id ? "opacity-100 text-[#c45a5a]" : "opacity-50"
                }`}
                style={{ letterSpacing: "0.05em" }}
              >
                {s.label}
              </button>
              {i < sections.length - 1 && (
                <span className="text-[#333333] mx-1">/</span>
              )}
            </span>
          ))}
        </motion.nav>

        {/* Event */}
        <div ref={(el) => { sectionRefs.current.event = el; }}>
          <Field label="Event Name">
            <TextInput value={name} onChange={setName} />
          </Field>
          <Field label="Slug">
            <TextInput value={slug} onChange={setSlug} />
          </Field>
          <Field label="Description">
            <TextArea value={description} onChange={setDescription} />
          </Field>
          <Field label="Start Date">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors [color-scheme:dark]"
              style={{ letterSpacing: "0.05em" }}
            />
          </Field>
          <Field label="End Date">
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#222222] px-0 py-2 text-sm text-[#999999] focus:outline-none focus:border-b-[#c45a5a] transition-colors [color-scheme:dark]"
              style={{ letterSpacing: "0.05em" }}
            />
          </Field>
          <Field label="Active">
            <Toggle checked={active} onChange={setActive} />
          </Field>
          <Field label="Moderation">
            <Toggle checked={moderationEnabled} onChange={setModerationEnabled} />
          </Field>
        </div>

        <SectionDivider />

        {/* Upload */}
        <div ref={(el) => { sectionRefs.current.upload = el; }}>
          <Field label="Welcome Text">
            <TextArea value={welcomeText} onChange={setWelcomeText} />
          </Field>
          <Field label="Button Text">
            <TextInput value={buttonText} onChange={setButtonText} />
          </Field>
          <Field label="Success Text">
            <TextArea value={successText} onChange={setSuccessText} />
          </Field>
          <Field label="Require Name">
            <Toggle checked={requireName} onChange={setRequireName} />
          </Field>
          <Field label="Require Message">
            <Toggle checked={requireMessage} onChange={setRequireMessage} />
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
        </div>

        <SectionDivider />

        {/* Display */}
        <div ref={(el) => { sectionRefs.current.display = el; }}>
          <Field label="Grid Columns">
            <NumberInput value={gridColumns} onChange={setGridColumns} min={1} max={8} />
          </Field>
          <Field label="Swap Interval">
            <NumberInput value={swapInterval} onChange={setSwapInterval} min={1} max={60} suffix="sec" />
          </Field>
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
          <Field label="Background">
            <ColorInput value={bgColor} onChange={setBgColor} />
          </Field>
          <Field label="Show Names">
            <Toggle checked={showNames} onChange={setShowNames} />
          </Field>
          <Field label="Show Messages">
            <Toggle checked={showMessages} onChange={setShowMessages} />
          </Field>
          <Field label="Frame Color">
            <ColorInput value={frameBorderColor} onChange={setFrameBorderColor} />
          </Field>
          <Field label="Frame Width">
            <NumberInput value={frameBorderWidth} onChange={setFrameBorderWidth} min={0} max={10} suffix="px" />
          </Field>
          <Field label="Overlay Opacity">
            <NumberInput value={overlayOpacity} onChange={setOverlayOpacity} min={0} max={100} suffix="%" />
          </Field>
        </div>

        <SectionDivider />

        {/* Branding */}
        <div ref={(el) => { sectionRefs.current.branding = el; }}>
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
        </div>

        <SectionDivider />

        {/* Links */}
        <div ref={(el) => { sectionRefs.current.links = el; }}>
          <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
          <CopyLink label="Display URL" url={demoEvent.displayUrl} />
          <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
          <Field label="QR Code">
            <div className="pt-2">
              <QRCodeSVG
                value={demoEvent.uploadUrl}
                size={120}
                bgColor="#111111"
                fgColor="#c45a5a"
              />
            </div>
          </Field>
        </div>

        {/* Save */}
        <motion.div
          className="flex justify-end mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <button
            type="button"
            className="text-sm text-[#666666] hover:text-[#c45a5a] transition-colors"
            style={{
              letterSpacing: "0.05em",
              textDecoration: "underline",
              textDecorationColor: "#333333",
              textUnderlineOffset: "4px",
            }}
          >
            Save Configuration
          </button>
        </motion.div>
      </div>
    </div>
  );
}
