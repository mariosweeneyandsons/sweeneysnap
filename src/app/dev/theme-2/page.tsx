"use client";

import { useState } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-xs font-light uppercase tracking-[0.2em] text-gray-500">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-gray-400"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <label className="block text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1.5">
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
      className="w-full rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition"
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
      className="w-full rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition resize-none"
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
        className="w-24 rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition"
      />
      {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
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
      className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${
        checked ? "bg-indigo-500" : "bg-gray-300/60"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1"
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
      className="w-full rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ColorSwatch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-full border-2 border-white/80 shadow-lg"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition"
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
          className="flex-1 rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm font-mono text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-xl bg-indigo-500 text-white px-4 py-3 text-xs font-medium hover:bg-indigo-600 transition"
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

export default function GlassLoftTheme() {
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

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f0ece4 0%, #e8e0f0 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/dev"
            className="text-xs text-gray-400 hover:text-indigo-500 transition-colors mb-8 inline-block"
          >
            &larr; Back
          </Link>
          <h1 className="text-4xl font-light text-gray-800 mb-1">
            Event Settings
          </h1>
          <p className="text-sm text-gray-400 mb-10">
            Configure every detail of your event
          </p>
        </motion.div>

        <div className="space-y-4">
          {[
            {
              title: "Event Basics",
              defaultOpen: true,
              content: (
                <>
                  <Field label="Event Name">
                    <TextInput value={name} onChange={setName} />
                  </Field>
                  <Field label="Slug">
                    <TextInput value={slug} onChange={setSlug} />
                  </Field>
                  <Field label="Description">
                    <TextArea
                      value={description}
                      onChange={setDescription}
                    />
                  </Field>
                  <Row>
                    <Field label="Start Date">
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition"
                      />
                    </Field>
                    <Field label="End Date">
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl bg-white/70 border border-gray-200/50 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition"
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
                </>
              ),
            },
            {
              title: "Upload Config",
              content: (
                <>
                  <Field label="Welcome Text">
                    <TextArea
                      value={welcomeText}
                      onChange={setWelcomeText}
                    />
                  </Field>
                  <Row>
                    <Field label="Button Text">
                      <TextInput
                        value={buttonText}
                        onChange={setButtonText}
                      />
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
                    <TextArea
                      value={successText}
                      onChange={setSuccessText}
                    />
                  </Field>
                  <Row>
                    <Field label="Require Name">
                      <Toggle
                        checked={requireName}
                        onChange={setRequireName}
                      />
                    </Field>
                    <Field label="Require Message">
                      <Toggle
                        checked={requireMessage}
                        onChange={setRequireMessage}
                      />
                    </Field>
                  </Row>
                </>
              ),
            },
            {
              title: "Display Config",
              content: (
                <>
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
                      <ColorSwatch value={bgColor} onChange={setBgColor} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Show Names">
                      <Toggle
                        checked={showNames}
                        onChange={setShowNames}
                      />
                    </Field>
                    <Field label="Show Messages">
                      <Toggle
                        checked={showMessages}
                        onChange={setShowMessages}
                      />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Frame Border Color">
                      <ColorSwatch
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
                </>
              ),
            },
            {
              title: "Branding",
              content: (
                <>
                  <Field label="Logo URL">
                    <TextInput value={logoUrl} onChange={setLogoUrl} />
                  </Field>
                  <Row>
                    <Field label="Primary Color">
                      <ColorSwatch
                        value={primaryColor}
                        onChange={setPrimaryColor}
                      />
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
                </>
              ),
            },
            {
              title: "Quick Links",
              content: (
                <>
                  <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
                  <CopyLink
                    label="Display URL"
                    url={demoEvent.displayUrl}
                  />
                  <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
                  <Field label="QR Code">
                    <div className="bg-white/80 rounded-2xl p-5 inline-block shadow-sm">
                      <QRCodeSVG
                        value={demoEvent.uploadUrl}
                        size={140}
                        bgColor="transparent"
                        fgColor="#4f46e5"
                      />
                    </div>
                  </Field>
                </>
              ),
            },
          ].map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Accordion
                title={section.title}
                defaultOpen={section.defaultOpen ?? false}
              >
                {section.content}
              </Accordion>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="button"
            className="rounded-xl bg-indigo-500 text-white px-8 py-3 text-sm font-medium hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
