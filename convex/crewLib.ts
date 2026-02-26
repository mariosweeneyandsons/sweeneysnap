import { QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export async function resolveCrewAccess(
  ctx: QueryCtx,
  token: string
): Promise<{
  event: Doc<"events"> | null;
  crewMember: Doc<"crewMembers"> | null;
  isLegacy: boolean;
}> {
  // Try legacy crew token first
  const eventByToken = await ctx.db
    .query("events")
    .withIndex("by_crewToken", (q) => q.eq("crewToken", token))
    .unique();
  if (eventByToken) {
    return { event: eventByToken, crewMember: null, isLegacy: true };
  }

  // Try crew member token
  const crewMember = await ctx.db
    .query("crewMembers")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (crewMember) {
    const event = await ctx.db.get(crewMember.eventId);
    return { event, crewMember, isLegacy: false };
  }

  return { event: null, crewMember: null, isLegacy: false };
}
