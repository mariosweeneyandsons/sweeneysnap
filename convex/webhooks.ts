import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

const triggerValidator = v.union(
  v.literal("selfie.created"),
  v.literal("selfie.approved"),
  v.literal("selfie.rejected")
);

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("webhooks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    url: v.string(),
    triggers: v.array(triggerValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("webhooks", {
      eventId: args.eventId,
      url: args.url,
      secret: crypto.randomUUID(),
      triggers: args.triggers,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("webhooks"),
    url: v.optional(v.string()),
    triggers: v.optional(v.array(triggerValidator)),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, { ...data, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("webhooks") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const getWebhooksForTrigger = internalQuery({
  args: {
    eventId: v.id("events"),
    trigger: triggerValidator,
  },
  handler: async (ctx, args) => {
    const webhooks = await ctx.db
      .query("webhooks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    return webhooks.filter(
      (w) => w.isActive && w.triggers.includes(args.trigger)
    );
  },
});
