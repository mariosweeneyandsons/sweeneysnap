"use client";

import { useState } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import Link from "next/link";

const navItems = [
  { emoji: "🏠", label: "Event", id: "event" },
  { emoji: "📸", label: "Upload", id: "upload" },
  { emoji: "📺", label: "Display", id: "display" },
  { emoji: "🎨", label: "Brand", id: "branding" },
  { emoji: "🔗", label: "Links", id: "links" },
];

const cardColors = [
  "bg-[#fef3c7]", // yellow
  "bg-[#dbeafe]", // blue
  "bg-[#dcfce7]", // green
  "bg-[#fce7f3]", // pink
  "bg-[#ede9fe]", // violet
];

const cardRadii = [
  "rounded-[20px_4px_20px_4px]",
  "rounded-[4px_20px_4px_20px]",
  "rounded-2xl",
  "rounded-[20px_4px_20px_4px]",
  "rounded-[4px_20px_4px_20px]",
];

const cardRotations = [
  "rotate(-1deg)",
  "rotate(0.5deg)",
  "rotate(-0.5deg)",
  "rotate(0.8deg)",
  "rotate(-0.3deg)",
];

function EmojiToggle({
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
      className={`w-14 h-8 rounded-full relative transition-colors ${
        checked ? "bg-[#f472b6]" : "bg-[#e5e7eb]"
      }`}
    >
      <motion.span
        className="absolute top-0.5 text-lg leading-none"
        animate={{ left: checked ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {checked ? "🎉" : "💤"}
      </motion.span>
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
    <div className="mb-4 last:mb-0">
      <label className="block text-xs font-semibold text-[#374151] mb-1">
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
      className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 focus:border-[#f472b6] transition"
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
      className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 focus:border-[#f472b6] transition resize-none"
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
        className="w-24 bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 focus:border-[#f472b6] transition"
      />
      {suffix && (
        <span className="text-xs font-semibold text-[#8b5cf6]">{suffix}</span>
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
      className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 focus:border-[#f472b6] transition appearance-none"
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
      <motion.div
        className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#f472b6]"
        style={{ backgroundColor: value }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 bg-white border-2 border-[#e5e7eb] rounded-xl px-3 py-2 text-sm font-mono text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 transition"
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
          className="flex-1 bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-xs font-mono text-[#8b5cf6] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 transition"
        />
        <motion.button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="bg-[#8b5cf6] text-white rounded-xl px-4 py-2.5 text-xs font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? "Yay! ✨" : "Copy"}
        </motion.button>
      </div>
    </Field>
  );
}

// Confetti shapes
const confettiShapes = [
  { type: "circle", top: "5%", left: "8%", size: 16, color: "#f472b6", rotation: 0 },
  { type: "square", top: "12%", left: "85%", size: 12, color: "#8b5cf6", rotation: 45 },
  { type: "circle", top: "25%", left: "3%", size: 10, color: "#fbbf24", rotation: 0 },
  { type: "square", top: "35%", left: "92%", size: 14, color: "#34d399", rotation: 20 },
  { type: "circle", top: "45%", left: "6%", size: 8, color: "#60a5fa", rotation: 0 },
  { type: "square", top: "55%", left: "88%", size: 10, color: "#f472b6", rotation: -15 },
  { type: "circle", top: "65%", left: "4%", size: 14, color: "#a78bfa", rotation: 0 },
  { type: "square", top: "75%", left: "90%", size: 12, color: "#fbbf24", rotation: 30 },
  { type: "circle", top: "85%", left: "7%", size: 10, color: "#34d399", rotation: 0 },
  { type: "square", top: "15%", left: "45%", size: 8, color: "#f472b6", rotation: -25 },
  { type: "circle", top: "40%", left: "95%", size: 12, color: "#60a5fa", rotation: 0 },
  { type: "square", top: "70%", left: "50%", size: 10, color: "#a78bfa", rotation: 40 },
  { type: "circle", top: "8%", left: "60%", size: 6, color: "#fbbf24", rotation: 0 },
  { type: "square", top: "90%", left: "30%", size: 8, color: "#34d399", rotation: -10 },
  { type: "circle", top: "50%", left: "15%", size: 10, color: "#f472b6", rotation: 0 },
];

export default function ConfettiTheme() {
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

  const [activeNav, setActiveNav] = useState("event");

  const scrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const cardSections = [
    {
      id: "event",
      title: "🏠 Event Basics",
      content: (
        <>
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
              className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 focus:border-[#f472b6] transition"
            />
          </Field>
          <Field label="End Date">
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none focus:ring-4 focus:ring-[#f472b6]/20 focus:border-[#f472b6] transition"
            />
          </Field>
          <div className="flex gap-8">
            <Field label="Active">
              <EmojiToggle checked={active} onChange={setActive} />
            </Field>
            <Field label="Moderation">
              <EmojiToggle checked={moderationEnabled} onChange={setModerationEnabled} />
            </Field>
          </div>
        </>
      ),
    },
    {
      id: "upload",
      title: "📸 Upload Config",
      content: (
        <>
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
              <EmojiToggle checked={requireName} onChange={setRequireName} />
            </Field>
            <Field label="Require Message">
              <EmojiToggle checked={requireMessage} onChange={setRequireMessage} />
            </Field>
          </div>
          <Field label="Max File Size">
            <NumberInput value={maxFileSize} onChange={setMaxFileSize} min={1} max={50} suffix="MB" />
          </Field>
        </>
      ),
    },
    {
      id: "display",
      title: "📺 Display Config",
      content: (
        <>
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
                { value: "fade", label: "Fade ✨" },
                { value: "slide", label: "Slide 🎢" },
                { value: "zoom", label: "Zoom 🔍" },
                { value: "none", label: "None 🚫" },
              ]}
            />
          </Field>
          <Field label="Background Color">
            <ColorInput value={bgColor} onChange={setBgColor} />
          </Field>
          <div className="flex gap-8">
            <Field label="Show Names">
              <EmojiToggle checked={showNames} onChange={setShowNames} />
            </Field>
            <Field label="Show Messages">
              <EmojiToggle checked={showMessages} onChange={setShowMessages} />
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
        </>
      ),
    },
    {
      id: "branding",
      title: "🎨 Branding",
      content: (
        <>
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
        </>
      ),
    },
    {
      id: "links",
      title: "🔗 Quick Links",
      content: (
        <>
          <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
          <CopyLink label="Display URL" url={demoEvent.displayUrl} />
          <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
          <Field label="QR Code">
            <motion.div
              className="border-2 border-dashed border-[#f472b6] rounded-2xl p-6 inline-block"
              style={{ transform: "rotate(2deg)" }}
              whileHover={{ rotate: 0, scale: 1.02 }}
            >
              <QRCodeSVG
                value={demoEvent.uploadUrl}
                size={120}
                bgColor="#ffffff"
                fgColor="#8b5cf6"
              />
            </motion.div>
          </Field>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fff5f5] text-[#374151] relative pb-24">
      {/* Confetti decorations */}
      {confettiShapes.map((shape, i) => (
        <div
          key={i}
          className="fixed pointer-events-none opacity-[0.15] z-0"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            borderRadius: shape.type === "circle" ? "50%" : "2px",
            transform: `rotate(${shape.rotation}deg)`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 px-8 pt-8 mb-8">
        <Link
          href="/dev"
          className="text-xs font-semibold text-[#8b5cf6] hover:text-[#f472b6] transition mb-4 inline-block"
        >
          &larr; Back to themes
        </Link>
        <motion.h1
          className="text-4xl font-extrabold tracking-wide text-[#374151]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Event Settings 🎉
        </motion.h1>
        <p className="text-sm text-[#8b5cf6] font-semibold mt-1">
          Let&apos;s make this event amazing!
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 space-y-6">
        {cardSections.map((section, i) => (
          <motion.div
            key={section.id}
            id={section.id}
            className={`${cardColors[i % cardColors.length]} ${cardRadii[i % cardRadii.length]} p-8 shadow-sm`}
            style={{ transform: cardRotations[i % cardRotations.length] }}
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            whileInView={{
              opacity: 1,
              y: 0,
              rotate: parseFloat(cardRotations[i % cardRotations.length].replace("rotate(", "").replace("deg)", "")),
            }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.05 }}
            whileHover={{ scale: 1.01, rotate: 0 }}
          >
            <h2 className="text-2xl font-extrabold tracking-wide text-[#374151] mb-6">
              {section.title}
            </h2>
            {section.content}
          </motion.div>
        ))}
      </div>

      {/* Save button */}
      <div className="relative z-10 flex justify-center mt-10">
        <motion.button
          type="button"
          className="bg-[#8b5cf6] text-white font-extrabold rounded-2xl px-10 py-4 text-lg shadow-lg"
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Save Configuration 🎊
        </motion.button>
      </div>

      {/* Bottom emoji nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-[#e5e7eb]">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
              activeNav === item.id ? "bg-[#fce7f3]" : "hover:bg-[#f5f5f5]"
            }`}
            animate={activeNav === item.id ? { scale: 1.2 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            title={item.label}
          >
            {item.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
