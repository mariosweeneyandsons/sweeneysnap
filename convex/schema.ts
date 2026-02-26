import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  uploadConfigValidator,
  displayConfigValidator,
  brandAssetValidator,
  crewPermissionValidator,
  crewActionValidator,
  selfieStatusValidator,
  webhookTriggerValidator,
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
    customCss: v.optional(v.string()),
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
    fontFamily: v.optional(v.string()),
    customCss: v.optional(v.string()),
    moderationEnabled: v.boolean(),
    aiModerationEnabled: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    archived: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    assets: v.optional(v.array(brandAssetValidator)),
    updatedAt: v.number(),
    // Custom domain (Feature 88)
    customDomain: v.optional(v.string()),
    // Print config (Feature 90)
    printConfig: v.optional(
      v.object({
        enabled: v.boolean(),
        autoPrintOnApproval: v.optional(v.boolean()),
        printStationToken: v.optional(v.string()),
      })
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_crewToken", ["crewToken"])
    .index("by_customDomain", ["customDomain"]),

  selfies: defineTable({
    eventId: v.id("events"),
    storageId: v.id("_storage"),
    displayName: v.optional(v.string()),
    message: v.optional(v.string()),
    status: selfieStatusValidator,
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
    // Image optimization (Feature 87)
    thumbnailStorageId: v.optional(v.id("_storage")),
    mediumStorageId: v.optional(v.id("_storage")),
    // Email/SMS delivery (Feature 91)
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    deliveryStatus: v.optional(
      v.union(v.literal("pending"), v.literal("sent"), v.literal("failed"))
    ),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_eventId_status", ["eventId", "status"])
    .index("by_eventId_sessionId", ["eventId", "sessionId"]),

  crewMembers: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    token: v.string(),
    permission: crewPermissionValidator,
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_token", ["token"]),

  webhooks: defineTable({
    eventId: v.id("events"),
    url: v.string(),
    secret: v.string(),
    triggers: v.array(webhookTriggerValidator),
    isActive: v.boolean(),
    createdBy: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_eventId", ["eventId"]),

  crewActivityLog: defineTable({
    eventId: v.id("events"),
    crewMemberId: v.optional(v.id("crewMembers")),
    crewToken: v.string(),
    action: crewActionValidator,
    selfieId: v.optional(v.id("selfies")),
    timestamp: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_crewMemberId", ["crewMemberId"]),

  // Print jobs (Feature 90)
  printJobs: defineTable({
    selfieId: v.id("selfies"),
    eventId: v.id("events"),
    status: v.union(
      v.literal("queued"),
      v.literal("printing"),
      v.literal("printed"),
      v.literal("failed")
    ),
    copies: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    queuedAt: v.number(),
    printedAt: v.optional(v.number()),
  })
    .index("by_eventId_status", ["eventId", "status"])
    .index("by_selfieId", ["selfieId"]),

  // Multi-event displays (Feature 94)
  multiEventDisplays: defineTable({
    name: v.string(),
    eventIds: v.array(v.id("events")),
    slug: v.string(),
    displayConfig: displayConfigValidator,
    showEventBadges: v.optional(v.boolean()),
    createdBy: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),
});
