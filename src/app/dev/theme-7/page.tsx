"use client";

import { useState, useEffect, useRef } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import Link from "next/link";

const fnKeys = [
  { key: "F1", label: "Event", id: "event" },
  { key: "F2", label: "Upload", id: "upload" },
  { key: "F3", label: "Display", id: "display" },
  { key: "F4", label: "Brand", id: "branding" },
  { key: "F5", label: "Links", id: "links" },
];

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="inline-block w-2 h-4 bg-[#ffb000] ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

function WindowCard({
  title,
  children,
  id,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  id: string;
  delay?: number;
}) {
  return (
    <div id={id} className="mb-4">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#332800] border border-[#ffb000]/20 border-b-0 rounded-t-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        <span className="text-[10px] tracking-tighter uppercase text-[#ffb000]/60 ml-2 font-mono">
          <TypewriterText text={title} delay={delay} />
        </span>
      </div>
      {/* Content */}
      <div className="bg-[#221a00] border border-[#ffb000]/20 border-t-0 p-3 space-y-2">
        {children}
      </div>
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
      <label className="block text-[10px] tracking-tighter uppercase text-[#664400] mb-0.5 font-mono">
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
      className="w-full bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-sm font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] focus:border-[#ffb000]/40 transition tracking-tight"
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
      className="w-full bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-sm font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] focus:border-[#ffb000]/40 transition tracking-tight resize-none"
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
        className="w-20 bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-sm font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] transition tracking-tight"
      />
      {suffix && (
        <span className="text-[10px] font-mono text-[#664400] uppercase tracking-tighter">
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
      className="w-full bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-sm font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] transition tracking-tight appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function BinaryToggle({
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
      className={`font-mono text-sm border px-3 py-1 transition tracking-tight ${
        checked
          ? "text-[#ffb000] border-[#ffb000]/40 bg-[#ffb000]/10"
          : "text-[#664400] border-[#664400]/40 bg-transparent"
      }`}
      style={{ borderRadius: "8px 0 8px 0" }}
    >
      [{checked ? "1" : "0"}]
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
      <div
        className="w-4 h-4 flex-shrink-0 border border-[#ffb000]/20"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-2 py-1 text-xs font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] transition tracking-tight"
      />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3">{children}</div>
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
          className="flex-1 bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-xs font-mono text-[#ffb000]/60 focus:outline-none transition tracking-tight"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="border border-[#ffb000]/30 px-3 py-1.5 text-[10px] font-mono uppercase text-[#ffb000] hover:bg-[#ffb000]/10 transition tracking-tighter"
          style={{ borderRadius: "8px 0 8px 0" }}
        >
          {copied ? "OK" : "CPY"}
        </button>
      </div>
    </Field>
  );
}

export default function MainframeTheme() {
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
    <div className="min-h-screen font-mono bg-[#1a1200] text-[#ffb000] relative">
      {/* CRT outer bezel */}
      <div
        className="fixed inset-0 pointer-events-none z-40 rounded-[40px]"
        style={{
          boxShadow:
            "inset 0 0 100px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.4)",
        }}
      />

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-30 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,176,0,0.15) 2px, rgba(255,176,0,0.15) 4px)",
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#1a1200]/95 border-b border-[#ffb000]/20 px-4 py-2 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dev"
            className="text-[10px] font-mono text-[#664400] hover:text-[#ffb000] transition tracking-tighter"
          >
            &larr; LOGOUT
          </Link>
          <span className="text-[10px] text-[#ffb000]/50 tracking-tighter">
            MAINFRAME OS v3.11
          </span>
        </div>
        <span className="text-[10px] text-[#664400] tracking-tighter">
          SESSION: ACTIVE
        </span>
      </div>

      {/* Fn-key bar */}
      <div className="sticky top-[36px] z-20 bg-[#221a00] border-b border-[#ffb000]/20 px-4 py-1.5 flex items-center gap-2">
        {fnKeys.map((fk) => (
          <button
            key={fk.id}
            type="button"
            onClick={() => scrollTo(fk.id)}
            className={`font-mono text-[10px] tracking-tighter px-3 py-1 border transition ${
              activeSection === fk.id
                ? "bg-[#ffb000] text-[#1a1200] border-[#ffb000] shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
                : "bg-[#1a1200] text-[#ffb000]/70 border-[#ffb000]/20 hover:border-[#ffb000]/40"
            }`}
            style={{ borderRadius: "4px 4px 0 0" }}
          >
            {fk.key}: {fk.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.h1
          className="text-xl text-[#ffb000] mb-1 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          &gt; EVENT CONFIGURATION
        </motion.h1>
        <p className="text-[10px] text-[#664400] mb-6 tracking-tighter">
          AUTHORIZED PERSONNEL ONLY — ALL CHANGES LOGGED
        </p>

        {/* Event */}
        <WindowCard title="event_module.sys" id="event" delay={0.2}>
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
                className="w-full bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-sm font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] transition tracking-tight [color-scheme:dark]"
              />
            </Field>
            <Field label="End Date">
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#1a1200] border border-[#ffb000]/20 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none px-3 py-1.5 text-sm font-mono text-[#ffcc44] focus:outline-none focus:shadow-[0_0_10px_rgba(255,176,0,0.2)] transition tracking-tight [color-scheme:dark]"
              />
            </Field>
          </Row>
          <Row>
            <Field label="Active">
              <BinaryToggle checked={active} onChange={setActive} />
            </Field>
            <Field label="Moderation">
              <BinaryToggle checked={moderationEnabled} onChange={setModerationEnabled} />
            </Field>
          </Row>
        </WindowCard>

        {/* Upload */}
        <WindowCard title="upload_module.sys" id="upload" delay={0.4}>
          <Field label="Welcome Text">
            <TextArea value={welcomeText} onChange={setWelcomeText} />
          </Field>
          <Row>
            <Field label="Button Text">
              <TextInput value={buttonText} onChange={setButtonText} />
            </Field>
            <Field label="Max File Size">
              <NumberInput value={maxFileSize} onChange={setMaxFileSize} min={1} max={50} suffix="MB" />
            </Field>
          </Row>
          <Field label="Success Text">
            <TextArea value={successText} onChange={setSuccessText} />
          </Field>
          <Row>
            <Field label="Require Name">
              <BinaryToggle checked={requireName} onChange={setRequireName} />
            </Field>
            <Field label="Require Message">
              <BinaryToggle checked={requireMessage} onChange={setRequireMessage} />
            </Field>
          </Row>
        </WindowCard>

        {/* Display */}
        <WindowCard title="display_module.sys" id="display" delay={0.6}>
          <Row>
            <Field label="Grid Columns">
              <NumberInput value={gridColumns} onChange={setGridColumns} min={1} max={8} />
            </Field>
            <Field label="Swap Interval">
              <NumberInput value={swapInterval} onChange={setSwapInterval} min={1} max={60} suffix="SEC" />
            </Field>
          </Row>
          <Row>
            <Field label="Transition">
              <SelectInput
                value={transition}
                onChange={setTransition}
                options={[
                  { value: "fade", label: "FADE" },
                  { value: "slide", label: "SLIDE" },
                  { value: "zoom", label: "ZOOM" },
                  { value: "none", label: "NONE" },
                ]}
              />
            </Field>
            <Field label="BG Color">
              <ColorInput value={bgColor} onChange={setBgColor} />
            </Field>
          </Row>
          <Row>
            <Field label="Show Names">
              <BinaryToggle checked={showNames} onChange={setShowNames} />
            </Field>
            <Field label="Show Messages">
              <BinaryToggle checked={showMessages} onChange={setShowMessages} />
            </Field>
          </Row>
          <Row>
            <Field label="Frame Color">
              <ColorInput value={frameBorderColor} onChange={setFrameBorderColor} />
            </Field>
            <Field label="Frame Width">
              <NumberInput value={frameBorderWidth} onChange={setFrameBorderWidth} min={0} max={10} suffix="PX" />
            </Field>
          </Row>
          <Field label="Overlay Opacity">
            <NumberInput value={overlayOpacity} onChange={setOverlayOpacity} min={0} max={100} suffix="%" />
          </Field>
        </WindowCard>

        {/* Branding */}
        <WindowCard title="branding_module.sys" id="branding" delay={0.8}>
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
                  { value: "Inter", label: "INTER" },
                  { value: "Georgia", label: "GEORGIA" },
                  { value: "Monaco", label: "MONACO" },
                  { value: "system-ui", label: "SYSTEM-UI" },
                ]}
              />
            </Field>
          </Row>
        </WindowCard>

        {/* Links */}
        <WindowCard title="links_module.sys" id="links" delay={1.0}>
          <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
          <CopyLink label="Display URL" url={demoEvent.displayUrl} />
          <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
          <Field label="QR Code">
            <div className="bg-[#1a1200] border border-[#ffb000]/20 p-3 inline-block" style={{ borderRadius: "8px 0 8px 0" }}>
              <QRCodeSVG
                value={demoEvent.uploadUrl}
                size={120}
                bgColor="#1a1200"
                fgColor="#ffb000"
              />
              <div className="text-[9px] text-[#664400] mt-2 tracking-tighter text-center">
                SCAN://UPLOAD
              </div>
            </div>
          </Field>
        </WindowCard>

        {/* Save */}
        <div className="flex justify-end mt-4 mb-8">
          <button
            type="button"
            className="font-mono text-sm border border-[#ffb000]/40 bg-[#ffb000]/10 text-[#ffb000] px-6 py-2 hover:bg-[#ffb000]/20 transition tracking-tight"
            style={{ borderRadius: "8px 0 8px 0" }}
          >
            &gt; COMMIT_CHANGES
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#1a1200]/95 border-t border-[#ffb000]/20 px-4 py-1 flex items-center justify-between backdrop-blur-sm">
        <span className="text-[9px] font-mono text-[#664400] tracking-tighter">
          MEM: 640K OK — DISK: 20MB FREE
        </span>
        <span className="text-[9px] font-mono text-[#664400] tracking-tighter">
          {new Date().toLocaleTimeString()} — TERMINAL 7
        </span>
      </div>
    </div>
  );
}
