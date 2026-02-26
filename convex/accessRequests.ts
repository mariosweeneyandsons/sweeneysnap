import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const requestAccess = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = identity.email!;
    const displayName = identity.name ?? email;

    // Check for existing request
    const existing = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      if (existing.status === "pending") return existing._id;
      if (existing.status === "approved") throw new Error("Already approved");
      // If denied, allow re-request by updating
      await ctx.db.patch(existing._id, {
        status: "pending",
        displayName,
        requestedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(0, internal.delivery.sendAccessRequestEmail, {
        email,
        displayName,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("accessRequests", {
      email,
      displayName,
      status: "pending",
      requestedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.delivery.sendAccessRequestEmail, {
      email,
      displayName,
    });

    return id;
  },
});

export const getMyRequest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("accessRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const approve = mutation({
  args: { requestId: v.id("accessRequests") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request is not pending");

    await ctx.db.patch(args.requestId, { status: "approved" });

    // Check if admin profile already exists
    const existing = await ctx.db
      .query("adminProfiles")
      .withIndex("by_email", (q) => q.eq("email", request.email))
      .unique();
    if (!existing) {
      await ctx.db.insert("adminProfiles", {
        email: request.email,
        displayName: request.displayName,
        role: "super_admin",
      });
    }
  },
});

export const deny = mutation({
  args: { requestId: v.id("accessRequests") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request is not pending");

    await ctx.db.patch(args.requestId, { status: "denied" });
  },
});
