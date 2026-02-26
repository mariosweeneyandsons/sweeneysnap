"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/components/ui/Toast";
import { ExportSelfiesButton } from "@/components/admin/ExportSelfiesButton";
import { EventDetailSkeleton } from "@/components/admin/skeletons/EventDetailSkeleton";
import { WebhookManager } from "@/components/admin/WebhookManager";
import {
  Field,
  TextInput,
  TextArea,
  NumberInput,
  SelectInput,
  CrosshairToggle,
  ColorInput,
  CopyLink,
  SectionCard,
  SaveButton,
  DateInput,
  SectionNav,
} from "@/components/blueprint/BlueprintForm";

const sections = [
  { id: "event", label: "Event" },
  { id: "upload", label: "Upload" },
  { id: "display", label: "Display" },
  { id: "branding", label: "Branding" },
  { id: "links", label: "Links" },
];

function toLocalDatetime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetime(s: string): number | undefined {
  if (!s) return undefined;
  return new Date(s).getTime();
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const event = useQuery(api.events.getById, {
    id: eventId as Id<"events">,
  });
  const selfieCount = useQuery(
    api.selfies.countByEvent,
    event ? { eventId: event._id } : "skip"
  );

  const updateEvent = useMutation(api.events.update);
  const updateDisplayConfig = useMutation(api.events.updateDisplayConfig);
  const updateUploadConfig = useMutation(api.events.updateUploadConfig);
  const duplicateEvent = useMutation(api.events.duplicate);
  const archiveEvent = useMutation(api.events.archive);
  const removeAllSelfies = useMutation(api.selfies.removeAllByEvent);

  // -- UI state --
  const [activeSection, setActiveSection] = useState("event");
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<number | null>(null);
  const [dangerOpen, setDangerOpen] = useState(false);

  // -- Core fields --
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [moderationEnabled, setModerationEnabled] = useState(false);
  const [aiModerationEnabled, setAiModerationEnabled] = useState(false);

  // -- Branding --
  const [primaryColor, setPrimaryColor] = useState("#4a7ab5");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [customCss, setCustomCss] = useState("");

  // -- Upload config --
  const [welcomeText, setWelcomeText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [requireName, setRequireName] = useState(false);
  const [requireMessage, setRequireMessage] = useState(false);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(10);
  const [allowGallery, setAllowGallery] = useState(true);
  const [maxUploadsPerSession, setMaxUploadsPerSession] = useState(5);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [multiPhotoEnabled, setMultiPhotoEnabled] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [allowCameraSwitch, setAllowCameraSwitch] = useState(true);
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [framesEnabled, setFramesEnabled] = useState(false);
  const [stickersEnabled, setStickersEnabled] = useState(false);

  // -- Display config --
  const [layoutMode, setLayoutMode] = useState("grid");
  const [gridColumns, setGridColumns] = useState(4);
  const [swapInterval, setSwapInterval] = useState(5);
  const [transition, setTransition] = useState("fade");
  const [backgroundColor, setBackgroundColor] = useState("#1a2744");
  const [animatedBackground, setAnimatedBackground] = useState("none");
  const [showNames, setShowNames] = useState(true);
  const [showMessages, setShowMessages] = useState(true);

  // -- Effects & Sound --
  const [spotlightEnabled, setSpotlightEnabled] = useState(false);
  const [spotlightInterval, setSpotlightInterval] = useState(30);
  const [spotlightDuration, setSpotlightDuration] = useState(5);
  const [tickerEnabled, setTickerEnabled] = useState(false);
  const [tickerText, setTickerText] = useState("");
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [socialOverlay, setSocialOverlay] = useState("");
  const [newSelfieSound, setNewSelfieSound] = useState("none");
  const [celebrationEffect, setCelebrationEffect] = useState("none");

  // -- Hydrate form from event data --
  useEffect(() => {
    if (!event) return;
    setName(event.name);
    setSlug(event.slug);
    setDescription(event.description ?? "");
    setStartDate(toLocalDatetime(event.startsAt));
    setEndDate(toLocalDatetime(event.endsAt));
    setIsActive(event.isActive);
    setModerationEnabled(event.moderationEnabled);
    setAiModerationEnabled(event.aiModerationEnabled ?? false);

    setPrimaryColor(event.primaryColor);
    setFontFamily(event.fontFamily ?? "Inter");
    setCustomCss(event.customCss ?? "");

    const uc = event.uploadConfig;
    setWelcomeText(uc.welcomeText ?? "");
    setButtonText(uc.buttonText ?? "");
    setSuccessText(uc.successText ?? "");
    setRequireName(uc.requireName ?? false);
    setRequireMessage(uc.requireMessage ?? false);
    setMaxFileSizeMb(uc.maxFileSizeMb ?? 10);
    setAllowGallery(uc.allowGallery ?? true);
    setMaxUploadsPerSession(uc.maxUploadsPerSession ?? 5);
    setCountdownSeconds(uc.countdownSeconds ?? 3);
    setMultiPhotoEnabled(uc.multiPhotoEnabled ?? false);
    setFlashEnabled(uc.flashEnabled ?? true);
    setAllowCameraSwitch(uc.allowCameraSwitch ?? true);
    setFiltersEnabled(uc.filtersEnabled ?? false);
    setFramesEnabled(uc.framesEnabled ?? false);
    setStickersEnabled(uc.stickersEnabled ?? false);

    const dc = event.displayConfig;
    setLayoutMode(dc.layoutMode ?? "grid");
    setGridColumns(dc.gridColumns ?? 4);
    setSwapInterval(dc.swapInterval ?? 5);
    setTransition(dc.transition ?? "fade");
    setBackgroundColor(dc.backgroundColor ?? "#1a2744");
    setAnimatedBackground(dc.animatedBackground ?? "none");
    setShowNames(dc.showNames ?? true);
    setShowMessages(dc.showMessages ?? true);
    setSpotlightEnabled(dc.spotlightEnabled ?? false);
    setSpotlightInterval(dc.spotlightInterval ?? 30);
    setSpotlightDuration(dc.spotlightDuration ?? 5);
    setTickerEnabled(dc.tickerEnabled ?? false);
    setTickerText(dc.tickerText ?? "");
    setCountdownEnabled(dc.countdownEnabled ?? false);
    setSocialOverlay(dc.socialOverlay ?? "");
    setNewSelfieSound(dc.newSelfieSound ?? "none");
    setCelebrationEffect(dc.celebrationEffect ?? "none");
  }, [event]);

  const scrollTo = useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // -- Save --
  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      const uploadConfig = {
        welcomeText: welcomeText || undefined,
        buttonText: buttonText || undefined,
        successText: successText || undefined,
        requireName,
        requireMessage,
        maxFileSizeMb,
        allowGallery,
        maxUploadsPerSession,
        countdownSeconds,
        multiPhotoEnabled,
        flashEnabled,
        allowCameraSwitch,
        filtersEnabled,
        framesEnabled,
        stickersEnabled,
      };

      const displayConfig = {
        layoutMode: layoutMode as "grid" | "slideshow" | "mosaic",
        gridColumns,
        swapInterval,
        transition: transition as "fade" | "slide" | "zoom",
        backgroundColor,
        animatedBackground: animatedBackground as "none" | "gradient",
        showNames,
        showMessages,
        spotlightEnabled,
        spotlightInterval,
        spotlightDuration,
        tickerEnabled,
        tickerText: tickerText || undefined,
        countdownEnabled,
        socialOverlay: socialOverlay || undefined,
        newSelfieSound: newSelfieSound as "none" | "chime" | "shutter",
        celebrationEffect: celebrationEffect as
          | "none"
          | "confetti"
          | "ripple"
          | "glow",
      };

      await Promise.all([
        updateEvent({
          id: event._id,
          slug,
          name,
          description: description || undefined,
          isActive,
          presetId: event.presetId,
          uploadConfig,
          displayConfig,
          logoUrl: event.logoUrl,
          primaryColor,
          fontFamily: fontFamily || undefined,
          customCss: customCss || undefined,
          moderationEnabled,
          aiModerationEnabled,
          startsAt: fromLocalDatetime(startDate),
          endsAt: fromLocalDatetime(endDate),
        }),
        updateDisplayConfig({ id: event._id, displayConfig }),
        updateUploadConfig({ id: event._id, uploadConfig }),
      ]);
      toast("Specification saved", "success");
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Failed to save",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // -- Actions --
  const handleDuplicate = async () => {
    if (!event) return;
    setDuplicating(true);
    try {
      const newId = await duplicateEvent({ id: event._id });
      router.push(`/admin/events/${newId}`);
    } finally {
      setDuplicating(false);
    }
  };

  const handleArchive = async () => {
    if (!event) return;
    setArchiving(true);
    try {
      const result = await archiveEvent({ id: event._id });
      if (result.archived) {
        router.push("/admin");
      }
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteAllSelfies = async () => {
    if (!event) return;
    if (
      !confirm(
        "Are you sure you want to delete ALL selfies for this event? This cannot be undone."
      )
    )
      return;
    if (
      !confirm(
        "This will permanently delete all photos and data. Type OK to confirm."
      )
    )
      return;

    setDeleting(true);
    setDeleteProgress(0);
    let totalDeleted = 0;
    try {
      let hasMore = true;
      while (hasMore) {
        const result = await removeAllSelfies({ eventId: event._id });
        totalDeleted += result.deleted;
        setDeleteProgress(totalDeleted);
        hasMore = result.hasMore;
      }
      toast(`Deleted ${totalDeleted} selfies`, "success");
    } finally {
      setDeleting(false);
      setDeleteProgress(null);
    }
  };

  // -- Loading --
  if (event === undefined) return <EventDetailSkeleton />;
  if (!event)
    return (
      <div className="text-center py-12 text-foreground-muted">
        Event not found
      </div>
    );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const uploadUrl = `${siteUrl}/${event.slug}`;
  const displayUrl = `${siteUrl}/display/${event.slug}`;
  const crewUrl = `${siteUrl}/crew/${event.crewToken}`;

  return (
    <div className="bp-grid -mx-6 -mt-4 px-6 pt-4 min-h-screen">
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b-2 border-border -mx-6 px-6">
        <div className="max-w-6xl mx-auto py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/events"
              className="text-label-caps opacity-60 hover:text-foreground-emphasis transition"
            >
              &larr; events
            </Link>
            <div className="border border-card-border rounded-xs px-4 py-1.5 flex items-center gap-6">
              <div>
                <div className="text-label-caps opacity-50 !text-[9px]">
                  event
                </div>
                <div
                  className="text-xs text-foreground-emphasis"
                  style={{ fontVariant: "small-caps" }}
                >
                  {event.name}
                </div>
              </div>
              <div className="w-px h-6 bg-border-separator" />
              <div>
                <div className="text-label-caps opacity-50 !text-[9px]">
                  slug
                </div>
                <div className="text-xs text-foreground-emphasis font-mono">
                  /{event.slug}
                </div>
              </div>
              <div className="w-px h-6 bg-border-separator" />
              <div>
                <div className="text-label-caps opacity-50 !text-[9px]">
                  selfies
                </div>
                <div className="text-xs text-foreground-emphasis font-mono">
                  {selfieCount ?? 0}
                </div>
              </div>
              {event.archived && (
                <>
                  <div className="w-px h-6 bg-border-separator" />
                  <div className="text-xs text-destructive font-mono">
                    archived
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(event.archived || (event.endsAt && event.endsAt < Date.now())) && (
              <Link
                href={`/admin/events/${event._id}/summary`}
                className="border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition"
              >
                summary
              </Link>
            )}
            <Link
              href={`/admin/events/${event._id}/analytics`}
              className="border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition"
            >
              analytics
            </Link>
            <Link
              href={`/admin/events/${event._id}/moderate`}
              className="border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition"
            >
              moderate ({selfieCount ?? 0})
            </Link>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={duplicating}
              className="border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition disabled:opacity-50"
            >
              {duplicating ? "..." : "duplicate"}
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={archiving}
              className="border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition disabled:opacity-50"
            >
              {archiving
                ? "..."
                : event.archived
                  ? "unarchive"
                  : "archive"}
            </button>
          </div>
        </div>

        {/* Section nav */}
        <div className="max-w-6xl mx-auto py-2 border-t border-border-separator">
          <SectionNav
            sections={sections}
            activeSection={activeSection}
            onNavigate={scrollTo}
          />
        </div>
      </div>

      {/* Content — 3-column grid */}
      <div className="max-w-6xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: Event Basics + Branding */}
          <div>
            <SectionCard title="Event Basics" id="event" delay={0}>
              <Field label="event name">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field label="slug">
                <TextInput value={slug} onChange={setSlug} />
              </Field>
              <Field label="description">
                <TextArea
                  value={description}
                  onChange={setDescription}
                />
              </Field>
              <Field label="start date">
                <DateInput value={startDate} onChange={setStartDate} />
              </Field>
              <Field label="end date">
                <DateInput value={endDate} onChange={setEndDate} />
              </Field>
              <div className="flex gap-6">
                <Field label="active">
                  <CrosshairToggle
                    checked={isActive}
                    onChange={setIsActive}
                  />
                </Field>
                <Field label="moderation">
                  <CrosshairToggle
                    checked={moderationEnabled}
                    onChange={setModerationEnabled}
                  />
                </Field>
                <Field label="ai moderation">
                  <CrosshairToggle
                    checked={aiModerationEnabled}
                    onChange={setAiModerationEnabled}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Branding" id="branding" delay={0.1}>
              <Field label="primary color">
                <ColorInput
                  value={primaryColor}
                  onChange={setPrimaryColor}
                />
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
              <Field label="custom css">
                <TextArea
                  value={customCss}
                  onChange={setCustomCss}
                  rows={4}
                  placeholder="/* custom overrides */"
                />
              </Field>
            </SectionCard>
          </div>

          {/* Column 2: Upload Config + Camera & Editor */}
          <div>
            <SectionCard title="Upload Config" id="upload" delay={0.15}>
              <Field label="welcome text">
                <TextArea
                  value={welcomeText}
                  onChange={setWelcomeText}
                />
              </Field>
              <Field label="button text">
                <TextInput
                  value={buttonText}
                  onChange={setButtonText}
                />
              </Field>
              <Field label="success text">
                <TextArea
                  value={successText}
                  onChange={setSuccessText}
                />
              </Field>
              <div className="flex gap-6">
                <Field label="require name">
                  <CrosshairToggle
                    checked={requireName}
                    onChange={setRequireName}
                  />
                </Field>
                <Field label="require message">
                  <CrosshairToggle
                    checked={requireMessage}
                    onChange={setRequireMessage}
                  />
                </Field>
              </div>
              <Field label="max file size">
                <NumberInput
                  value={maxFileSizeMb}
                  onChange={setMaxFileSizeMb}
                  min={1}
                  max={50}
                  suffix="mb"
                />
              </Field>
              <Field label="allow gallery">
                <CrosshairToggle
                  checked={allowGallery}
                  onChange={setAllowGallery}
                />
              </Field>
            </SectionCard>

            <SectionCard
              title="Camera & Editor"
              id="camera"
              delay={0.2}
            >
              <Field label="max uploads per session">
                <NumberInput
                  value={maxUploadsPerSession}
                  onChange={setMaxUploadsPerSession}
                  min={1}
                  max={50}
                />
              </Field>
              <Field label="countdown seconds">
                <NumberInput
                  value={countdownSeconds}
                  onChange={setCountdownSeconds}
                  min={0}
                  max={10}
                  suffix="sec"
                />
              </Field>
              <div className="flex gap-6">
                <Field label="multi-photo">
                  <CrosshairToggle
                    checked={multiPhotoEnabled}
                    onChange={setMultiPhotoEnabled}
                  />
                </Field>
                <Field label="flash">
                  <CrosshairToggle
                    checked={flashEnabled}
                    onChange={setFlashEnabled}
                  />
                </Field>
                <Field label="camera switch">
                  <CrosshairToggle
                    checked={allowCameraSwitch}
                    onChange={setAllowCameraSwitch}
                  />
                </Field>
              </div>
              <div className="flex gap-6">
                <Field label="filters">
                  <CrosshairToggle
                    checked={filtersEnabled}
                    onChange={setFiltersEnabled}
                  />
                </Field>
                <Field label="frames">
                  <CrosshairToggle
                    checked={framesEnabled}
                    onChange={setFramesEnabled}
                  />
                </Field>
                <Field label="stickers">
                  <CrosshairToggle
                    checked={stickersEnabled}
                    onChange={setStickersEnabled}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* Column 3: Display Config + Effects + Quick Links */}
          <div>
            <SectionCard
              title="Display Config"
              id="display"
              delay={0.2}
            >
              <Field label="layout mode">
                <SelectInput
                  value={layoutMode}
                  onChange={setLayoutMode}
                  options={[
                    { value: "grid", label: "Grid" },
                    { value: "slideshow", label: "Slideshow" },
                    { value: "mosaic", label: "Mosaic" },
                  ]}
                />
              </Field>
              <Field label="grid columns">
                <NumberInput
                  value={gridColumns}
                  onChange={setGridColumns}
                  min={1}
                  max={8}
                />
              </Field>
              <Field label="swap interval">
                <NumberInput
                  value={swapInterval}
                  onChange={setSwapInterval}
                  min={1}
                  max={60}
                  suffix="sec"
                />
              </Field>
              <Field label="transition">
                <SelectInput
                  value={transition}
                  onChange={setTransition}
                  options={[
                    { value: "fade", label: "Fade" },
                    { value: "slide", label: "Slide" },
                    { value: "zoom", label: "Zoom" },
                  ]}
                />
              </Field>
              <Field label="background color">
                <ColorInput
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                />
              </Field>
              <Field label="animated background">
                <SelectInput
                  value={animatedBackground}
                  onChange={setAnimatedBackground}
                  options={[
                    { value: "none", label: "None" },
                    { value: "gradient", label: "Gradient" },
                  ]}
                />
              </Field>
              <div className="flex gap-6">
                <Field label="show names">
                  <CrosshairToggle
                    checked={showNames}
                    onChange={setShowNames}
                  />
                </Field>
                <Field label="show messages">
                  <CrosshairToggle
                    checked={showMessages}
                    onChange={setShowMessages}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="Effects & Sound"
              id="effects"
              delay={0.25}
            >
              <Field label="spotlight">
                <CrosshairToggle
                  checked={spotlightEnabled}
                  onChange={setSpotlightEnabled}
                />
              </Field>
              {spotlightEnabled && (
                <div className="flex gap-4 ml-2 mb-2">
                  <Field label="interval">
                    <NumberInput
                      value={spotlightInterval}
                      onChange={setSpotlightInterval}
                      min={5}
                      max={120}
                      suffix="sec"
                    />
                  </Field>
                  <Field label="duration">
                    <NumberInput
                      value={spotlightDuration}
                      onChange={setSpotlightDuration}
                      min={1}
                      max={30}
                      suffix="sec"
                    />
                  </Field>
                </div>
              )}
              <Field label="ticker">
                <CrosshairToggle
                  checked={tickerEnabled}
                  onChange={setTickerEnabled}
                />
              </Field>
              {tickerEnabled && (
                <div className="ml-2 mb-2">
                  <Field label="ticker text">
                    <TextInput
                      value={tickerText}
                      onChange={setTickerText}
                    />
                  </Field>
                </div>
              )}
              <Field label="countdown">
                <CrosshairToggle
                  checked={countdownEnabled}
                  onChange={setCountdownEnabled}
                />
              </Field>
              <Field label="social overlay">
                <TextInput
                  value={socialOverlay}
                  onChange={setSocialOverlay}
                  placeholder="@handle or #hashtag"
                />
              </Field>
              <Field label="new selfie sound">
                <SelectInput
                  value={newSelfieSound}
                  onChange={setNewSelfieSound}
                  options={[
                    { value: "none", label: "None" },
                    { value: "chime", label: "Chime" },
                    { value: "shutter", label: "Shutter" },
                  ]}
                />
              </Field>
              <Field label="celebration effect">
                <SelectInput
                  value={celebrationEffect}
                  onChange={setCelebrationEffect}
                  options={[
                    { value: "none", label: "None" },
                    { value: "confetti", label: "Confetti" },
                    { value: "ripple", label: "Ripple" },
                    { value: "glow", label: "Glow" },
                  ]}
                />
              </Field>
            </SectionCard>

            <SectionCard title="Quick Links" id="links" delay={0.3}>
              <CopyLink label="upload url" url={uploadUrl} />
              <CopyLink label="display url" url={displayUrl} />
              <CopyLink label="crew url" url={crewUrl} />
              <div className="flex gap-2 mt-1 mb-2">
                <Link
                  href={`/admin/events/${event._id}/crew`}
                  className="text-xs text-foreground-muted hover:text-foreground transition-colors underline"
                >
                  Manage Crew
                </Link>
                <Link
                  href={`/admin/events/${event._id}/activity`}
                  className="text-xs text-foreground-muted hover:text-foreground transition-colors underline"
                >
                  Activity Log
                </Link>
              </div>
              <Field label="scan reference">
                <div className="bg-background border border-card-border rounded-xs p-4 inline-block">
                  <QRCodeSVG
                    value={uploadUrl}
                    size={100}
                    bgColor="var(--background)"
                    fgColor="var(--foreground)"
                  />
                  <div className="text-label-caps opacity-50 mt-2 text-center !text-[9px]">
                    scan reference
                  </div>
                </div>
              </Field>
            </SectionCard>
          </div>
        </div>

        {/* Save + Export */}
        <div className="flex items-center justify-between mt-6">
          <ExportSelfiesButton
            eventId={event._id}
            eventName={event.name}
          />
          <SaveButton onClick={handleSave} loading={saving} />
        </div>

        {/* Webhooks */}
        <div className="mt-12 border-t border-border-separator pt-6">
          <WebhookManager eventId={eventId} />
        </div>

        {/* Danger zone */}
        <div className="mt-12 border-t border-border-separator pt-6">
          <button
            type="button"
            onClick={() => setDangerOpen(!dangerOpen)}
            className="text-label-caps text-destructive hover:text-destructive/80 transition"
          >
            {dangerOpen ? "- hide" : "+"} danger zone
          </button>
          {dangerOpen && (
            <div className="mt-4 bg-surface border border-destructive/30 rounded-xs p-5">
              <p className="text-sm text-foreground-muted mb-4">
                Permanently delete all selfies for this event. This
                action cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDeleteAllSelfies}
                disabled={deleting || selfieCount === 0}
                className="border border-destructive rounded-xs px-4 py-2 text-label-caps text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
              >
                {deleteProgress !== null
                  ? `deleting... (${deleteProgress} removed)`
                  : `delete all selfies (${selfieCount ?? 0})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
