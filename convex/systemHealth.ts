"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const getConfigStatus = action({
  args: {},
  handler: async (ctx) => {
    // Inline admin auth check (actions can't use requireAdmin directly)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.runQuery(api.adminProfiles.getByCurrentUser, {});
    if (!admin) throw new Error("Not authorized");

    return {
      email: !!process.env.RESEND_API_KEY,
      aiModeration: !!process.env.OPENAI_API_KEY,
      // Temporary debug fields — remove after OAuth fix
      _debug: {
        hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
        hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
        googleIdPrefix: process.env.AUTH_GOOGLE_ID?.substring(0, 8) ?? "undefined",
        nodeRuntime: true,
      },
    };
  },
});
