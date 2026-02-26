"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const dispatch = internalAction({
  args: {
    eventId: v.id("events"),
    trigger: v.union(
      v.literal("selfie.created"),
      v.literal("selfie.approved"),
      v.literal("selfie.rejected")
    ),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const webhooks = await ctx.runQuery(
      internal.webhooks.getWebhooksForTrigger,
      { eventId: args.eventId, trigger: args.trigger }
    );

    if (webhooks.length === 0) return;

    const body = JSON.stringify({
      trigger: args.trigger,
      timestamp: Date.now(),
      data: args.payload,
    });

    for (const webhook of webhooks) {
      try {
        // HMAC-SHA256 signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(webhook.secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(body)
        );
        const hexSignature = Array.from(new Uint8Array(signature))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-SweeneySnap-Signature": hexSignature,
          },
          body,
        });
      } catch {
        // Webhook delivery failed — silent, non-blocking
      }
    }
  },
});
