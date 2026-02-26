import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAdminOrCrew } from "./lib";
import { crewActionValidator } from "./validators";

export const listByEvent = query({
  args: { eventId: v.id("events"), crewToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.eventId, args.crewToken);
    const logs = await ctx.db
      .query("crewActivityLog")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .take(200);

    // Resolve crew member names
    return Promise.all(
      logs.map(async (log) => {
        let crewMemberName: string | null = null;
        if (log.crewMemberId) {
          const member = await ctx.db.get(log.crewMemberId);
          crewMemberName = member?.name || null;
        }
        return { ...log, crewMemberName };
      })
    );
  },
});

export const log = mutation({
  args: {
    eventId: v.id("events"),
    crewMemberId: v.optional(v.id("crewMembers")),
    crewToken: v.string(),
    action: crewActionValidator,
    selfieId: v.optional(v.id("selfies")),
  },
  handler: async (ctx, args) => {
    await requireAdminOrCrew(ctx, args.eventId, args.crewToken);
    return await ctx.db.insert("crewActivityLog", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
