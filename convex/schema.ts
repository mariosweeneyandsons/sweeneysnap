import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  uploadConfigValidator,
  displayConfigValidator,
  brandAssetValidator,
} from "./validators";

export default defineSchema({
  ...authTables,

  adminProfiles: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    displayName: v.string(),
    role: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  presets: defineTable({
    name: v.string(),
    createdBy: v.optional(v.id("users")),
    uploadConfig: uploadConfigValidator,
    displayConfig: displayConfigValidator,
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    fontFamily: v.string(),
    assets: v.array(brandAssetValidator),
    updatedAt: v.number(),
  }),

  events: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.optional(v.id("users")),
    presetId: v.optional(v.id("presets")),
    crewToken: v.string(),
    uploadConfig: uploadConfigValidator,
    displayConfig: displayConfigValidator,
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    moderationEnabled: v.boolean(),
    aiModerationEnabled: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    archived: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    assets: v.optional(v.array(brandAssetValidator)),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_crewToken", ["crewToken"]),

  selfies: defineTable({
    eventId: v.id("events"),
    storageId: v.id("_storage"),
    displayName: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    sessionId: v.optional(v.string()),
    fileSizeBytes: v.optional(v.number()),
    aiModeration: v.optional(
      v.object({
        flagged: v.boolean(),
        categories: v.array(v.string()),
        confidence: v.number(),
        autoRejected: v.boolean(),
        analyzedAt: v.number(),
      })
    ),
  })
    .index("by_eventId", ["eventId"])
    .index("by_eventId_status", ["eventId", "status"])
    .index("by_eventId_sessionId", ["eventId", "sessionId"]),
});
