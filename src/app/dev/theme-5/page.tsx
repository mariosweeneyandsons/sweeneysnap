"use client";

import { useState } from "react";
import { demoEvent } from "../_demoData";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative border-b-[2px] border-black pb-12 mb-12">
      <div className="absolute top-0 left-0 text-[120px] font-bold leading-none text-black/10 select-none pointer-events-none">
        {number}
      </div>
      <div className="relative pt-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-1">
          {title}
        </h2>
        <div className="w-12 h-[3px] bg-[#ff0000] mb-8" />
        <div className="grid grid-cols-12 gap-x-6 gap-y-6">{children}</div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  span = 6,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={`col-span-12 sm:col-span-${span}`}>
      <div className="grid grid-cols-12 gap-4 items-start">
        <label className="col-span-4 text-xs font-bold uppercase tracking-wide pt-2.5">
          {label}
        </label>
        <div className="col-span-8">{children}</div>
      </div>
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
      className="w-full border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
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
      className="w-full border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#ff0000] transition-colors resize-none"
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
        className="w-24 border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
      />
      {suffix && (
        <span className="text-xs font-bold uppercase">{suffix}</span>
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
      className={`w-5 h-5 border-[2px] border-black rounded-none flex items-center justify-center ${
        checked ? "bg-black" : "bg-white"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 12 12"
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M2 6l3 3 5-5" />
        </svg>
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
      className="w-full border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#ff0000] transition-colors appearance-none"
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
        className="w-8 h-8 border-[2px] border-black rounded-none"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#ff0000] transition-colors"
      />
    </div>
  );
}

function CopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="col-span-12 sm:col-span-6">
      <div className="grid grid-cols-12 gap-4 items-start">
        <label className="col-span-4 text-xs font-bold uppercase tracking-wide pt-2.5">
          {label}
        </label>
        <div className="col-span-8 flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#ff0000] transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="border-[2px] border-black rounded-none px-3 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
          >
            {copied ? "DONE" : "COPY"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwissGridTheme() {
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
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <Link
          href="/dev"
          className="text-xs font-bold uppercase tracking-wide hover:text-[#ff0000] transition-colors mb-8 inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="text-7xl font-bold uppercase tracking-tight leading-none mb-2">
          Event
          <br />
          Settings
        </h1>
        <div className="w-16 h-[3px] bg-[#ff0000] mb-12" />

        {/* 01 — Event Basics */}
        <Section number="01" title="Event Basics">
          <Field label="Event Name" span={12}>
            <TextInput value={name} onChange={setName} />
          </Field>
          <Field label="Slug" span={6}>
            <TextInput value={slug} onChange={setSlug} />
          </Field>
          <Field label="Description" span={12}>
            <TextArea value={description} onChange={setDescription} />
          </Field>
          <Field label="Start Date" span={6}>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
            />
          </Field>
          <Field label="End Date" span={6}>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-[2px] border-black rounded-none bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#ff0000] transition-colors"
            />
          </Field>
          <Field label="Active" span={6}>
            <Toggle checked={active} onChange={setActive} />
          </Field>
          <Field label="Moderation" span={6}>
            <Toggle
              checked={moderationEnabled}
              onChange={setModerationEnabled}
            />
          </Field>
        </Section>

        {/* 02 — Upload Config */}
        <Section number="02" title="Upload Config">
          <Field label="Welcome Text" span={12}>
            <TextArea value={welcomeText} onChange={setWelcomeText} />
          </Field>
          <Field label="Button Text" span={6}>
            <TextInput value={buttonText} onChange={setButtonText} />
          </Field>
          <Field label="Success Text" span={12}>
            <TextArea value={successText} onChange={setSuccessText} />
          </Field>
          <Field label="Require Name" span={6}>
            <Toggle checked={requireName} onChange={setRequireName} />
          </Field>
          <Field label="Require Msg" span={6}>
            <Toggle checked={requireMessage} onChange={setRequireMessage} />
          </Field>
          <Field label="Max File Size" span={6}>
            <NumberInput
              value={maxFileSize}
              onChange={setMaxFileSize}
              min={1}
              max={50}
              suffix="MB"
            />
          </Field>
        </Section>

        {/* 03 — Display Config */}
        <Section number="03" title="Display Config">
          <Field label="Grid Columns" span={6}>
            <NumberInput
              value={gridColumns}
              onChange={setGridColumns}
              min={1}
              max={8}
            />
          </Field>
          <Field label="Swap Interval" span={6}>
            <NumberInput
              value={swapInterval}
              onChange={setSwapInterval}
              min={1}
              max={60}
              suffix="sec"
            />
          </Field>
          <Field label="Transition" span={6}>
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
          <Field label="BG Color" span={6}>
            <ColorInput value={bgColor} onChange={setBgColor} />
          </Field>
          <Field label="Show Names" span={6}>
            <Toggle checked={showNames} onChange={setShowNames} />
          </Field>
          <Field label="Show Messages" span={6}>
            <Toggle checked={showMessages} onChange={setShowMessages} />
          </Field>
          <Field label="Frame Color" span={6}>
            <ColorInput
              value={frameBorderColor}
              onChange={setFrameBorderColor}
            />
          </Field>
          <Field label="Frame Width" span={6}>
            <NumberInput
              value={frameBorderWidth}
              onChange={setFrameBorderWidth}
              min={0}
              max={10}
              suffix="px"
            />
          </Field>
          <Field label="Overlay" span={6}>
            <NumberInput
              value={overlayOpacity}
              onChange={setOverlayOpacity}
              min={0}
              max={100}
              suffix="%"
            />
          </Field>
        </Section>

        {/* 04 — Branding */}
        <Section number="04" title="Branding">
          <Field label="Logo URL" span={12}>
            <TextInput value={logoUrl} onChange={setLogoUrl} />
          </Field>
          <Field label="Primary Color" span={6}>
            <ColorInput value={primaryColor} onChange={setPrimaryColor} />
          </Field>
          <Field label="Font Family" span={6}>
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
        </Section>

        {/* 05 — Quick Links */}
        <Section number="05" title="Quick Links">
          <CopyLink label="Upload URL" url={demoEvent.uploadUrl} />
          <CopyLink label="Display URL" url={demoEvent.displayUrl} />
          <CopyLink label="Crew URL" url={demoEvent.crewUrl} />
          <div className="col-span-12 sm:col-span-6">
            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-4 text-xs font-bold uppercase tracking-wide pt-2.5">
                QR Code
              </label>
              <div className="col-span-8">
                <div className="border-[2px] border-black p-4 inline-block rounded-none">
                  <QRCodeSVG
                    value={demoEvent.uploadUrl}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <div className="flex justify-end">
          <button
            type="button"
            className="border-[2px] border-black rounded-none px-8 py-3 text-sm font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
