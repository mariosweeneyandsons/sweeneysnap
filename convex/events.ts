import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { uploadConfigValidator, displayConfigValidator } from "./validators";

export const list = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const allEvents = await ctx.db.query("events").order("desc").collect();
    const filtered = args.includeArchived
      ? allEvents
      : allEvents.filter((e) => !e.archived);
    // Sort by sortOrder ascending (undefined last), then by _creationTime desc
    return filtered.sort((a, b) => {
      const aOrder = a.sortOrder ?? Infinity;
      const bOrder = b.sortOrder ?? Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b._creationTime - a._creationTime;
    });
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!event || !event.isActive) return null;
    return event;
  },
});

export const getByCrewToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_crewToken", (q) => q.eq("crewToken", args.token))
      .unique();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    presetId: v.optional(v.id("presets")),
    uploadConfig: uploadConfigValidator,
    displayConfig: displayConfigValidator,
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    moderationEnabled: v.boolean(),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("events", {
      ...args,
      crewToken: crypto.randomUUID(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    presetId: v.optional(v.id("presets")),
    uploadConfig: uploadConfigValidator,
    displayConfig: displayConfigValidator,
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    moderationEnabled: v.boolean(),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, { ...data, updatedAt: Date.now() });
  },
});

export const getDisplayBackgroundUrls = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return null;
    const config = event.displayConfig;
    const backgroundImageUrl = config.backgroundImageId
      ? await ctx.storage.getUrl(config.backgroundImageId)
      : null;
    const backgroundVideoUrl = config.backgroundVideoId
      ? await ctx.storage.getUrl(config.backgroundVideoId)
      : null;
    return { backgroundImageUrl, backgroundVideoUrl };
  },
});

export const generateBackgroundUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateDisplayConfig = mutation({
  args: {
    id: v.id("events"),
    displayConfig: displayConfigValidator,
  },
  handler: async (ctx, args) => {
    // No admin check — crew can also update display settings
    await ctx.db.patch(args.id, {
      displayConfig: args.displayConfig,
      updatedAt: Date.now(),
    });
  },
});

export const duplicate = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    // Generate a unique slug
    let newSlug = `${event.slug}-copy`;
    let existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", newSlug))
      .unique();
    let counter = 2;
    while (existing) {
      newSlug = `${event.slug}-copy-${counter}`;
      existing = await ctx.db
        .query("events")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      counter++;
    }

    return await ctx.db.insert("events", {
      slug: newSlug,
      name: `${event.name} (Copy)`,
      description: event.description,
      isActive: false,
      createdBy: event.createdBy,
      presetId: event.presetId,
      crewToken: crypto.randomUUID(),
      uploadConfig: event.uploadConfig,
      displayConfig: event.displayConfig,
      logoUrl: event.logoUrl,
      primaryColor: event.primaryColor,
      moderationEnabled: event.moderationEnabled,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      updatedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    const nowArchived = !event.archived;
    const patch: Record<string, unknown> = {
      archived: nowArchived,
      updatedAt: Date.now(),
    };
    // Auto-deactivate when archiving
    if (nowArchived) {
      patch.isActive = false;
    }
    await ctx.db.patch(args.id, patch);
    return { archived: nowArchived };
  },
});

export const updateSortOrders = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("events"),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const item of args.items) {
      await ctx.db.patch(item.id, { sortOrder: item.sortOrder });
    }
  },
});
