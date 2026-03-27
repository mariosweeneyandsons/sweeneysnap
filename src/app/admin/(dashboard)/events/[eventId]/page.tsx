"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { ExportSelfiesButton } from "@/components/admin/ExportSelfiesButton";
import { EventDetailSkeleton } from "@/components/admin/skeletons/EventDetailSkeleton";
import { WebhookManager } from "@/components/admin/WebhookManager";
import { BlueprintLivePreview } from "@/components/blueprint/BlueprintLivePreview";
import {
  Field,
  TextInput,
  TextArea,
  NumberInput,
  SelectInput,
  CrosshairToggle,
  ColorInput,
  SectionCard,
  SaveButton,
  DateInput,
  SectionNav,
  CompactCopyLink,
} from "@/components/blueprint/BlueprintForm";
import { useEventFormState } from "@/hooks/useEventFormState";
import { getSiteUrl } from "@/lib/config";

const sections = [
  { id: "event", label: "Event" },
  { id: "upload", label: "Upload" },
  { id: "display", label: "Display" },
  { id: "branding", label: "Branding" },
];

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const event = useQuery(api.events.getById, {
    id: eventId as Id<"events">,
  });
  const selfieCount = useQuery(
    api.selfies.countByEvent,
    event ? { eventId: event._id } : "skip"
  );

  const {
    core,
    branding,
    upload,
    display,
    effects,
    ui,
    liveDisplayConfig,
    scrollTo,
    actions,
  } = useEventFormState(event, selfieCount);

  // -- Loading --
  if (event === undefined) return <EventDetailSkeleton />;
  if (!event)
    return (
      <div className="text-center py-12 text-foreground-muted">
        Event not found
      </div>
    );

  const siteUrl = getSiteUrl();
  const uploadUrl = `${siteUrl}/${event.slug}`;
  const displayUrl = `${siteUrl}/display/${event.slug}`;
  const crewUrl = `${siteUrl}/crew/${event.crewToken}`;

  return (
    <div className="bp-grid -mx-6 -mt-4 px-6 pt-4 min-h-screen">
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b-2 border-border -mx-6 px-6">
        <div className="py-3 flex items-center justify-between">
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
                className="bg-surface border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition"
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
              onClick={actions.handleDuplicate}
              disabled={ui.duplicating}
              className="bg-surface border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition disabled:opacity-50"
            >
              {ui.duplicating ? "..." : "duplicate"}
            </button>
            <button
              type="button"
              onClick={actions.handleArchive}
              disabled={ui.archiving}
              className="bg-surface border border-border-strong rounded-xs px-3 py-1.5 text-label-caps text-foreground-emphasis hover:bg-secondary transition disabled:opacity-50"
            >
              {ui.archiving
                ? "..."
                : event.archived
                  ? "unarchive"
                  : "archive"}
            </button>
          </div>
        </div>

        {/* Section nav */}
        <div className="py-2 border-t border-border-separator">
          <SectionNav
            sections={sections}
            activeSection={ui.activeSection}
            onNavigate={scrollTo}
          />
        </div>

        {/* URL bar */}
        <div className="py-2 border-t border-border-separator flex items-center gap-6 overflow-x-auto">
          <CompactCopyLink label="upload" url={uploadUrl} />
          <div className="w-px h-4 bg-border-separator shrink-0" />
          <CompactCopyLink label="display" url={displayUrl} />
          <div className="w-px h-4 bg-border-separator shrink-0" />
          <CompactCopyLink label="crew" url={crewUrl} />
        </div>
      </div>

      {/* Two-panel layout: sticky preview + scrollable form */}
      <div className="py-8 flex gap-6">
        {/* Left: sticky preview panel */}
        <aside className="hidden xl:block w-[420px] shrink-0">
          <div className="sticky top-[110px]">
            <BlueprintLivePreview
              eventId={eventId}
              displayConfig={liveDisplayConfig}
              uploadUrl={uploadUrl}
              displayUrl={displayUrl}
              crewUrl={crewUrl}
              selfieCount={selfieCount ?? 0}
              eventName={event.name}
            />
          </div>
        </aside>

        {/* Right: scrollable form */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Column 1: Event Basics + Upload Config + Camera */}
            <div>
              <SectionCard title="Event Basics" id="event" delay={0}>
                <Field label="event name">
                  <TextInput value={core.name} onChange={core.setName} />
                </Field>
                <Field label="slug">
                  <TextInput value={core.slug} onChange={core.setSlug} />
                </Field>
                <Field label="description">
                  <TextArea
                    value={core.description}
                    onChange={core.setDescription}
                  />
                </Field>
                <Field label="start date">
                  <DateInput value={core.startDate} onChange={core.setStartDate} />
                </Field>
                <Field label="end date">
                  <DateInput value={core.endDate} onChange={core.setEndDate} />
                </Field>
                <div className="flex gap-6">
                  <Field label="active">
                    <CrosshairToggle
                      checked={core.isActive}
                      onChange={core.setIsActive}
                    />
                  </Field>
                  <Field label="moderation">
                    <CrosshairToggle
                      checked={core.moderationEnabled}
                      onChange={core.setModerationEnabled}
                    />
                  </Field>
                  <Field label="ai moderation">
                    <CrosshairToggle
                      checked={core.aiModerationEnabled}
                      onChange={core.setAiModerationEnabled}
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title="Upload Config" id="upload" delay={0.1} defaultOpen={false}>
                <Field label="welcome text">
                  <TextArea
                    value={upload.welcomeText}
                    onChange={upload.setWelcomeText}
                  />
                </Field>
                <Field label="button text">
                  <TextInput
                    value={upload.buttonText}
                    onChange={upload.setButtonText}
                  />
                </Field>
                <Field label="success text">
                  <TextArea
                    value={upload.successText}
                    onChange={upload.setSuccessText}
                  />
                </Field>
                <div className="flex gap-6">
                  <Field label="require name">
                    <CrosshairToggle
                      checked={upload.requireName}
                      onChange={upload.setRequireName}
                    />
                  </Field>
                  <Field label="require message">
                    <CrosshairToggle
                      checked={upload.requireMessage}
                      onChange={upload.setRequireMessage}
                    />
                  </Field>
                </div>
                <Field label="max file size">
                  <NumberInput
                    value={upload.maxFileSizeMb}
                    onChange={upload.setMaxFileSizeMb}
                    min={1}
                    max={50}
                    suffix="mb"
                  />
                </Field>
                <Field label="allow gallery">
                  <CrosshairToggle
                    checked={upload.allowGallery}
                    onChange={upload.setAllowGallery}
                  />
                </Field>
              </SectionCard>

              <SectionCard title="Camera & Editor" id="camera" delay={0.15} defaultOpen={false}>
                <Field label="max uploads per session">
                  <NumberInput
                    value={upload.maxUploadsPerSession}
                    onChange={upload.setMaxUploadsPerSession}
                    min={1}
                    max={50}
                  />
                </Field>
                <Field label="countdown seconds">
                  <NumberInput
                    value={upload.countdownSeconds}
                    onChange={upload.setCountdownSeconds}
                    min={0}
                    max={10}
                    suffix="sec"
                  />
                </Field>
                <div className="flex gap-6">
                  <Field label="multi-photo">
                    <CrosshairToggle
                      checked={upload.multiPhotoEnabled}
                      onChange={upload.setMultiPhotoEnabled}
                    />
                  </Field>
                  <Field label="flash">
                    <CrosshairToggle
                      checked={upload.flashEnabled}
                      onChange={upload.setFlashEnabled}
                    />
                  </Field>
                  <Field label="camera switch">
                    <CrosshairToggle
                      checked={upload.allowCameraSwitch}
                      onChange={upload.setAllowCameraSwitch}
                    />
                  </Field>
                </div>
                <div className="flex gap-6">
                  <Field label="filters">
                    <CrosshairToggle
                      checked={upload.filtersEnabled}
                      onChange={upload.setFiltersEnabled}
                    />
                  </Field>
                  <Field label="frames">
                    <CrosshairToggle
                      checked={upload.framesEnabled}
                      onChange={upload.setFramesEnabled}
                    />
                  </Field>
                  <Field label="stickers">
                    <CrosshairToggle
                      checked={upload.stickersEnabled}
                      onChange={upload.setStickersEnabled}
                    />
                  </Field>
                </div>
              </SectionCard>
            </div>

            {/* Column 2: Display Config + Effects + Branding */}
            <div>
              <SectionCard title="Display Config" id="display" delay={0.15} defaultOpen={false}>
                <Field label="layout mode">
                  <SelectInput
                    value={display.layoutMode}
                    onChange={display.setLayoutMode}
                    options={[
                      { value: "grid", label: "Grid" },
                      { value: "slideshow", label: "Slideshow" },
                      { value: "mosaic", label: "Mosaic" },
                    ]}
                  />
                </Field>
                <Field label="grid columns">
                  <NumberInput
                    value={display.gridColumns}
                    onChange={display.setGridColumns}
                    min={1}
                    max={8}
                  />
                </Field>
                <Field label="swap interval">
                  <NumberInput
                    value={display.swapInterval}
                    onChange={display.setSwapInterval}
                    min={1}
                    max={60}
                    suffix="sec"
                  />
                </Field>
                <Field label="transition">
                  <SelectInput
                    value={display.transition}
                    onChange={display.setTransition}
                    options={[
                      { value: "fade", label: "Fade" },
                      { value: "slide", label: "Slide" },
                      { value: "zoom", label: "Zoom" },
                    ]}
                  />
                </Field>
                <Field label="background color">
                  <ColorInput
                    value={display.backgroundColor}
                    onChange={display.setBackgroundColor}
                  />
                </Field>
                <Field label="animated background">
                  <SelectInput
                    value={display.animatedBackground}
                    onChange={display.setAnimatedBackground}
                    options={[
                      { value: "none", label: "None" },
                      { value: "gradient", label: "Gradient" },
                    ]}
                  />
                </Field>
                <div className="flex gap-6">
                  <Field label="show names">
                    <CrosshairToggle
                      checked={display.showNames}
                      onChange={display.setShowNames}
                    />
                  </Field>
                  <Field label="show messages">
                    <CrosshairToggle
                      checked={display.showMessages}
                      onChange={display.setShowMessages}
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title="Effects & Sound" id="effects" delay={0.2} defaultOpen={false}>
                <Field label="spotlight">
                  <CrosshairToggle
                    checked={effects.spotlightEnabled}
                    onChange={effects.setSpotlightEnabled}
                  />
                </Field>
                {effects.spotlightEnabled && (
                  <div className="flex gap-4 ml-2 mb-2">
                    <Field label="interval">
                      <NumberInput
                        value={effects.spotlightInterval}
                        onChange={effects.setSpotlightInterval}
                        min={5}
                        max={120}
                        suffix="sec"
                      />
                    </Field>
                    <Field label="duration">
                      <NumberInput
                        value={effects.spotlightDuration}
                        onChange={effects.setSpotlightDuration}
                        min={1}
                        max={30}
                        suffix="sec"
                      />
                    </Field>
                  </div>
                )}
                <Field label="ticker">
                  <CrosshairToggle
                    checked={effects.tickerEnabled}
                    onChange={effects.setTickerEnabled}
                  />
                </Field>
                {effects.tickerEnabled && (
                  <div className="ml-2 mb-2">
                    <Field label="ticker text">
                      <TextInput
                        value={effects.tickerText}
                        onChange={effects.setTickerText}
                      />
                    </Field>
                  </div>
                )}
                <Field label="countdown">
                  <CrosshairToggle
                    checked={effects.countdownEnabled}
                    onChange={effects.setCountdownEnabled}
                  />
                </Field>
                <Field label="social overlay">
                  <TextInput
                    value={effects.socialOverlay}
                    onChange={effects.setSocialOverlay}
                    placeholder="@handle or #hashtag"
                  />
                </Field>
                <Field label="new selfie sound">
                  <SelectInput
                    value={effects.newSelfieSound}
                    onChange={effects.setNewSelfieSound}
                    options={[
                      { value: "none", label: "None" },
                      { value: "chime", label: "Chime" },
                      { value: "shutter", label: "Shutter" },
                    ]}
                  />
                </Field>
                <Field label="celebration effect">
                  <SelectInput
                    value={effects.celebrationEffect}
                    onChange={effects.setCelebrationEffect}
                    options={[
                      { value: "none", label: "None" },
                      { value: "confetti", label: "Confetti" },
                      { value: "ripple", label: "Ripple" },
                      { value: "glow", label: "Glow" },
                    ]}
                  />
                </Field>
              </SectionCard>

              <SectionCard title="Branding" id="branding" delay={0.25} defaultOpen={false}>
                <Field label="primary color">
                  <ColorInput
                    value={branding.primaryColor}
                    onChange={branding.setPrimaryColor}
                  />
                </Field>
                <Field label="font family">
                  <SelectInput
                    value={branding.fontFamily}
                    onChange={branding.setFontFamily}
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
                    value={branding.customCss}
                    onChange={branding.setCustomCss}
                    rows={4}
                    placeholder="/* custom overrides */"
                  />
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
            <SaveButton onClick={actions.handleSave} loading={ui.saving} />
          </div>

          {/* Webhooks */}
          <div className="mt-12 border-t border-border-separator pt-6">
            <WebhookManager eventId={eventId} />
          </div>

          {/* Danger zone */}
          <div className="mt-12 border-t border-border-separator pt-6">
            <button
              type="button"
              onClick={() => ui.setDangerOpen(!ui.dangerOpen)}
              className="text-label-caps text-destructive hover:text-destructive/80 transition"
            >
              {ui.dangerOpen ? "- hide" : "+"} danger zone
            </button>
            {ui.dangerOpen && (
              <div className="mt-4 bg-surface border border-destructive/30 rounded-xs p-5">
                <p className="text-sm text-foreground-muted mb-4">
                  Permanently delete all selfies for this event. This
                  action cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={actions.handleDeleteAllSelfies}
                  disabled={ui.deleting || selfieCount === 0}
                  className="border border-destructive rounded-xs px-4 py-2 text-label-caps text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                >
                  {ui.deleteProgress !== null
                    ? `deleting... (${ui.deleteProgress} removed)`
                    : `delete all selfies (${selfieCount ?? 0})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
