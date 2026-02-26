import { v } from "convex/values";

export const uploadConfigValidator = v.object({
  maxFileSizeMb: v.optional(v.number()),
  allowGallery: v.optional(v.boolean()),
  requireName: v.optional(v.boolean()),
  requireMessage: v.optional(v.boolean()),
  welcomeText: v.optional(v.string()),
  buttonText: v.optional(v.string()),
  successText: v.optional(v.string()),
  maxUploadsPerSession: v.optional(v.number()),
  countdownSeconds: v.optional(v.number()),
  flashEnabled: v.optional(v.boolean()),
  allowCameraSwitch: v.optional(v.boolean()),
  multiPhotoEnabled: v.optional(v.boolean()),
  filtersEnabled: v.optional(v.boolean()),
  framesEnabled: v.optional(v.boolean()),
  stickersEnabled: v.optional(v.boolean()),
});

export const displayConfigValidator = v.object({
  gridColumns: v.optional(v.number()),
  swapInterval: v.optional(v.number()),
  transition: v.optional(
    v.union(v.literal("fade"), v.literal("slide"), v.literal("zoom"))
  ),
  backgroundColor: v.optional(v.string()),
  showNames: v.optional(v.boolean()),
  showMessages: v.optional(v.boolean()),
  overlayOpacity: v.optional(v.number()),
  frameBorderColor: v.optional(v.string()),
  frameBorderWidth: v.optional(v.number()),
  // Layout mode
  layoutMode: v.optional(
    v.union(v.literal("grid"), v.literal("slideshow"), v.literal("mosaic"))
  ),
  // Background
  backgroundImageId: v.optional(v.id("_storage")),
  backgroundVideoId: v.optional(v.id("_storage")),
  animatedBackground: v.optional(
    v.union(v.literal("none"), v.literal("gradient"))
  ),
  // Spotlight
  spotlightEnabled: v.optional(v.boolean()),
  spotlightInterval: v.optional(v.number()),
  spotlightDuration: v.optional(v.number()),
  // Ticker
  tickerEnabled: v.optional(v.boolean()),
  tickerText: v.optional(v.string()),
  // Countdown
  countdownEnabled: v.optional(v.boolean()),
  // Social overlay
  socialOverlay: v.optional(v.string()),
  // Sound
  newSelfieSound: v.optional(
    v.union(v.literal("none"), v.literal("chime"), v.literal("shutter"))
  ),
  // Celebration
  celebrationEffect: v.optional(
    v.union(
      v.literal("none"),
      v.literal("confetti"),
      v.literal("ripple"),
      v.literal("glow")
    )
  ),
});

export const brandAssetValidator = v.object({
  url: v.string(),
  type: v.union(
    v.literal("logo"),
    v.literal("background"),
    v.literal("overlay"),
    v.literal("frame"),
    v.literal("sticker")
  ),
  name: v.string(),
  storageId: v.optional(v.id("_storage")),
});

export const crewPermissionValidator = v.union(
  v.literal("moderator"),
  v.literal("viewer")
);

export const crewActionValidator = v.union(
  v.literal("approve"),
  v.literal("reject"),
  v.literal("reset"),
  v.literal("delete")
);
