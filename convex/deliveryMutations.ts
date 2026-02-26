import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
