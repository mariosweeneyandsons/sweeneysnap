"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const getConfigStatus = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.runQuery(api.adminProfiles.getByCurrentUser, {});
    if (!admin) throw new Error("Not authorized");

    return {
      email: !!process.env.RESEND_API_KEY,
      aiModeration: !!process.env.OPENAI_API_KEY,
    };
  },
});
