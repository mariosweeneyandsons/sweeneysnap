import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { displayConfigValidator } from "./validators";

export const create = mutation({
  args: {
    name: v.string(),
    eventIds: v.array(v.id("events")),
    slug: v.string(),
    displayConfig: displayConfigValidator,
    showEventBadges: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Validate slug uniqueness
    const existing = await ctx.db
      .query("multiEventDisplays")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Slug already in use");

    return await ctx.db.insert("multiEventDisplays", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("multiEventDisplays"),
    name: v.optional(v.string()),
    eventIds: v.optional(v.array(v.id("events"))),
    displayConfig: v.optional(displayConfigValidator),
    showEventBadges: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, { ...data, updatedAt: Date.now() });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("multiEventDisplays").order("desc").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("multiEventDisplays")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const remove = mutation({
  args: { id: v.id("multiEventDisplays") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
