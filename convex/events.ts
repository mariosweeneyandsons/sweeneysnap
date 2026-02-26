import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAdminOrCrew, validateStringLength, getEventBySlug } from "./lib";
import { uploadConfigValidator, displayConfigValidator, brandAssetValidator } from "./validators";

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
    const event = await getEventBySlug(ctx, args.slug);
    if (!event || !event.isActive) return null;
    const { crewToken: _ct, ...publicEvent } = event;
    return publicEvent;
  },
});

export const getByCustomDomain = query({
  args: { domain: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_customDomain", (q) => q.eq("customDomain", args.domain))
      .unique();
    if (!event || !event.isActive) return null;
    const { crewToken: _ct, ...publicEvent } = event;
    return publicEvent;
  },
});

export const getBySlugs = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const events = [];
    for (const slug of args.slugs) {
      const event = await getEventBySlug(ctx, slug);
      if (event && event.isActive) {
        const { crewToken: _ct, ...publicEvent } = event;
        events.push(publicEvent);
      }
    }
    return events;
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("events")) },
  handler: async (ctx, args) => {
    const events = [];
    for (const id of args.ids) {
      const event = await ctx.db.get(id);
      if (event && event.isActive) {
        const { crewToken: _ct, ...publicEvent } = event;
        events.push(publicEvent);
      }
    }
    return events;
  },
});

export const getBySlugForGallery = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await getEventBySlug(ctx, args.slug);
    if (!event) return null;
    // Check gallery availability
    const config = event.uploadConfig;
    if (!config.galleryEnabled) return null;
    // Check if gallery should only be available after event ends
    if (config.galleryAvailableAfterEvent && event.endsAt && Date.now() < event.endsAt) {
      return null;
    }
    const { crewToken: _ct, ...publicEvent } = event;
    return publicEvent;
  },
});

export const getByCrewToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_crewToken", (q) => q.eq("crewToken", args.token))
      .unique();
    if (!event) return null;
    const { crewToken: _ct, ...publicEvent } = event;
    return publicEvent;
  },
});

export const getByCrewTokenOrMember = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Try legacy crew token first
    const eventByToken = await ctx.db
      .query("events")
      .withIndex("by_crewToken", (q) => q.eq("crewToken", args.token))
      .unique();
    if (eventByToken) {
      const { crewToken: _ct, ...publicEvent } = eventByToken;
      return { event: publicEvent, crewMember: null };
    }

    // Try crew member token
    const crewMember = await ctx.db
      .query("crewMembers")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (crewMember) {
      const event = await ctx.db.get(crewMember.eventId);
      if (event) {
        const { crewToken: _ct, ...publicEvent } = event;
        return { event: publicEvent, crewMember };
      }
      return { event: null, crewMember };
    }

    return { event: null, crewMember: null };
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
    fontFamily: v.optional(v.string()),
    customCss: v.optional(v.string()),
    moderationEnabled: v.boolean(),
    aiModerationEnabled: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    customDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    validateStringLength(args.slug, "slug", 100);
    validateStringLength(args.name, "name", 200);
    validateStringLength(args.customCss, "customCss", 10000);
    // Normalize and validate custom domain
    const customDomain = args.customDomain?.toLowerCase();
    if (customDomain !== undefined) {
      if (customDomain === "") throw new Error("Custom domain cannot be empty");
      if (/\s/.test(customDomain)) throw new Error("Custom domain cannot contain spaces");
      if (/^https?:\/\//i.test(customDomain)) throw new Error("Custom domain should not include http:// or https://");
    }
    if (customDomain) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_customDomain", (q) => q.eq("customDomain", customDomain))
        .unique();
      if (existing) throw new Error("Custom domain already in use");
    }
    return await ctx.db.insert("events", {
      ...args,
      customDomain,
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
    fontFamily: v.optional(v.string()),
    customCss: v.optional(v.string()),
    moderationEnabled: v.boolean(),
    aiModerationEnabled: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    customDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    validateStringLength(args.slug, "slug", 100);
    validateStringLength(args.name, "name", 200);
    validateStringLength(args.customCss, "customCss", 10000);
    // Normalize and validate custom domain
    const customDomain = args.customDomain?.toLowerCase();
    if (customDomain !== undefined) {
      if (customDomain === "") throw new Error("Custom domain cannot be empty");
      if (/\s/.test(customDomain)) throw new Error("Custom domain cannot contain spaces");
      if (/^https?:\/\//i.test(customDomain)) throw new Error("Custom domain should not include http:// or https://");
    }
    if (customDomain) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_customDomain", (q) => q.eq("customDomain", customDomain))
        .unique();
      if (existing && existing._id !== id) throw new Error("Custom domain already in use");
    }
    await ctx.db.patch(id, { ...data, customDomain, updatedAt: Date.now() });
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
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateDisplayConfig = mutation({
  args: {
    id: v.id("events"),
    displayConfig: displayConfigValidator,
    crewToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.id, args.crewToken);
    validateStringLength(args.displayConfig.tickerText, "tickerText", 500);
    validateStringLength(args.displayConfig.socialOverlay, "socialOverlay", 200);
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
    let existing = await getEventBySlug(ctx, newSlug);
    let counter = 2;
    while (existing) {
      newSlug = `${event.slug}-copy-${counter}`;
      existing = await getEventBySlug(ctx, newSlug);
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
      fontFamily: event.fontFamily,
      customCss: event.customCss,
      assets: event.assets,
      moderationEnabled: event.moderationEnabled,
      aiModerationEnabled: event.aiModerationEnabled,
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

export const updateUploadConfig = mutation({
  args: {
    id: v.id("events"),
    uploadConfig: uploadConfigValidator,
    crewToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.id, args.crewToken);
    await ctx.db.patch(args.id, {
      uploadConfig: args.uploadConfig,
      updatedAt: Date.now(),
    });
  },
});

export const addAsset = mutation({
  args: {
    id: v.id("events"),
    asset: brandAssetValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");
    const assets = event.assets ?? [];
    assets.push(args.asset);
    await ctx.db.patch(args.id, { assets, updatedAt: Date.now() });
  },
});

export const removeAsset = mutation({
  args: {
    id: v.id("events"),
    assetIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");
    const assets = event.assets ?? [];
    if (args.assetIndex < 0 || args.assetIndex >= assets.length) {
      throw new Error("Invalid asset index");
    }
    const removed = assets[args.assetIndex];
    // Delete from storage if it has a storageId
    if (removed.storageId) {
      await ctx.storage.delete(removed.storageId);
    }
    assets.splice(args.assetIndex, 1);
    await ctx.db.patch(args.id, { assets, updatedAt: Date.now() });
  },
});

export const generateAssetUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
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
