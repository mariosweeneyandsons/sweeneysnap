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

    for (const selfie of selfies) {
      statusCounts[selfie.status]++;
      totalStorageBytes += selfie.fileSizeBytes ?? 0;

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
    };
  },
});
