import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const admin = await ctx.db
    .query("adminProfiles")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();
  if (!admin) throw new Error("Not authorized");

  return { identity, admin };
}

export async function requireAdminOrCrew(
  ctx: QueryCtx | MutationCtx,
  eventId: Id<"events">,
  crewToken?: string
) {
  // Try admin auth first
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const admin = await ctx.db
      .query("adminProfiles")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();
    if (admin) return { type: "admin" as const, admin };
  }
  // Fall back to crew token
  if (crewToken) {
    const event = await ctx.db.get(eventId);
    if (event && event.crewToken === crewToken) {
      return { type: "crew" as const };
    }
    // Also check crew member tokens
    const member = await ctx.db
      .query("crewMembers")
      .withIndex("by_token", (q) => q.eq("token", crewToken))
      .unique();
    if (member && member.eventId === eventId) {
      return { type: "crew" as const, member };
    }
  }
  throw new Error("Not authorized");
}

export function validateStringLength(
  value: string | undefined,
  field: string,
  maxLength: number
) {
  if (value && value.length > maxLength) {
    throw new Error(`${field} exceeds maximum length of ${maxLength} characters`);
  }
}
