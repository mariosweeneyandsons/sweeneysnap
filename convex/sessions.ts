import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";
import { getAuthSessionId } from "@convex-dev/auth/server";

export const listAdminSessions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const currentSessionId = await getAuthSessionId(ctx);
    const now = Date.now();

    const adminProfiles = await ctx.db.query("adminProfiles").collect();
    const linkedProfiles = adminProfiles.filter((p) => p.userId != null);

    const sessions: {
      sessionId: string;
      userId: string;
      displayName: string;
      email: string;
      role: string;
      createdAt: number;
      expiresAt: number;
      isCurrentSession: boolean;
    }[] = [];

    for (const profile of linkedProfiles) {
      const userSessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", profile.userId!))
        .collect();

      for (const session of userSessions) {
        if (session.expirationTime < now) continue;

        sessions.push({
          sessionId: session._id,
          userId: profile.userId!,
          displayName: profile.displayName,
          email: profile.email,
          role: profile.role,
          createdAt: session._creationTime,
          expiresAt: session.expirationTime,
          isCurrentSession: session._id === currentSessionId,
        });
      }
    }

    return {
      sessions,
      unlinkedCount: adminProfiles.length - linkedProfiles.length,
    };
  },
});

export const forceDeleteSession = mutation({
  args: { sessionId: v.id("authSessions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Delete all refresh tokens for this session
    const refreshTokens = await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    for (const token of refreshTokens) {
      await ctx.db.delete(token._id);
    }

    // Delete the session itself
    await ctx.db.delete(args.sessionId);
  },
});

export const forceDeleteAllUserSessions = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const userSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const session of userSessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const token of refreshTokens) {
        await ctx.db.delete(token._id);
      }
      await ctx.db.delete(session._id);
    }
  },
});
