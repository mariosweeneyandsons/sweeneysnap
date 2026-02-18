"use client";

import { useState } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import Link from "next/link";

const tabs = ["General", "Upload", "Display", "Branding", "Links"] as const;
type Tab = (typeof tabs)[number];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function GradientInput({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative group rounded-lg p-[1px] bg-gradient-to-r from-[#ff0080]/30 to-[#00d4ff]/30 has-[:focus]:from-[#ff0080] has-[:focus]:to-[#00d4ff] has-[:focus]:shadow-[0_0_20px_rgba(255,0,128,0.3)] transition-shadow">
      <div className="rounded-[7px] bg-[#0d0015]">{children}</div>
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
    <GradientInput>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-4 py-3 text-sm text-white/90 focus:outline-none"
      />
    </GradientInput>
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
    <GradientInput>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-transparent px-4 py-3 text-sm text-white/90 focus:outline-none resize-none"
      />
    </GradientInput>
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
      <GradientInput>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="w-24 bg-transparent px-4 py-3 text-sm text-white/90 focus:outline-none"
        />
      </GradientInput>
      {suffix && (
        <span className="text-xs text-white/30">{suffix}</span>
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
      className={`w-12 h-7 rounded-full relative transition-all duration-300 ${
        checked
          ? "bg-[#ff0080] shadow-[0_0_20px_rgba(255,0,128,0.5)]"
          : "bg-white/10"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 ${
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
    <GradientInput>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-4 py-3 text-sm text-white/90 focus:outline-none appearance-none"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#0d0015] text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </GradientInput>
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
        className="w-16 h-16 rounded-lg border-2 border-white/10 shadow-lg"
        style={{ backgroundColor: value }}
      />
      <GradientInput>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 bg-transparent px-4 py-3 text-sm font-mono text-white/90 focus:outline-none"
        />
      </GradientInput>
    </div>
  );
}

function GridColumnSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-3">
      {[2, 3, 4, 5].map((cols) => (
        <button
          key={cols}
          type="button"
          onClick={() => onChange(cols)}
          className={`w-12 h-12 rounded-lg border-2 p-1.5 transition-all ${
            value === cols
              ? "border-[#ff0080] shadow-[0_0_15px_rgba(255,0,128,0.4)] bg-[#ff0080]/10"
              : "border-white/10 hover:border-white/30"
          }`}
        >
          <div
            className="grid gap-0.5 h-full"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols * cols }, (_, i) => (
              <div
                key={i}
                className={`rounded-[1px] ${
                  value === cols ? "bg-[#ff0080]/60" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

function CopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <div className="flex-1">
          <GradientInput>
            <input
              type="text"
              value={url}
              readOnly
              className="w-full bg-transparent px-4 py-3 text-sm font-mono text-[#00d4ff]/70 focus:outline-none"
            />
          </GradientInput>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="px-4 py-3 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#00d4ff] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(255,0,128,0.4)] transition-shadow"
        >
          {copied ? "Done!" : "Copy"}
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group rounded-xl p-[1px] bg-gradient-to-r from-white/5 to-white/5 hover:from-[#ff0080]/30 hover:to-[#00d4ff]/30 transition-all duration-500">
      <div className="rounded-[11px] bg-[#0d0015]/90 backdrop-blur-sm p-6">
        {children}
      </div>
    </div>
  );
}

export default function NeonStudioTheme() {
  const [activeTab, setActiveTab] = useState<Tab>("General");

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

  const tabContent: Record<Tab, React.ReactNode> = {
    General: (
      <div className="space-y-5">
        <Card>
          <div className="space-y-5">
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
                <GradientInput>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-sm text-white/90 focus:outline-none [color-scheme:dark]"
                  />
                </GradientInput>
              </Field>
              <Field label="End Date">
                <GradientInput>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-sm text-white/90 focus:outline-none [color-scheme:dark]"
                  />
                </GradientInput>
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
          </div>
        </Card>
      </div>
    ),
    Upload: (
      <div className="space-y-5">
        <Card>
          <div className="space-y-5">
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
          </div>
        </Card>
      </div>
    ),
    Display: (
      <div className="space-y-5">
        <Card>
          <div className="space-y-5">
            <Field label="Grid Columns">
              <GridColumnSelector
                value={gridColumns}
                onChange={setGridColumns}
              />
            </Field>
            <Row>
              <Field label="Swap Interval">
                <NumberInput
                  value={swapInterval}
                  onChange={setSwapInterval}
                  min={1}
                  max={60}
                  suffix="sec"
                />
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
            </Row>
            <Field label="Background Color">
              <ColorSwatch value={bgColor} onChange={setBgColor} />
            </Field>
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
          </div>
        </Card>
      </div>
    ),
    Branding: (
      <div className="space-y-5">
        <Card>
          <div className="space-y-5">
            <Field label="Logo URL">
              <TextInput value={logoUrl} onChange={setLogoUrl} />
            </Field>
            <Field label="Primary Color">
              <ColorSwatch value={primaryColor} onChange={setPrimaryColor} />
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
        </Card>
      </div>
    ),
    Links: (
      <div className="space-y-5">
        <Card>
          <div className="space-y-5">
            <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
            <CopyLink label="Display URL" url={demoEvent.displayUrl} />
            <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
            <Field label="QR Code">
              <div className="bg-white/5 rounded-xl p-6 inline-block">
                <QRCodeSVG
                  value={demoEvent.uploadUrl}
                  size={160}
                  bgColor="transparent"
                  fgColor="#ff0080"
                />
              </div>
            </Field>
          </div>
        </Card>
      </div>
    ),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d0015" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/dev"
          className="text-xs text-white/30 hover:text-[#ff0080] transition-colors mb-8 inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="text-4xl font-bold text-white mb-1">
          Event Settings
        </h1>
        {/* Animated gradient line */}
        <div
          className="h-1 w-32 rounded-full mb-8"
          style={{
            background:
              "linear-gradient(90deg, #ff0080, #00d4ff, #ffea00, #ff0080)",
            backgroundSize: "200% 100%",
            animation: "gradientShift 3s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 200% 50%;
            }
          }
        `}</style>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 text-sm font-medium rounded-lg transition-colors z-10 ${
                activeTab === tab
                  ? "text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="neon-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#ff0080]/20 to-[#00d4ff]/20 border border-[#ff0080]/30"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {tabContent[activeTab]}
        </motion.div>

        <div className="flex justify-end mt-8">
          <button
            type="button"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ff0080] to-[#00d4ff] text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(255,0,128,0.4)] transition-shadow"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
