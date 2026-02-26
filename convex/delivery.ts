"use node";

import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const updateDeliveryStatus = internalMutation({
  args: {
    selfieId: v.id("selfies"),
    deliveryStatus: v.union(v.literal("sent"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      deliveryStatus: args.deliveryStatus,
    };
    if (args.deliveryStatus === "sent") {
      patch.deliveredAt = Date.now();
    }
    await ctx.db.patch(args.selfieId, patch);
  },
});

export const sendEmail = internalAction({
  args: {
    selfieId: v.id("selfies"),
    email: v.string(),
    imageUrl: v.string(),
    displayName: v.optional(v.string()),
    eventName: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set, email delivery failed");
      await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
        selfieId: args.selfieId,
        deliveryStatus: "failed",
      });
      return;
    }

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);

      // Download image for attachment
      const imageResponse = await fetch(args.imageUrl, {
        signal: AbortSignal.timeout(15_000),
      });
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      const safeName = args.displayName ? escapeHtml(args.displayName) : "";
      const safeEvent = escapeHtml(args.eventName);

      await resend.emails.send({
        from: "SweeneySnap <noreply@sweeneysnap.com>",
        to: args.email,
        subject: `Your selfie from ${args.eventName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="text-align: center;">Your SweeneySnap Selfie!</h1>
            <p style="text-align: center; color: #666;">
              Hey${safeName ? ` ${safeName}` : ""}! Here's your selfie from <strong>${safeEvent}</strong>.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <img src="cid:selfie" alt="Your selfie" style="max-width: 100%; border-radius: 16px;" />
            </div>
            <p style="text-align: center; color: #999; font-size: 12px;">
              Powered by SweeneySnap
            </p>
          </div>
        `,
        attachments: [
          {
            filename: "selfie.webp",
            content: imageBuffer,
            contentId: "selfie",
          },
        ],
      });

      await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
        selfieId: args.selfieId,
        deliveryStatus: "sent",
      });
    } catch (error) {
      console.error("Email delivery failed:", error);
      await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
        selfieId: args.selfieId,
        deliveryStatus: "failed",
      });
    }
  },
});

export const sendSms = internalAction({
  args: {
    selfieId: v.id("selfies"),
    phone: v.string(),
    imageUrl: v.string(),
    eventName: v.string(),
  },
  handler: async (ctx, args) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio credentials not set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER), SMS delivery failed");
      await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
        selfieId: args.selfieId,
        deliveryStatus: "failed",
      });
      return;
    }

    try {
      const twilio = await import("twilio");
      const client = twilio.default(accountSid, authToken);

      await client.messages.create({
        body: `Here's your selfie from ${args.eventName}! 📸`,
        from: fromNumber,
        to: args.phone,
        mediaUrl: [args.imageUrl],
      });

      await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
        selfieId: args.selfieId,
        deliveryStatus: "sent",
      });
    } catch (error) {
      console.error("SMS delivery failed:", error);
      await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
        selfieId: args.selfieId,
        deliveryStatus: "failed",
      });
    }
  },
});
