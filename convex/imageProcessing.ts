"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import sharp from "sharp";

export const generateResizedVersions = internalAction({
  args: { selfieId: v.id("selfies") },
  handler: async (ctx, args) => {

    // Get the selfie record
    const selfie = await ctx.runQuery(internal.selfies.getById, {
      selfieId: args.selfieId,
    });
    if (!selfie) return;

    // Download original image from Convex storage
    const imageUrl = await ctx.storage.getUrl(selfie.storageId);
    if (!imageUrl) return;

    const response = await fetch(imageUrl);
    if (!response.ok) return;
    const originalBuffer = Buffer.from(await response.arrayBuffer());

    // Generate thumbnail (200x200)
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(200, 200, { fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer();

    // Generate medium (600x600)
    const mediumBuffer = await sharp(originalBuffer)
      .resize(600, 600, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload both to Convex storage
    const thumbnailBlob = new Blob([new Uint8Array(thumbnailBuffer)], { type: "image/webp" });
    const thumbnailStorageId = await ctx.storage.store(thumbnailBlob);

    const mediumBlob = new Blob([new Uint8Array(mediumBuffer)], { type: "image/webp" });
    const mediumStorageId = await ctx.storage.store(mediumBlob);

    // Update selfie record with new storage IDs
    await ctx.runMutation(internal.selfies.updateStorageIds, {
      selfieId: args.selfieId,
      thumbnailStorageId,
      mediumStorageId,
    });
  },
});
