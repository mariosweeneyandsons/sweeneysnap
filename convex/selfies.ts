import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin, requireAdminOrCrew, validateStringLength } from "./lib";

export const listApprovedByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) return [];

    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId_status", (q) =>
        q.eq("eventId", args.eventId).eq("status", "approved")
      )
      .order("desc")
      .collect();

    return Promise.all(
      selfies.map(async (selfie) => ({
        ...selfie,
        imageUrl: await ctx.storage.getUrl(selfie.storageId),
      }))
    );
  },
});

export const listByEvent = query({
  args: {
    eventId: v.id("events"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
    crewToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.eventId, args.crewToken);
    let selfies;
    if (args.status) {
      selfies = await ctx.db
        .query("selfies")
        .withIndex("by_eventId_status", (q) =>
          q.eq("eventId", args.eventId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      selfies = await ctx.db
        .query("selfies")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .order("desc")
        .collect();
    }

    return Promise.all(
      selfies.map(async (selfie) => ({
        ...selfie,
        imageUrl: await ctx.storage.getUrl(selfie.storageId),
      }))
    );
  },
});

export const countByEvent = query({
  args: { eventId: v.id("events"), crewToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.eventId, args.crewToken);
    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    return selfies.length;
  },
});

export const countByEventAndStatus = query({
  args: {
    eventId: v.id("events"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    crewToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.eventId, args.crewToken);
    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId_status", (q) =>
        q.eq("eventId", args.eventId).eq("status", args.status)
      )
      .collect();
    return selfies.length;
  },
});

