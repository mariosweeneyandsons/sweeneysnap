import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const getByCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("adminProfiles")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("adminProfiles").collect();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("adminProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) throw new Error("Admin profile already exists for this email");

    return await ctx.db.insert("adminProfiles", {
      email: args.email,
      displayName: args.displayName,
      role: "super_admin",
    });
  },
});
