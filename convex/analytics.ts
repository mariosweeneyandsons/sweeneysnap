import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const getEventAnalytics = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    let totalStorageBytes = 0;
    const hourlyBuckets: Record<string, number> = {};
    const sessionIds = new Set<string>();

    for (const selfie of selfies) {
      statusCounts[selfie.status]++;
      totalStorageBytes += selfie.fileSizeBytes ?? 0;
      if (selfie.sessionId) sessionIds.add(selfie.sessionId);

      // Bucket by hour
      const date = new Date(selfie._creationTime);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
      hourlyBuckets[hourKey] = (hourlyBuckets[hourKey] || 0) + 1;
    }

    // Build timeline sorted by time
    const timeline = Object.entries(hourlyBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour, count }));

    // Find peak hour
    let peakHour = "";
    let peakCount = 0;
    for (const entry of timeline) {
      if (entry.count > peakCount) {
        peakCount = entry.count;
        peakHour = entry.hour;
      }
    }

    // Calculate average per hour (only hours that had uploads)
    const averagePerHour =
      timeline.length > 0
        ? Math.round(selfies.length / timeline.length)
        : 0;

    return {
      totalSelfies: selfies.length,
      statusCounts,
      timeline,
      peakHour,
      totalStorageBytes,
      averagePerHour,
      uniqueUploaders: sessionIds.size,
    };
  },
});

export const getCrewActivity = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const logs = await ctx.db
      .query("crewActivityLog")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    if (logs.length === 0) {
      return { totalActions: 0, actionCounts: {}, mostActiveName: null, mostActiveCount: 0 };
    }

    const actionCounts: Record<string, number> = {};
    const crewCounts: Record<string, number> = {};

    for (const log of logs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      crewCounts[log.crewToken] = (crewCounts[log.crewToken] || 0) + 1;
    }

    // Find most active crew member
    let mostActiveToken = "";
    let mostActiveCount = 0;
    for (const [token, count] of Object.entries(crewCounts)) {
      if (count > mostActiveCount) {
        mostActiveToken = token;
        mostActiveCount = count;
      }
    }

    // Look up crew member name
    let mostActiveName: string | null = null;
    if (mostActiveToken) {
      const member = await ctx.db
        .query("crewMembers")
        .withIndex("by_token", (q) => q.eq("token", mostActiveToken))
        .first();
      mostActiveName = member?.name ?? null;
    }

    return {
      totalActions: logs.length,
      actionCounts,
      mostActiveName,
      mostActiveCount,
    };
  },
});

export const getAiModerationStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    let analyzed = 0;
    let flagged = 0;
    let autoRejected = 0;
    const categoryCounts: Record<string, number> = {};

    for (const selfie of selfies) {
      if (!selfie.aiModeration) continue;
      analyzed++;
      if (selfie.aiModeration.flagged) {
        flagged++;
        for (const cat of selfie.aiModeration.categories) {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
      }
      if (selfie.aiModeration.autoRejected) {
        autoRejected++;
      }
    }

    // Estimate false positives: flagged items that were later approved
    const falsePositiveEstimate = selfies.filter(
      (s) => s.aiModeration?.flagged && s.status === "approved"
    ).length;

    return {
      analyzed,
      flagged,
      autoRejected,
      falsePositiveEstimate,
      categoryCounts,
      hasData: analyzed > 0,
    };
  },
});

export const getHighlightSelfies = query({
  args: {
    eventId: v.id("events"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 6;
    const selfies = await ctx.db
      .query("selfies")
      .withIndex("by_eventId_status", (q) =>
        q.eq("eventId", args.eventId).eq("status", "approved")
      )
      .order("desc")
      .take(limit);

    const results = [];
    for (const selfie of selfies) {
      const url = await ctx.storage.getUrl(selfie.storageId);
      results.push({
        _id: selfie._id,
        displayName: selfie.displayName,
        imageUrl: url,
      });
    }

    return results;
  },
});
