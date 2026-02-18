"use client";

import { useState, useRef, useEffect } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import Link from "next/link";

const sectionIds = ["event", "upload", "display", "branding", "links"];

function LeafSVG() {
  return (
    <svg
      className="absolute top-4 right-4 w-24 h-24 opacity-[0.06] pointer-events-none"
      viewBox="0 0 100 100"
      fill="none"
      stroke="#4a7c59"
      strokeWidth="0.5"
    >
      <path d="M50 95 C50 95 10 60 10 30 C10 10 30 5 50 5 C70 5 90 10 90 30 C90 60 50 95 50 95Z" />
      <path d="M50 95 L50 20" />
      <path d="M50 40 C35 35 25 30 20 25" />
      <path d="M50 40 C65 35 75 30 80 25" />
      <path d="M50 55 C38 48 30 43 25 40" />
      <path d="M50 55 C62 48 70 43 75 40" />
      <path d="M50 70 C42 63 35 58 30 55" />
      <path d="M50 70 C58 63 65 58 70 55" />
    </svg>
  );
}

function LeafToggle({
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
      className="w-8 h-8 flex items-center justify-center transition-colors"
      style={{
        borderRadius: "50% 0% 50% 0%",
        transform: "rotate(45deg)",
        backgroundColor: checked ? "#4a7c59" : "#e8e0d0",
        border: `2px solid ${checked ? "#3d6b4a" : "#c4b89a"}`,
      }}
    >
      <span style={{ transform: "rotate(-45deg)", fontSize: "12px", color: checked ? "#fffef9" : "#8b7d6b" }}>
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

function Card({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="break-inside-avoid mb-6 bg-[#fffef9] rounded-3xl p-8 border border-[#c4b89a]/30 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <LeafSVG />
      {children}
    </motion.div>
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
    <div className="mb-5 last:mb-0">
      <label className="block text-xs italic text-[#4a7c59] mb-1.5">
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
      className="w-full bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-4 py-2.5 text-sm text-[#3d3329] focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 focus:border-[#d4845a] transition"
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
      className="w-full bg-[#fffef9] border border-[#c4b89a]/40 rounded-2xl px-4 py-2.5 text-sm text-[#3d3329] focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 focus:border-[#d4845a] transition resize-none"
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
        className="w-24 bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-4 py-2.5 text-sm text-[#3d3329] focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 focus:border-[#d4845a] transition"
      />
      {suffix && (
        <span className="text-xs italic text-[#4a7c59]/60">{suffix}</span>
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
      className="w-full bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-4 py-2.5 text-sm text-[#3d3329] focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 focus:border-[#d4845a] transition appearance-none"
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
    <div className="flex items-center gap-2 bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-3 py-1.5 w-fit">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 border border-[#c4b89a]/30"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-transparent border-0 px-2 py-1 text-sm font-mono text-[#3d3329] focus:outline-none"
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
          className="flex-1 bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-4 py-2.5 text-xs font-mono text-[#4a7c59]/70 focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 transition"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="bg-[#4a7c59] text-[#fffef9] rounded-full px-4 py-2 text-xs hover:bg-[#3d6b4a] transition"
        >
          {copied ? "Done" : "Copy"}
        </button>
      </div>
    </Field>
  );
}

export default function GreenhouseTheme() {
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

  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (idx >= 0) setActiveIdx(idx);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: "#f7f3eb",
        backgroundImage:
          "radial-gradient(circle, #c4b89a 0.5px, transparent 0.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Floating dot rail */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {sectionIds.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(i)}
            className={`w-3 h-3 rounded-full border-2 transition-all ${
              activeIdx === i
                ? "bg-[#4a7c59] border-[#4a7c59] scale-125"
                : "bg-transparent border-[#c4b89a] hover:border-[#4a7c59]"
            }`}
            title={id}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-8 pt-12 pb-24">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/dev"
            className="text-xs italic text-[#4a7c59] hover:text-[#d4845a] transition-colors mb-8 inline-block"
          >
            &larr; back to themes
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-light text-[#3d3329] mb-2">
            Event Settings
          </h1>
          <p className="text-sm italic text-[#4a7c59]/70">
            Configure your event like tending a garden
          </p>
        </motion.div>

        {/* Masonry 2-col */}
        <div className="columns-1 md:columns-2 gap-6">
          {/* Event */}
          <div ref={(el) => { sectionRefs.current[0] = el; }}>
            <Card delay={0}>
              <h2 className="text-lg font-medium text-[#3d3329] mb-1">Event Basics</h2>
              <p className="text-xs italic text-[#4a7c59]/60 mb-6">Seeds of your event</p>
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
                  className="w-full bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-4 py-2.5 text-sm text-[#3d3329] focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 focus:border-[#d4845a] transition"
                />
              </Field>
              <Field label="End Date">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#fffef9] border border-[#c4b89a]/40 rounded-full px-4 py-2.5 text-sm text-[#3d3329] focus:outline-none focus:ring-2 focus:ring-[#d4845a]/30 focus:border-[#d4845a] transition"
                />
              </Field>
              <div className="flex gap-8">
                <Field label="Active">
                  <LeafToggle checked={active} onChange={setActive} />
                </Field>
                <Field label="Moderation">
                  <LeafToggle checked={moderationEnabled} onChange={setModerationEnabled} />
                </Field>
              </div>
            </Card>
          </div>

          {/* Upload */}
          <div ref={(el) => { sectionRefs.current[1] = el; }}>
            <Card delay={0.05}>
              <h2 className="text-lg font-medium text-[#3d3329] mb-1">Upload Config</h2>
              <p className="text-xs italic text-[#4a7c59]/60 mb-6">How guests share their moments</p>
              <Field label="Welcome Text">
                <TextArea value={welcomeText} onChange={setWelcomeText} />
              </Field>
              <Field label="Button Text">
                <TextInput value={buttonText} onChange={setButtonText} />
              </Field>
              <Field label="Success Text">
                <TextArea value={successText} onChange={setSuccessText} />
              </Field>
              <div className="flex gap-8">
                <Field label="Require Name">
                  <LeafToggle checked={requireName} onChange={setRequireName} />
                </Field>
                <Field label="Require Message">
                  <LeafToggle checked={requireMessage} onChange={setRequireMessage} />
                </Field>
              </div>
              <Field label="Max File Size">
                <NumberInput value={maxFileSize} onChange={setMaxFileSize} min={1} max={50} suffix="MB" />
              </Field>
            </Card>
          </div>

          {/* Display */}
          <div ref={(el) => { sectionRefs.current[2] = el; }}>
            <Card delay={0.1}>
              <h2 className="text-lg font-medium text-[#3d3329] mb-1">Display Config</h2>
              <p className="text-xs italic text-[#4a7c59]/60 mb-6">How the wall blooms</p>
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
              <Field label="Background Color">
                <ColorInput value={bgColor} onChange={setBgColor} />
              </Field>
              <div className="flex gap-8">
                <Field label="Show Names">
                  <LeafToggle checked={showNames} onChange={setShowNames} />
                </Field>
                <Field label="Show Messages">
                  <LeafToggle checked={showMessages} onChange={setShowMessages} />
                </Field>
              </div>
              <Field label="Frame Border Color">
                <ColorInput value={frameBorderColor} onChange={setFrameBorderColor} />
              </Field>
              <Field label="Frame Border Width">
                <NumberInput value={frameBorderWidth} onChange={setFrameBorderWidth} min={0} max={10} suffix="px" />
              </Field>
              <Field label="Overlay Opacity">
                <NumberInput value={overlayOpacity} onChange={setOverlayOpacity} min={0} max={100} suffix="%" />
              </Field>
            </Card>
          </div>

          {/* Branding */}
          <div ref={(el) => { sectionRefs.current[3] = el; }}>
            <Card delay={0.15}>
              <h2 className="text-lg font-medium text-[#3d3329] mb-1">Branding</h2>
              <p className="text-xs italic text-[#4a7c59]/60 mb-6">Your garden&apos;s signature</p>
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
            </Card>
          </div>

          {/* Links */}
          <div ref={(el) => { sectionRefs.current[4] = el; }}>
            <Card delay={0.2}>
              <h2 className="text-lg font-medium text-[#3d3329] mb-1">Quick Links</h2>
              <p className="text-xs italic text-[#4a7c59]/60 mb-6">Pathways to your event</p>
              <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
              <CopyLink label="Display URL" url={demoEvent.displayUrl} />
              <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
              <Field label="QR Code">
                <div className="bg-[#fffef9] rounded-3xl border border-[#c4b89a]/30 p-6 inline-block">
                  <QRCodeSVG
                    value={demoEvent.uploadUrl}
                    size={120}
                    bgColor="#fffef9"
                    fgColor="#4a7c59"
                  />
                </div>
              </Field>
            </Card>
          </div>
        </div>

        {/* Save */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <button
            type="button"
            className="bg-[#4a7c59] text-[#fffef9] rounded-full px-10 py-3 text-sm font-medium hover:bg-[#3d6b4a] transition shadow-sm"
          >
            Save Configuration
          </button>
        </motion.div>
      </div>
    </div>
  );
}
