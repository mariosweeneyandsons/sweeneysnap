import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listApprovedByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
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
  },
  handler: async (ctx, args) => {
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
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
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
  },
  handler: async (ctx, args) => {
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
  args: {},
  handler: async (ctx) => {
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
    return await ctx.db.insert("selfies", {
      ...args,
    });
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
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("selfies") },
  handler: async (ctx, args) => {
    const selfie = await ctx.db.get(args.id);
    if (!selfie) throw new Error("Selfie not found");
    await ctx.storage.delete(selfie.storageId);
    await ctx.db.delete(args.id);
  },
});
