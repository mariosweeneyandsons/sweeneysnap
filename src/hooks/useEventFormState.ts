"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/Toast";
import { DisplayConfig } from "@/types/database";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_BG_COLOR,
  DEFAULT_FONT,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_MAX_UPLOADS,
  DEFAULT_COUNTDOWN_SECONDS,
} from "@/lib/defaults";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventFormState(event: any, selfieCount: number | undefined) {
  const router = useRouter();
  const { toast } = useToast();

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
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT);
  const [customCss, setCustomCss] = useState("");

  // -- Upload config --
  const [welcomeText, setWelcomeText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [requireName, setRequireName] = useState(false);
  const [requireMessage, setRequireMessage] = useState(false);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(DEFAULT_MAX_FILE_SIZE_MB);
  const [allowGallery, setAllowGallery] = useState(true);
  const [maxUploadsPerSession, setMaxUploadsPerSession] = useState(DEFAULT_MAX_UPLOADS);
  const [countdownSeconds, setCountdownSeconds] = useState(DEFAULT_COUNTDOWN_SECONDS);
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
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG_COLOR);
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

  // -- Live display config for preview --
  const liveDisplayConfig: DisplayConfig = useMemo(
    () => ({
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
    }),
    [
      layoutMode,
      gridColumns,
      swapInterval,
      transition,
      backgroundColor,
      animatedBackground,
      showNames,
      showMessages,
      spotlightEnabled,
      spotlightInterval,
      spotlightDuration,
      tickerEnabled,
      tickerText,
      countdownEnabled,
      socialOverlay,
      newSelfieSound,
      celebrationEffect,
    ]
  );

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

  return {
    // Core
    core: {
      name, setName,
      slug, setSlug,
      description, setDescription,
      startDate, setStartDate,
      endDate, setEndDate,
      isActive, setIsActive,
      moderationEnabled, setModerationEnabled,
      aiModerationEnabled, setAiModerationEnabled,
    },
    // Branding
    branding: {
      primaryColor, setPrimaryColor,
      fontFamily, setFontFamily,
      customCss, setCustomCss,
    },
    // Upload
    upload: {
      welcomeText, setWelcomeText,
      buttonText, setButtonText,
      successText, setSuccessText,
      requireName, setRequireName,
      requireMessage, setRequireMessage,
      maxFileSizeMb, setMaxFileSizeMb,
      allowGallery, setAllowGallery,
      maxUploadsPerSession, setMaxUploadsPerSession,
      countdownSeconds, setCountdownSeconds,
      multiPhotoEnabled, setMultiPhotoEnabled,
      flashEnabled, setFlashEnabled,
      allowCameraSwitch, setAllowCameraSwitch,
      filtersEnabled, setFiltersEnabled,
      framesEnabled, setFramesEnabled,
      stickersEnabled, setStickersEnabled,
    },
    // Display
    display: {
      layoutMode, setLayoutMode,
      gridColumns, setGridColumns,
      swapInterval, setSwapInterval,
      transition, setTransition,
      backgroundColor, setBackgroundColor,
      animatedBackground, setAnimatedBackground,
      showNames, setShowNames,
      showMessages, setShowMessages,
    },
    // Effects
    effects: {
      spotlightEnabled, setSpotlightEnabled,
      spotlightInterval, setSpotlightInterval,
      spotlightDuration, setSpotlightDuration,
      tickerEnabled, setTickerEnabled,
      tickerText, setTickerText,
      countdownEnabled, setCountdownEnabled,
      socialOverlay, setSocialOverlay,
      newSelfieSound, setNewSelfieSound,
      celebrationEffect, setCelebrationEffect,
    },
    // UI
    ui: {
      saving,
      activeSection, setActiveSection,
      dangerOpen, setDangerOpen,
      duplicating,
      archiving,
      deleting,
      deleteProgress,
    },
    // Derived
    liveDisplayConfig,
    // Navigation
    scrollTo,
    // Actions
    actions: {
      handleSave,
      handleDuplicate,
      handleArchive,
      handleDeleteAllSelfies,
    },
  };
}
