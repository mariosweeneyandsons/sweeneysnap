import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { crewPermissionValidator } from "./validators";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("crewMembers")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("crewMembers")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    permission: crewPermissionValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("crewMembers", {
      eventId: args.eventId,
      name: args.name,
      token: crypto.randomUUID(),
      permission: args.permission,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("crewMembers"),
    name: v.optional(v.string()),
    permission: v.optional(crewPermissionValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.permission !== undefined) patch.permission = data.permission;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("crewMembers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const regenerateToken = mutation({
  args: { id: v.id("crewMembers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const newToken = crypto.randomUUID();
    await ctx.db.patch(args.id, { token: newToken });
    return newToken;
  },
});
