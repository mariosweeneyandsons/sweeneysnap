"use client";

import { useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";

/* ============================================================
   SWEENEYSNAP BRAND KIT — /dev/brand-kit
   Comprehensive style guide rendered in the Blueprint aesthetic
   ============================================================ */

// --------------- Data ---------------

const colorGroups = [
  {
    label: "Backgrounds",
    tokens: [
      { name: "--background", tw: "bg-background", hex: "#1a2744" },
      { name: "--background-elevated", tw: "bg-background-elevated", hex: "#111d35" },
      { name: "--surface", tw: "bg-surface", hex: "#1e2f52" },
      { name: "--surface-hover", tw: "bg-surface-hover", hex: "#253a63" },
      { name: "--surface-active", tw: "bg-surface-active", hex: "#2d4574" },
    ],
  },
  {
    label: "Foregrounds",
    tokens: [
      { name: "--foreground", tw: "text-foreground", hex: "#e8f0ff" },
      { name: "--foreground-emphasis", tw: "text-foreground-emphasis", hex: "#ffffff" },
      { name: "--foreground-muted", tw: "text-foreground-muted", hex: "#e8f0ff/60%" },
      { name: "--foreground-faint", tw: "text-foreground-faint", hex: "#e8f0ff/35%" },
    ],
  },
  {
    label: "Borders",
    tokens: [
      { name: "--border", tw: "border-border", hex: "#4a7ab5/30%" },
      { name: "--border-strong", tw: "border-border-strong", hex: "#4a7ab5/50%" },
      { name: "--border-focus", tw: "border-border-focus", hex: "#ffffff" },
      { name: "--border-separator", tw: "border-border-separator", hex: "#4a7ab5/20%" },
    ],
  },
  {
    label: "Interactive",
    tokens: [
      { name: "--primary", tw: "bg-primary", hex: "#4a7ab5" },
      { name: "--primary-hover", tw: "bg-primary-hover", hex: "#6b9ad0" },
      { name: "--secondary", tw: "bg-secondary", hex: "#ffffff/10%" },
      { name: "--secondary-hover", tw: "bg-secondary-hover", hex: "#ffffff/15%" },
    ],
  },
  {
    label: "Status",
    tokens: [
      { name: "--destructive", tw: "bg-destructive", hex: "#ff6b4a" },
      { name: "--success", tw: "bg-success", hex: "#4ade80" },
      { name: "--warning", tw: "bg-warning", hex: "#facc15" },
    ],
  },
  {
    label: "Blueprint",
    tokens: [
      { name: "--line", tw: "border-line", hex: "#4a7ab5" },
      { name: "--line-muted", tw: "border-line-muted", hex: "#4a7ab5/60%" },
      { name: "--line-faint", tw: "border-line-faint", hex: "#4a7ab5/20%" },
      { name: "--grid-line", tw: "bg-grid-line", hex: "#4a7ab5/5%" },
      { name: "--label-color", tw: "text-label", hex: "#a0c8e8" },
    ],
  },
];

const typeSizes = [
  { label: "2xs", class: "text-2xs", px: "10px" },
  { label: "xs", class: "text-xs", px: "12px" },
  { label: "sm", class: "text-sm", px: "14px" },
  { label: "base", class: "text-base", px: "16px" },
  { label: "lg", class: "text-lg", px: "18px" },
  { label: "xl", class: "text-xl", px: "20px" },
  { label: "2xl", class: "text-2xl", px: "24px" },
  { label: "3xl", class: "text-3xl", px: "30px" },
  { label: "4xl", class: "text-4xl", px: "36px" },
];

const trackingScale = [
  { label: "tight", value: "0.01em", tw: "tracking-tight" },
  { label: "normal", value: "0.02em", tw: "tracking-normal" },
  { label: "label", value: "0.05em", tw: "tracking-label" },
  { label: "heading", value: "0.08em", tw: "tracking-heading" },
];

const radiusScale = [
  { label: "xs", value: "2px", tw: "rounded-xs" },
  { label: "sm", value: "4px", tw: "rounded-sm" },
  { label: "md", value: "8px", tw: "rounded-md" },
  { label: "lg", value: "12px", tw: "rounded-lg" },
  { label: "full", value: "9999px", tw: "rounded-full" },
];

const spacingScale = [
  { label: "1", px: "4px" },
  { label: "2", px: "8px" },
  { label: "3", px: "12px" },
  { label: "4", px: "16px" },
  { label: "5", px: "20px" },
  { label: "6", px: "24px" },
  { label: "8", px: "32px" },
  { label: "10", px: "40px" },
  { label: "12", px: "48px" },
];

const wordingConventions = [
  { use: "Snap", avoid: "Take photo" },
  { use: "Upload", avoid: "Submit" },
  { use: "Wall", avoid: "Gallery" },
  { use: "Event", avoid: "Project" },
  { use: "Crew", avoid: "Staff" },
  { use: "Go Live", avoid: "Activate" },
  { use: "Moderate", avoid: "Review" },
];

const sampleCopy = [
  {
    label: "Welcome message",
    copy: "Share your best moments! Snap a photo and add it to the wall.",
  },
  {
    label: "Success message",
    copy: "Nice one! Your snap is on the wall.",
  },
  {
    label: "Empty state",
    copy: "No snaps yet. Be the first to share a moment!",
  },
  {
    label: "Upload error",
    copy: "Something went wrong uploading your snap. Give it another go.",
  },
  {
    label: "Primary button",
    copy: "Upload Snap",
  },
  {
    label: "Secondary button",
    copy: "Cancel",
  },
  {
    label: "Admin heading",
    copy: "Event Settings",
  },
  {
    label: "Section title",
    copy: "Display Configuration",
  },
  {
    label: "Form label",
    copy: "event name",
  },
];

const frostedGlassPatterns = [
  {
    label: "Sticky Header",
    description: "Top navigation bar with frosted background for depth separation.",
    classes: "bg-background/95 backdrop-blur-sm",
    position: "top" as const,
  },
  {
    label: "Form Inputs",
    description: "Text inputs with semi-transparent background and subtle blur.",
    classes: "bg-input-bg backdrop-blur-md",
    position: "middle" as const,
  },
  {
    label: "Surface Overlay",
    description: "Full-card overlay for modals, drawers, and elevated panels.",
    classes: "bg-surface-overlay backdrop-blur-lg",
    position: "full" as const,
  },
];

const durationTokens = [
  {
    label: "fast",
    value: "150ms",
    tw: "duration-fast",
    token: "--duration-fast",
    use: "Hover states, micro-interactions, toggles",
  },
  {
    label: "normal",
    value: "250ms",
    tw: "duration-normal",
    token: "--duration-normal",
    use: "Panel transitions, dropdowns, focus rings",
  },
  {
    label: "slow",
    value: "600ms",
    tw: "duration-slow",
    token: "--duration-slow",
    use: "Page entry, hero animations, fade-ins",
  },
];

// --------------- Section Components ---------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-sm text-foreground-emphasis mb-6 pb-2 border-b-2 border-border-strong tracking-heading"
      style={{ fontVariant: "small-caps" }}
    >
      {children}
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card-bg border border-card-border rounded-xs p-6 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-label-caps">{children}</span>
  );
}

