import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const create = mutation({
  args: {
    selfieId: v.id("selfies"),
    eventId: v.id("events"),
    copies: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("printJobs", {
      selfieId: args.selfieId,
      eventId: args.eventId,
      status: "queued",
      copies: args.copies ?? 1,
      queuedAt: Date.now(),
    });
  },
});

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_eventId_status", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();

    return Promise.all(
      jobs.map(async (job) => {
        const selfie = await ctx.db.get(job.selfieId);
        return {
          ...job,
          imageUrl: selfie ? await ctx.storage.getUrl(selfie.storageId) : null,
          displayName: selfie?.displayName,
        };
      })
    );
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("printJobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("printing"),
      v.literal("printed"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "printed") {
      patch.printedAt = Date.now();
    }
    if (args.errorMessage) {
      patch.errorMessage = args.errorMessage;
    }
    await ctx.db.patch(args.id, patch);
  },
});

export const autoQueue = internalMutation({
  args: {
    selfieId: v.id("selfies"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Check if already queued
    const existing = await ctx.db
      .query("printJobs")
      .withIndex("by_selfieId", (q) => q.eq("selfieId", args.selfieId))
      .first();
    if (existing) return;

    await ctx.db.insert("printJobs", {
      selfieId: args.selfieId,
      eventId: args.eventId,
      status: "queued",
      copies: 1,
      queuedAt: Date.now(),
    });
  },
});

// Internal queries for HTTP endpoints
export const getQueuedByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Find event by print station token
    const events = await ctx.db.query("events").collect();
    const event = events.find(
      (e) => e.printConfig?.printStationToken === args.token
    );
    if (!event) return [];

    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_eventId_status", (q) =>
        q.eq("eventId", event._id).eq("status", "queued")
      )
      .collect();

    return Promise.all(
      jobs.map(async (job) => {
        const selfie = await ctx.db.get(job.selfieId);
        return {
          id: job._id,
          selfieId: job.selfieId,
          copies: job.copies ?? 1,
          queuedAt: job.queuedAt,
          imageUrl: selfie ? await ctx.storage.getUrl(selfie.storageId) : null,
          displayName: selfie?.displayName,
        };
      })
    );
  },
});
