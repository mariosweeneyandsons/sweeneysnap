import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const addToPreset = mutation({
  args: {
    presetId: v.id("presets"),
    storageId: v.id("_storage"),
    type: v.union(
      v.literal("logo"),
      v.literal("background"),
      v.literal("overlay"),
      v.literal("frame"),
      v.literal("sticker")
    ),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const preset = await ctx.db.get(args.presetId);
    if (!preset) throw new Error("Preset not found");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Storage file not found");

    const asset = {
      storageId: args.storageId,
      url,
      type: args.type,
      name: args.name,
    };

    await ctx.db.patch(args.presetId, {
      assets: [...preset.assets, asset],
      updatedAt: Date.now(),
    });
  },
});

export const addToEvent = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.id("_storage"),
    type: v.union(
      v.literal("logo"),
      v.literal("background"),
      v.literal("overlay"),
      v.literal("frame"),
      v.literal("sticker")
    ),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Storage file not found");

    const asset = {
      storageId: args.storageId,
      url,
      type: args.type,
      name: args.name,
    };

    const currentAssets = event.assets || [];
    await ctx.db.patch(args.eventId, {
      assets: [...currentAssets, asset],
      updatedAt: Date.now(),
    });
  },
});

export const removeFromPreset = mutation({
  args: {
    presetId: v.id("presets"),
    assetIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const preset = await ctx.db.get(args.presetId);
    if (!preset) throw new Error("Preset not found");

    const asset = preset.assets[args.assetIndex];
    if (!asset) throw new Error("Asset not found");

    if (asset.storageId) {
      await ctx.storage.delete(asset.storageId);
    }

    const updatedAssets = preset.assets.filter((_, i) => i !== args.assetIndex);
    await ctx.db.patch(args.presetId, {
      assets: updatedAssets,
      updatedAt: Date.now(),
    });
  },
});

export const removeFromEvent = mutation({
  args: {
    eventId: v.id("events"),
    assetIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const currentAssets = event.assets || [];
    const asset = currentAssets[args.assetIndex];
    if (!asset) throw new Error("Asset not found");

    if (asset.storageId) {
      await ctx.storage.delete(asset.storageId);
    }

    const updatedAssets = currentAssets.filter((_, i) => i !== args.assetIndex);
    await ctx.db.patch(args.eventId, {
      assets: updatedAssets,
      updatedAt: Date.now(),
    });
  },
});

export const listByPreset = query({
  args: { presetId: v.id("presets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const preset = await ctx.db.get(args.presetId);
    if (!preset) return [];
    return preset.assets;
  },
});

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) return [];
    return event.assets || [];
  },
});
