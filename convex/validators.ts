import { v } from "convex/values";

export const uploadConfigValidator = v.object({
  maxFileSizeMb: v.optional(v.number()),
  allowGallery: v.optional(v.boolean()),
  requireName: v.optional(v.boolean()),
  requireMessage: v.optional(v.boolean()),
  welcomeText: v.optional(v.string()),
  buttonText: v.optional(v.string()),
  successText: v.optional(v.string()),
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
});

export const brandAssetValidator = v.object({
  url: v.string(),
  type: v.union(
    v.literal("logo"),
    v.literal("background"),
    v.literal("overlay")
  ),
  name: v.string(),
});