// --------------- Color Swatch ---------------

function ColorSwatch({ token }: { token: { name: string; tw: string; hex: string } }) {
  const isTransparentMix = token.hex.includes("/");
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-10 h-10 rounded-xs border border-border-strong shrink-0"
        style={{ backgroundColor: isTransparentMix ? undefined : token.hex }}
      >
        {isTransparentMix && (
          <div
            className="w-full h-full rounded-xs"
            style={{ backgroundColor: `var(${token.name})` }}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-mono text-foreground">{token.name}</div>
        <div className="text-[10px] font-mono text-foreground-muted">{token.tw}</div>
        <div className="text-[10px] font-mono text-foreground-faint">{token.hex}</div>
      </div>
    </div>
  );
}

// --------------- Main Page ---------------

export default function BrandKitPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [motionKey, setMotionKey] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bp-grid">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b-2 border-border-strong">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dev"
              className="text-[10px] text-line hover:text-foreground-emphasis transition"
              style={{ fontVariant: "small-caps" }}
            >
              &larr; index
            </Link>
            <div className="border border-border rounded-xs px-4 py-1.5 flex items-center gap-6">
              <div>
                <div className="text-[9px] text-foreground-faint" style={{ fontVariant: "small-caps" }}>
                  document
                </div>
                <div className="text-xs text-foreground-emphasis" style={{ fontVariant: "small-caps" }}>
                  brand kit
                </div>
              </div>
              <div className="w-[1px] h-6 bg-border-separator" />
              <div>
                <div className="text-[9px] text-foreground-faint" style={{ fontVariant: "small-caps" }}>
                  rev
                </div>
                <div className="text-xs text-foreground-emphasis font-mono">B</div>
              </div>
              <div className="w-[1px] h-6 bg-border-separator" />
              <div>
                <div className="text-[9px] text-foreground-faint" style={{ fontVariant: "small-caps" }}>
                  date
                </div>
                <div className="text-xs text-foreground-emphasis font-mono">2026-02-20</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-16">

        {/* ========== 1. BRAND IDENTITY ========== */}
        <section>
          <SectionHeading>1. Brand Identity</SectionHeading>
          <Card>
            <div className="flex items-start gap-10">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground-emphasis tracking-tight mb-2">
                  SweeneySnap
                </h1>
                <p className="text-lg text-foreground-muted tracking-normal mb-6">
                  Capture the moment. Share the wall.
                </p>
                <div className="flex items-center gap-3 text-sm text-foreground-faint">
                  <span>A product by</span>
                  <span className="text-foreground font-medium">Sweeney &amp; Sons</span>
                </div>
              </div>
              <div className="border border-border rounded-xs p-5 bg-background-elevated">
                <div className="text-[9px] text-foreground-faint mb-2" style={{ fontVariant: "small-caps" }}>
                  product mark
                </div>
                <div className="text-2xl font-bold text-foreground-emphasis tracking-tight">
                  Sweeney<span className="text-primary">Snap</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ========== 2. BRAND VOICE & COPY ========== */}
        <section>
          <SectionHeading>2. Brand Voice &amp; Copy</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice attributes */}
            <Card>
              <Label>voice attributes</Label>
              <p className="text-sm text-foreground mt-3 leading-relaxed">
                Professional, polished, confident — matching the parent Sweeney &amp; Sons brand.
                Not overly playful, not corporate either. Direct and client-centric.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label>do</Label>
                  <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
                    <li>Be concise and direct</li>
                    <li>Sound encouraging</li>
                    <li>Use active voice</li>
                    <li>Be client-focused</li>
                  </ul>
                </div>
                <div>
                  <Label>don&apos;t</Label>
                  <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
                    <li>Sound robotic or stiff</li>
                    <li>Be overly casual</li>
                    <li>Use jargon or tech-speak</li>
                    <li>Over-explain</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Wording conventions */}
            <Card>
              <Label>wording conventions</Label>
              <table className="w-full mt-3 text-sm">
                <thead>
                  <tr className="border-b border-border-separator">
                    <th className="text-left py-2 text-foreground-faint font-normal text-[10px]" style={{ fontVariant: "small-caps" }}>
                      use
                    </th>
                    <th className="text-left py-2 text-foreground-faint font-normal text-[10px]" style={{ fontVariant: "small-caps" }}>
                      avoid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wordingConventions.map((row) => (
                    <tr key={row.use} className="border-b border-border-separator last:border-0">
                      <td className="py-2 text-foreground font-medium">{row.use}</td>
                      <td className="py-2 text-foreground-muted line-through decoration-destructive/40">
                        {row.avoid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Sample copy */}
            <Card className="lg:col-span-2">
              <Label>sample ui copy</Label>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleCopy.map((item) => (
                  <div key={item.label} className="bg-background rounded-xs p-3 border border-border-separator">
                    <div className="text-[10px] text-foreground-faint mb-1.5" style={{ fontVariant: "small-caps" }}>
                      {item.label}
                    </div>
                    <div className="text-sm text-foreground">{item.copy}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ========== 3. COLOR PALETTE ========== */}
        <section>
          <SectionHeading>3. Color Palette</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colorGroups.map((group) => (
              <Card key={group.label}>
                <Label>{group.label}</Label>
                <div className="mt-2 space-y-0.5">
                  {group.tokens.map((token) => (
                    <button
                      key={token.name}
                      type="button"
                      className="w-full text-left hover:bg-surface-hover rounded-xs transition px-1 -mx-1"
                      onClick={() => copyToClipboard(token.name)}
                    >
                      <ColorSwatch token={token} />
                      {copiedToken === token.name && (
                        <span className="text-[9px] text-success ml-13" style={{ fontVariant: "small-caps" }}>
                          copied
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <Label>accessibility notes</Label>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-background rounded-xs p-4 border border-border-separator">
                <div className="text-foreground-emphasis text-lg mb-1">Aa</div>
                <div className="text-foreground-muted text-xs">
                  <span className="text-foreground">#e8f0ff</span> on <span className="text-foreground">#1a2744</span>
                </div>
                <div className="text-success text-[10px] mt-1" style={{ fontVariant: "small-caps" }}>
                  aaa — 11.2:1
                </div>
              </div>
              <div className="bg-background rounded-xs p-4 border border-border-separator">
                <div className="text-foreground-muted text-lg mb-1">Aa</div>
                <div className="text-foreground-muted text-xs">
                  <span className="text-foreground">muted text</span> on <span className="text-foreground">#1a2744</span>
                </div>
                <div className="text-success text-[10px] mt-1" style={{ fontVariant: "small-caps" }}>
                  aa — 6.7:1
                </div>
              </div>
              <div className="bg-background rounded-xs p-4 border border-border-separator">
                <div className="text-line text-lg mb-1">Aa</div>
                <div className="text-foreground-muted text-xs">
                  <span className="text-foreground">#4a7ab5</span> on <span className="text-foreground">#1a2744</span>
                </div>
                <div className="text-warning text-[10px] mt-1" style={{ fontVariant: "small-caps" }}>
                  aa — 4.1:1
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ========== 4. TYPOGRAPHY ========== */}
        <section>
          <SectionHeading>4. Typography</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type ramp */}
            <Card>
              <Label>type ramp</Label>
              <div className="mt-4 space-y-3">
                {typeSizes.map((size) => (
                  <div key={size.label} className="flex items-baseline gap-4">
                    <span className="w-12 text-[10px] font-mono text-foreground-faint shrink-0">
                      {size.label}
                    </span>
                    <span className="w-10 text-[10px] font-mono text-foreground-faint shrink-0">
                      {size.px}
                    </span>
                    <span className={`${size.class} text-foreground truncate`}>
                      SweeneySnap Brand Kit
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tracking */}
            <Card>
              <Label>letter-spacing scale</Label>
              <div className="mt-4 space-y-4">
                {trackingScale.map((t) => (
                  <div key={t.label}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-mono text-foreground-faint w-16">
                        {t.label}
                      </span>
                      <span className="text-[10px] font-mono text-foreground-muted">
                        {t.value}
                      </span>
                      <span className="text-[10px] font-mono text-line">
                        {t.tw}
                      </span>
                    </div>
                    <div className={`text-lg text-foreground ${t.tw}`}>
                      Capture the moment. Share the wall.
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Small-caps label demo */}
            <Card>
              <Label>small-caps label style</Label>
              <p className="text-sm text-foreground-muted mt-2 mb-4">
                The Blueprint signature — used for form labels, section subtitles, and meta info.
              </p>
              <div className="space-y-3">
                <div className="bg-background rounded-xs p-3 border border-border-separator">
                  <span className="text-label-caps">event name</span>
                </div>
                <div className="bg-background rounded-xs p-3 border border-border-separator">
                  <span className="text-label-caps">display configuration</span>
                </div>
                <div className="bg-background rounded-xs p-3 border border-border-separator">
                  <span className="text-label-caps">upload settings</span>
                </div>
              </div>
              <div className="mt-4 text-[10px] font-mono text-foreground-faint">
                CSS class: <span className="text-line">.text-label-caps</span><br />
                font-variant: small-caps + tracking: 0.05em + 11px + var(--label-color)
              </div>
            </Card>

            {/* Font specimens */}
            <Card>
              <Label>font specimens</Label>
              <div className="mt-4 space-y-6">
                <div>
                  <div className="text-[10px] text-foreground-faint font-mono mb-2">
                    Geist Sans — <span className="text-line">var(--font-sans)</span>
                  </div>
                  <div className="space-y-1 text-foreground">
                    <div className="font-light">Light — The quick brown fox jumps</div>
                    <div className="font-normal">Regular — The quick brown fox jumps</div>
                    <div className="font-medium">Medium — The quick brown fox jumps</div>
                    <div className="font-semibold">Semibold — The quick brown fox jumps</div>
                    <div className="font-bold">Bold — The quick brown fox jumps</div>
                  </div>
                </div>
                <div className="border-t border-border-separator pt-4">
                  <div className="text-[10px] text-foreground-faint font-mono mb-2">
                    Geist Mono — <span className="text-line">var(--font-mono)</span>
                  </div>
                  <div className="space-y-1 font-mono text-foreground">
                    <div className="font-light">Light — 0123456789 ABCDEF</div>
                    <div className="font-normal">Regular — 0123456789 ABCDEF</div>
                    <div className="font-medium">Medium — 0123456789 ABCDEF</div>
                    <div className="font-bold">Bold — 0123456789 ABCDEF</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ========== 5. SPACING & LAYOUT ========== */}
        <section>
          <SectionHeading>5. Spacing &amp; Layout</SectionHeading>
          <Card>
            <Label>spacing scale</Label>
            <div className="mt-4 space-y-2">
              {spacingScale.map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="w-8 text-[10px] font-mono text-foreground-faint text-right">
                    {s.label}
                  </span>
                  <span className="w-12 text-[10px] font-mono text-foreground-muted">
                    {s.px}
                  </span>
                  <div
                    className="h-3 bg-primary/40 rounded-xs border border-primary/60"
                    style={{ width: s.px }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background rounded-xs p-3 border border-border-separator">
                <div className="text-[10px] text-foreground-faint mb-1" style={{ fontVariant: "small-caps" }}>
                  card padding
                </div>
                <div className="text-sm font-mono text-foreground">p-5 / p-6 (20-24px)</div>
              </div>
              <div className="bg-background rounded-xs p-3 border border-border-separator">
                <div className="text-[10px] text-foreground-faint mb-1" style={{ fontVariant: "small-caps" }}>
                  section gap
                </div>
                <div className="text-sm font-mono text-foreground">gap-4 / gap-6 (16-24px)</div>
              </div>
              <div className="bg-background rounded-xs p-3 border border-border-separator">
                <div className="text-[10px] text-foreground-faint mb-1" style={{ fontVariant: "small-caps" }}>
                  grid system
                </div>
                <div className="text-sm font-mono text-foreground">Desktop-first, wide cards</div>
              </div>
            </div>
          </Card>
        </section>

        {/* ========== 6. BORDERS & RADII ========== */}
        <section>
          <SectionHeading>6. Borders &amp; Radii</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Label>radius scale</Label>
              <div className="mt-4 flex flex-wrap items-end gap-6">
                {radiusScale.map((r) => (
                  <div key={r.label} className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 bg-primary/20 border-2 border-primary"
                      style={{ borderRadius: r.value }}
                    />
                    <div className="text-[10px] font-mono text-foreground-muted">{r.tw}</div>
                    <div className="text-[10px] font-mono text-foreground-faint">{r.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-background rounded-xs p-3 border border-border-separator">
                <div className="text-[10px] text-foreground-faint mb-1" style={{ fontVariant: "small-caps" }}>
                  default radius
                </div>
                <div className="text-sm text-foreground">
                  <span className="font-mono text-line">rounded-xs</span> (2px) — the Blueprint micro-radius signature
                </div>
              </div>
            </Card>

            <Card>
              <Label>border conventions</Label>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 bg-background border border-border rounded-xs" />
                  <div>
                    <div className="text-sm text-foreground">Default border</div>
                    <div className="text-[10px] font-mono text-foreground-muted">1px, 30% opacity</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 bg-background border-2 border-border-strong rounded-xs" />
                  <div>
                    <div className="text-sm text-foreground">Strong border</div>
                    <div className="text-[10px] font-mono text-foreground-muted">2px, 50% opacity</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 bg-background border border-border-separator rounded-xs" />
                  <div>
                    <div className="text-sm text-foreground">Separator</div>
                    <div className="text-[10px] font-mono text-foreground-muted">1px, 20% opacity</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 bg-background border-2 border-border-focus rounded-xs" />
                  <div>
                    <div className="text-sm text-foreground">Focus ring</div>
                    <div className="text-[10px] font-mono text-foreground-muted">2px, white, focus state</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ========== 7. COMPONENT PREVIEWS ========== */}
        <section>
          <SectionHeading>7. Component Previews</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Buttons */}
            <Card>
              <Label>buttons</Label>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="bg-primary text-primary-foreground rounded-xs px-4 py-2 text-sm font-medium hover:bg-primary-hover transition"
                  >
                    Go Live
                  </button>
                  <button
                    type="button"
                    className="bg-secondary text-secondary-foreground rounded-xs px-4 py-2 text-sm font-medium hover:bg-secondary-hover transition border border-border"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="bg-destructive text-destructive-foreground rounded-xs px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                  >
                    Delete Event
                  </button>
                  <button
                    type="button"
                    className="text-foreground-muted rounded-xs px-4 py-2 text-sm hover:text-foreground hover:bg-secondary transition"
                  >
                    Cancel
                  </button>
                </div>
                <div className="text-[10px] font-mono text-foreground-faint space-y-1">
                  <div>Primary: <span className="text-line">bg-primary text-primary-foreground rounded-xs</span></div>
                  <div>Secondary: <span className="text-line">bg-secondary border-border rounded-xs</span></div>
                  <div>Danger: <span className="text-line">bg-destructive text-destructive-foreground rounded-xs</span></div>
                  <div>Ghost: <span className="text-line">text-foreground-muted hover:bg-secondary rounded-xs</span></div>
                </div>
              </div>
            </Card>

            {/* Status badges */}
            <Card>
              <Label>status badges</Label>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Live
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  Pending
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground-muted/10 text-foreground-muted text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted" />
                  Archived
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Error
                </span>
              </div>
            </Card>

            {/* Card with form fields */}
            <Card>
              <Label>section card with form fields</Label>
              <div className="mt-4 bg-card-bg border border-card-border rounded-xs p-5">
                <h3
                  className="text-sm text-foreground-emphasis mb-4 pb-2 border-b border-border-separator tracking-heading"
                  style={{ fontVariant: "small-caps" }}
                >
                  upload config
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-label-caps block mb-1">welcome text</label>
                    <textarea
                      readOnly
                      value="Share your best moments! Snap a photo and add it to the wall."
                      rows={2}
                      className="w-full bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-sm text-input-text resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-label-caps block mb-1">button text</label>
                    <input
                      type="text"
                      readOnly
                      value="Upload Snap"
                      className="w-full bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-sm text-input-text"
                    />
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <label className="text-label-caps block mb-1">require name</label>
                      <div className="w-6 h-6 rounded-xs border border-border-focus bg-foreground-emphasis/10 flex items-center justify-center text-sm font-mono text-foreground-emphasis">
                        +
                      </div>
                    </div>
                    <div>
                      <label className="text-label-caps block mb-1">max file size</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          readOnly
                          value={10}
                          className="w-20 bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-sm text-input-text"
                        />
                        <span className="text-[10px] text-foreground-faint" style={{ fontVariant: "small-caps" }}>
                          mb
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Inputs showcase */}
            <Card>
              <Label>input types</Label>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-label-caps block mb-1">text input</label>
                  <input
                    type="text"
                    readOnly
                    value="Annual Company Gala"
                    className="w-full bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-sm text-input-text focus:outline-none focus:border-border-focus transition"
                  />
                </div>
                <div>
                  <label className="text-label-caps block mb-1">select input</label>
                  <select
                    className="w-full bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-sm text-input-text appearance-none"
                    defaultValue="fade"
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="zoom">Zoom</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-caps block mb-1">date input</label>
                  <input
                    type="datetime-local"
                    readOnly
                    value="2026-03-15T18:00"
                    className="w-full bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-sm text-input-text [color-scheme:dark]"
                  />
                </div>
              </div>
            </Card>

            {/* Toggles */}
            <Card>
              <Label>crosshair toggles</Label>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xs border border-border-focus bg-foreground-emphasis/10 flex items-center justify-center text-sm font-mono text-foreground-emphasis">
                    +
                  </div>
                  <span className="text-sm text-foreground">Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xs border border-border-focus bg-foreground-emphasis/10 flex items-center justify-center text-sm font-mono text-foreground-emphasis">
                    +
                  </div>
                  <span className="text-sm text-foreground">Moderation Enabled</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xs border border-input-border bg-transparent flex items-center justify-center text-sm font-mono text-foreground-faint">
                    +
                  </div>
                  <span className="text-sm text-foreground-muted">Disabled State</span>
                </div>
              </div>
            </Card>

            {/* Color picker */}
            <Card>
              <Label>color picker</Label>
              <div className="mt-4 flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xs border border-input-border bg-[#ff6b4a]" />
                  <div className="absolute -top-1.5 left-0 right-0 h-[1px] bg-line-faint" />
                  <div className="absolute -bottom-1.5 left-0 right-0 h-[1px] bg-line-faint" />
                  <div className="absolute -left-1.5 top-0 bottom-0 w-[1px] bg-line-faint" />
                  <div className="absolute -right-1.5 top-0 bottom-0 w-[1px] bg-line-faint" />
                </div>
                <input
                  type="text"
                  readOnly
                  value="#ff6b4a"
                  className="w-24 bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-2 py-1.5 text-xs font-mono text-input-text"
                />
                <span className="text-[10px] text-foreground-faint" style={{ fontVariant: "small-caps" }}>
                  dimension lines indicate measurement
                </span>
              </div>
            </Card>

            {/* Copy link field */}
            <Card>
              <Label>copy link field</Label>
              <div className="mt-4">
                <CopyLinkDemo />
              </div>
            </Card>
          </div>
        </section>

        {/* ========== 8. FROSTED GLASS & OVERLAYS ========== */}
        <section>
          <SectionHeading>8. Frosted Glass &amp; Overlays</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {frostedGlassPatterns.map((pattern) => (
              <Card key={pattern.label}>
                <Label>{pattern.label}</Label>
                <p className="text-sm text-foreground-muted mt-2 mb-4">{pattern.description}</p>

                {/* Visual demo */}
                <div className="relative h-40 rounded-xs border border-border-separator overflow-hidden bg-background">
                  {/* Background shapes to show blur effect */}
                  <div className="absolute top-3 left-4 w-14 h-14 rounded-full bg-primary/60" />
                  <div className="absolute top-8 left-12 w-20 h-10 rounded-xs bg-success/40" />
                  <div className="absolute bottom-4 right-4 w-16 h-16 rounded-xs bg-destructive/40 rotate-12" />
                  <div className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-warning/50" />

                  {/* Frosted layer */}
                  {pattern.position === "top" && (
                    <div className={`absolute inset-x-0 top-0 h-12 ${pattern.classes} border-b border-border`}>
                      <div className="px-3 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-foreground-muted" />
                        <div className="h-2 w-20 rounded-full bg-foreground-faint" />
                      </div>
                    </div>
                  )}
                  {pattern.position === "middle" && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2">
                      <div className={`${pattern.classes} border border-input-border rounded-xs px-3 py-2`}>
                        <div className="h-2 w-24 rounded-full bg-foreground-faint" />
                      </div>
                    </div>
                  )}
                  {pattern.position === "full" && (
                    <div className={`absolute inset-0 ${pattern.classes} flex items-center justify-center`}>
                      <div className="bg-card-bg border border-card-border rounded-xs p-4 w-3/4">
                        <div className="h-2 w-16 rounded-full bg-foreground-muted mb-2" />
                        <div className="h-2 w-full rounded-full bg-foreground-faint" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-[10px] font-mono text-foreground-faint">
                  Classes: <span className="text-line">{pattern.classes}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ========== 9. MOTION & ANIMATION ========== */}
        <section>
          <SectionHeading>9. Motion &amp; Animation</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Duration tokens */}
            <Card>
              <Label>duration tokens</Label>
              <div className="mt-4 space-y-4">
                {durationTokens.map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono text-foreground w-14">{d.label}</span>
                      <span className="text-xs font-mono text-foreground-muted w-12">{d.value}</span>
                      <span className="text-[10px] font-mono text-line">{d.tw}</span>
                    </div>
                    <div className="h-2.5 bg-background rounded-full border border-border-separator overflow-hidden">
                      <div
                        className="h-full bg-primary/50 rounded-full"
                        style={{ width: d.label === "fast" ? "25%" : d.label === "normal" ? "42%" : "100%" }}
                      />
                    </div>
                    <div className="text-[10px] text-foreground-faint mt-1">{d.use}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[10px] font-mono text-foreground-faint">
                Token: <span className="text-line">var(--duration-fast)</span> / <span className="text-line">var(--duration-normal)</span> / <span className="text-line">var(--duration-slow)</span>
              </div>
            </Card>

            {/* Standard entry animation */}
            <Card>
              <div className="flex items-center justify-between mb-1">
                <Label>standard entry animation</Label>
                <button
                  type="button"
                  onClick={() => setMotionKey((k) => k + 1)}
                  className="text-[10px] text-line hover:text-foreground-emphasis transition border border-border rounded-xs px-2 py-0.5"
                  style={{ fontVariant: "small-caps" }}
                >
                  replay
                </button>
              </div>
              <p className="text-sm text-foreground-muted mt-2 mb-4">
                Canonical fade-scale pattern: opacity 0&rarr;1, scale 0.95&rarr;1.
              </p>

              {/* Three demo boxes at different speeds */}
              <div className="flex gap-4 mb-4">
                {durationTokens.map((d, i) => (
                  <div key={`${d.label}-${motionKey}`} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full h-16 rounded-xs bg-primary/20 border border-primary/40"
                      style={{
                        animation: `brandkitFadeScale ${d.value} ease-in-out ${i * 200}ms both`,
                      }}
                    />
                    <span className="text-[10px] font-mono text-foreground-faint">{d.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-background rounded-xs p-3 border border-border-separator">
                <div className="text-[10px] text-foreground-faint mb-1" style={{ fontVariant: "small-caps" }}>
                  motion/react snippet
                </div>
                <pre className="text-[10px] font-mono text-line leading-relaxed overflow-x-auto">
{`<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.6,
    ease: "easeInOut",
  }}
/>`}
                </pre>
              </div>
            </Card>

            {/* Interaction speeds — full width */}
            <Card className="lg:col-span-2">
              <Label>interaction speeds</Label>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hover — fast */}
                <div className="bg-background rounded-xs p-4 border border-border-separator">
                  <div className="text-[10px] text-foreground-faint mb-3" style={{ fontVariant: "small-caps" }}>
                    hover &mdash; fast (150ms)
                  </div>
                  <button
                    type="button"
                    className="w-full bg-primary text-primary-foreground rounded-xs px-4 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors"
                    style={{ transitionDuration: "150ms" }}
                  >
                    Hover me
                  </button>
                  <div className="text-[10px] font-mono text-foreground-faint mt-2">
                    <span className="text-line">transition-colors duration-fast</span>
                  </div>
                </div>

                {/* Panel — normal */}
                <div className="bg-background rounded-xs p-4 border border-border-separator">
                  <div className="text-[10px] text-foreground-faint mb-3" style={{ fontVariant: "small-caps" }}>
                    panel &mdash; normal (250ms)
                  </div>
                  <div className="group">
                    <div
                      className="w-full bg-surface rounded-xs px-4 py-2.5 text-sm text-foreground border border-card-border cursor-pointer hover:bg-surface-hover hover:border-border-strong transition-all"
                      style={{ transitionDuration: "250ms" }}
                    >
                      Hover to expand
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-foreground-faint mt-2">
                    <span className="text-line">transition-all duration-normal</span>
                  </div>
                </div>

                {/* Page entry — slow */}
                <div className="bg-background rounded-xs p-4 border border-border-separator">
                  <div className="text-[10px] text-foreground-faint mb-3" style={{ fontVariant: "small-caps" }}>
                    page entry &mdash; slow (600ms)
                  </div>
                  <div
                    key={`page-entry-${motionKey}`}
                    className="w-full bg-surface rounded-xs px-4 py-2.5 text-sm text-foreground border border-card-border"
                    style={{
                      animation: "brandkitFadeScale 600ms ease-in-out both",
                    }}
                  >
                    Fade + scale in
                  </div>
                  <div className="text-[10px] font-mono text-foreground-faint mt-2">
                    <span className="text-line">transition-all duration-slow</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ========== 10. LOADING STATES ========== */}
        <section>
          <SectionHeading>10. Loading States</SectionHeading>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Spinner component */}
            <Card>
              <Label>spinner component</Label>
              <p className="text-sm text-foreground-muted mt-2 mb-4">
                Animated SVG spinner in three sizes.
              </p>
              <div className="flex items-end gap-6 mb-4">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-[10px] font-mono text-foreground-faint">sm — 16px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-[10px] font-mono text-foreground-faint">md — 32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-[10px] font-mono text-foreground-faint">lg — 48px</span>
                </div>
              </div>
              <div className="bg-background rounded-xs p-3 border border-border-separator">
                <pre className="text-[10px] font-mono text-line leading-relaxed">
{`import { Spinner } from
  "@/components/ui/Spinner";

<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`}
                </pre>
              </div>
            </Card>

            {/* Button loading state */}
            <Card>
              <Label>button loading states</Label>
              <p className="text-sm text-foreground-muted mt-2 mb-4">
                Inline spinner with disabled state for async actions.
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xs px-4 py-2.5 text-sm font-medium opacity-70 cursor-not-allowed"
                >
                  <Spinner size="sm" />
                  Uploading…
                </button>
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xs px-4 py-2.5 text-sm font-medium border border-border opacity-70 cursor-not-allowed"
                >
                  <Spinner size="sm" />
                  Saving…
                </button>
              </div>
              <div className="mt-3 text-[10px] font-mono text-foreground-faint">
                Pattern: <span className="text-line">{`<Spinner size="sm" />`}</span> + <span className="text-line">disabled opacity-70</span>
              </div>
            </Card>

            {/* Skeleton placeholders */}
            <Card>
              <Label>skeleton placeholders</Label>
              <p className="text-sm text-foreground-muted mt-2 mb-4">
                Pulsing placeholder blocks for content loading.
              </p>
              <div className="space-y-4">
                {/* Card skeleton */}
                <div className="bg-background rounded-xs p-4 border border-border-separator">
                  <div className="text-[10px] text-foreground-faint mb-2" style={{ fontVariant: "small-caps" }}>
                    card skeleton
                  </div>
                  <div className="space-y-3 animate-pulse">
                    <div className="h-24 bg-surface rounded-xs" />
                    <div className="h-3 bg-surface rounded-full w-3/4" />
                    <div className="h-3 bg-surface rounded-full w-1/2" />
                  </div>
                </div>

                {/* Text skeleton */}
                <div className="bg-background rounded-xs p-4 border border-border-separator">
                  <div className="text-[10px] text-foreground-faint mb-2" style={{ fontVariant: "small-caps" }}>
                    text skeleton
                  </div>
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-surface rounded-full" />
                    <div className="h-3 bg-surface rounded-full w-5/6" />
                    <div className="h-3 bg-surface rounded-full w-2/3" />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] font-mono text-foreground-faint">
                Class: <span className="text-line">animate-pulse</span> + <span className="text-line">bg-surface rounded-xs</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-border-separator pt-6 pb-10 text-center">
          <div className="text-[10px] text-foreground-faint" style={{ fontVariant: "small-caps" }}>
            sweeneysnap brand kit &mdash; rev b &mdash; 2026-02-20
          </div>
          <div className="text-[10px] text-foreground-faint mt-1">
            Sweeney &amp; Sons
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------- Copy Link Demo ---------------

function CopyLinkDemo() {
  const [copied, setCopied] = useState(false);
  const url = "https://sweeneysnap.com/upload/annual-gala-2026";
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={url}
        readOnly
        className="flex-1 bg-input-bg backdrop-blur-md border border-input-border rounded-xs px-3 py-2 text-xs font-mono text-line"
      />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="border border-input-border rounded-xs px-3 py-2 text-[10px] text-foreground-emphasis hover:bg-secondary transition"
        style={{ fontVariant: "small-caps" }}
      >
        {copied ? "done" : "copy"}
      </button>
    </div>
  );
}
