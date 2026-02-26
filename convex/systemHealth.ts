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
      sms:
        !!process.env.TWILIO_ACCOUNT_SID &&
        !!process.env.TWILIO_AUTH_TOKEN &&
        !!process.env.TWILIO_PHONE_NUMBER,
      aiModeration: !!process.env.OPENAI_API_KEY,
    };
  },
});