export const generateUploadUrl = mutation({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    // Validate event exists and is active when eventId provided
    if (args.eventId) {
      const event = await ctx.db.get(args.eventId);
      if (!event || !event.isActive) throw new Error("Event not found or not active");
    } else {
      // If no eventId, require admin auth (legacy usage)
      await requireAdmin(ctx);
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const countBySessionAndEvent = query({
  args: {
    eventId: v.id("events"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) return 0;

    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId_sessionId", (q) =>
        q.eq("eventId", args.eventId).eq("sessionId", args.sessionId)
      )
      .collect();
    return selfies.length;
  },
});

export const generateUploadUrlForEvent = mutation({
  args: {
    eventId: v.id("events"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (!event.isActive) throw new Error("Event is not active");

    const maxUploads = event.uploadConfig.maxUploadsPerSession ?? 10;
    const existing = await ctx.db
      .query("selfies")
      .withIndex("by_eventId_sessionId", (q) =>
        q.eq("eventId", args.eventId).eq("sessionId", args.sessionId)
      )
      .collect();

    if (existing.length >= maxUploads) {
      throw new Error("Upload limit reached for this session");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.id("_storage"),
    displayName: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved")),
    sessionId: v.optional(v.string()),
    fileSizeBytes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (!event.isActive) throw new Error("Event is not active");

    validateStringLength(args.displayName, "displayName", 100);
    validateStringLength(args.message, "message", 500);

    // Enforce rate limit
    if (args.sessionId) {
      const maxUploads = event.uploadConfig.maxUploadsPerSession ?? 10;
      const existing = await ctx.db
        .query("selfies")
        .withIndex("by_eventId_sessionId", (q) =>
          q.eq("eventId", args.eventId).eq("sessionId", args.sessionId)
        )
        .collect();
      if (existing.length >= maxUploads) {
        throw new Error("Upload limit reached for this session");
      }
    }

    const selfieId = await ctx.db.insert("selfies", {
      ...args,
    });

    // Schedule AI moderation if enabled on the event
    if (event.aiModerationEnabled) {
      await ctx.scheduler.runAfter(0, internal.aiModeration.moderateWithAi, {
        selfieId,
      });
    }

    // Dispatch webhook
    await ctx.scheduler.runAfter(0, internal.webhookDispatch.dispatch, {
      eventId: args.eventId,
      trigger: "selfie.created",
      payload: { selfieId, displayName: args.displayName, status: args.status },
    });

    return selfieId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("selfies"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const selfie = await ctx.db.get(args.id);
    if (!selfie) throw new Error("Selfie not found");
    await ctx.db.patch(args.id, { status: args.status });

    // Dispatch webhook for approve/reject
    if (args.status === "approved" || args.status === "rejected") {
      const trigger = args.status === "approved" ? "selfie.approved" as const : "selfie.rejected" as const;
      await ctx.scheduler.runAfter(0, internal.webhookDispatch.dispatch, {
        eventId: selfie.eventId,
        trigger,
        payload: { selfieId: args.id, displayName: selfie.displayName, status: args.status },
      });
    }
  },
});

export const updateStatusWithLog = mutation({
  args: {
    id: v.id("selfies"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    crewToken: v.string(),
    crewMemberId: v.optional(v.id("crewMembers")),
  },
  handler: async (ctx, args) => {
    const selfie = await ctx.db.get(args.id);
    if (!selfie) throw new Error("Selfie not found");

    // Validate crew authorization against the selfie's event
    await requireAdminOrCrew(ctx, selfie.eventId, args.crewToken);

    // If crewMemberId is provided, verify permission
    if (args.crewMemberId) {
      const member = await ctx.db.get(args.crewMemberId);
      if (!member) throw new Error("Crew member not found");
      if (member.permission === "viewer") {
        throw new Error("Viewers cannot moderate selfies");
      }
    }

    await ctx.db.patch(args.id, { status: args.status });

    // Map status to action
    const actionMap: Record<string, "approve" | "reject" | "reset"> = {
      approved: "approve",
      rejected: "reject",
      pending: "reset",
    };

    await ctx.db.insert("crewActivityLog", {
      eventId: selfie.eventId,
      crewMemberId: args.crewMemberId,
      crewToken: args.crewToken,
      action: actionMap[args.status],
      selfieId: args.id,
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("selfies") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const selfie = await ctx.db.get(args.id);
    if (!selfie) throw new Error("Selfie not found");
    await ctx.storage.delete(selfie.storageId);
    await ctx.db.delete(args.id);
  },
});

export const countsByEvents = query({
  args: { eventIds: v.array(v.id("events")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result: Record<string, { total: number; pending: number; approved: number; rejected: number }> = {};
    for (const eventId of args.eventIds) {
      const selfies = await ctx.db
        .query("selfies")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .collect();
      result[eventId] = {
        total: selfies.length,
        pending: selfies.filter((s) => s.status === "pending").length,
        approved: selfies.filter((s) => s.status === "approved").length,
        rejected: selfies.filter((s) => s.status === "rejected").length,
      };
    }
    return result;
  },
});

export const removeAllByEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .take(100);

    for (const selfie of selfies) {
      await ctx.storage.delete(selfie.storageId);
      await ctx.db.delete(selfie._id);
    }

    // Check if there are more
    const remaining = await ctx.db
      .query("selfies")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();

    return { deleted: selfies.length, hasMore: remaining !== null };
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("selfies")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const id of args.ids) {
      const selfie = await ctx.db.get(id);
      if (!selfie) continue;
      await ctx.db.patch(id, { status: args.status });

      if (args.status === "approved" || args.status === "rejected") {
        const trigger = args.status === "approved" ? "selfie.approved" as const : "selfie.rejected" as const;
        await ctx.scheduler.runAfter(0, internal.webhookDispatch.dispatch, {
          eventId: selfie.eventId,
          trigger,
          payload: { selfieId: id, displayName: selfie.displayName, status: args.status },
        });
      }
    }
  },
});

export const getById = internalQuery({
  args: { selfieId: v.id("selfies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.selfieId);
  },
});

export const updateAiModeration = internalMutation({
  args: {
    selfieId: v.id("selfies"),
    aiModeration: v.object({
      flagged: v.boolean(),
      categories: v.array(v.string()),
      confidence: v.number(),
      autoRejected: v.boolean(),
      analyzedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      aiModeration: args.aiModeration,
    };
    if (args.aiModeration.flagged) {
      patch.status = "rejected";
    }
    await ctx.db.patch(args.selfieId, patch);
  },
});
