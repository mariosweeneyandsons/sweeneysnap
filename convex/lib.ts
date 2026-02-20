import { QueryCtx, MutationCtx } from "./_generated/server";

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
