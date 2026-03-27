"use client";

import { useState } from "react";
import { motion } from "motion/react";

/* ============================================================
   BLUEPRINT FORM PRIMITIVES
   Shared components for the blueprint (theme-8) UI.
   Uses semantic design tokens from globals.css.
   ============================================================ */

// ---- Field ----
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-label-caps mb-1">{label}</label>
      {children}
    </div>
  );
}

// ---- TextInput ----
export function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full bg-surface border border-border-strong rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:border-border-focus transition disabled:opacity-50"
    />
  );
}

// ---- TextArea ----
export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-surface border border-border-strong rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:border-border-focus transition resize-none"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 23px, var(--line-faint) 23px, var(--line-faint) 24px)",
        backgroundSize: "100% 24px",
        lineHeight: "24px",
      }}
    />
  );
}

// ---- NumberInput ----
export function NumberInput({
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
        className="w-20 bg-surface border border-border-strong rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:border-border-focus transition"
      />
      {suffix && (
        <span className="text-label-caps opacity-60">{suffix}</span>
      )}
    </div>
  );
}

// ---- SelectInput ----
export function SelectInput({
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
      className="w-full bg-surface border border-border-strong rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:border-border-focus transition appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ---- CrosshairToggle ----
export function CrosshairToggle({
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
      className={`w-6 h-6 rounded-xs border flex items-center justify-center text-sm font-mono transition ${
        checked
          ? "border-border-focus bg-secondary text-foreground-emphasis"
          : "border-border-strong bg-surface text-line-faint"
      }`}
    >
      +
    </button>
  );
}

// ---- ColorInput ----
export function ColorInput({
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
          className="w-6 h-6 rounded-xs border border-border-strong"
          style={{ backgroundColor: value }}
        />
        {/* Dimension lines */}
        <div className="absolute -top-1 left-0 right-0 h-px bg-line-faint" />
        <div className="absolute -left-1 top-0 bottom-0 w-px bg-line-faint" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-surface border border-border-strong rounded-xs px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-border-focus transition"
      />
    </div>
  );
}

// ---- CopyLink ----
export function CopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 bg-surface border border-border-strong rounded-xs px-3 py-2 text-xs font-mono text-label focus:outline-none focus:border-border-focus transition"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="bg-surface border border-border-strong rounded-xs px-3 py-2 text-label-caps text-foreground-emphasis hover:bg-secondary transition"
        >
          {copied ? "done" : "copy"}
        </button>
      </div>
    </Field>
  );
}

// ---- CompactCopyLink ----
export function CompactCopyLink({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-label-caps opacity-50 !text-[9px] shrink-0">{label}</span>
      <span className="text-xs font-mono text-foreground-emphasis truncate min-w-0">{url}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 bg-surface border border-border-strong rounded-xs px-2 py-0.5 text-[10px] text-label-caps text-foreground-emphasis hover:bg-secondary transition"
      >
        {copied ? "done" : "copy"}
      </button>
    </div>
  );
}

// ---- SectionCard ----
export function SectionCard({
  title,
  id,
  children,
  delay = 0,
  defaultOpen = true,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  delay?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      id={id}
      className="bg-surface border border-card-border rounded-xs p-5 mb-4"
      initial={{ clipPath: "inset(0 100% 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0% 0)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-sm text-foreground-emphasis pb-2 border-b border-border-separator text-left ${open ? "mb-4" : ""}`}
        style={{ fontVariant: "small-caps", letterSpacing: "0.08em" }}
      >
        <span>{title}</span>
        <span className="font-mono text-xs opacity-50">{open ? "\u2212" : "+"}</span>
      </button>
      {open && children}
    </motion.div>
  );
}

// ---- SaveButton ----
export function SaveButton({
  onClick,
  loading,
  label = "save specification",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="bg-surface border-2 border-secondary rounded-xs px-6 py-2.5 text-sm text-foreground-emphasis hover:bg-secondary transition disabled:opacity-50"
      style={{ fontVariant: "small-caps", letterSpacing: "0.05em" }}
    >
      {loading ? "saving..." : label}
    </button>
  );
}

// ---- DateInput ----
export function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface border border-border-strong rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:border-border-focus transition [color-scheme:dark]"
    />
  );
}

// ---- SectionNav ----
export function SectionNav({
  sections,
  activeSection,
  onNavigate,
}: {
  sections: { id: string; label: string }[];
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-label-caps opacity-40">spec</span>
      {sections.map((s) => (
        <span key={s.id} className="flex items-center gap-1">
          <span className="text-foreground-faint">&gt;</span>
          <button
            type="button"
            onClick={() => onNavigate(s.id)}
            className={`transition ${
              activeSection === s.id
                ? "text-foreground-emphasis underline underline-offset-4"
                : "text-label-caps opacity-60 hover:opacity-100 hover:text-foreground-emphasis cursor-pointer"
            }`}
            style={{ fontVariant: "small-caps" }}
          >
            {s.label}
          </button>
        </span>
      ))}
    </div>
  );
}
