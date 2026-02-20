import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { uploadConfigValidator, displayConfigValidator } from "./validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("presets").order("desc").collect();
  },
});

export const listByName = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const presets = await ctx.db.query("presets").collect();
    return presets.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getById = query({
  args: { id: v.id("presets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    uploadConfig: uploadConfigValidator,
    displayConfig: displayConfigValidator,
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    fontFamily: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("presets", {
      ...args,
      assets: [],
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("presets"),
    name: v.string(),
    uploadConfig: uploadConfigValidator,
    displayConfig: displayConfigValidator,
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    fontFamily: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, { ...data, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("presets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
