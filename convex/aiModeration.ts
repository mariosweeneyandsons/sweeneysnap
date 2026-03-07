"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const moderateWithAi = internalAction({
  args: { selfieId: v.id("selfies") },
  handler: async (ctx, args) => {
    const selfie = await ctx.runQuery(internal.selfies.getById, {
      selfieId: args.selfieId,
    });
    if (!selfie) return;

    const imageUrl = await ctx.storage.getUrl(selfie.storageId);
    if (!imageUrl) return;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not set, skipping AI moderation");
      return;
    }

    try {
      // Fetch the image and convert to base64 for Claude vision
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error("Failed to fetch image:", imageResponse.status);
        return;
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");
      const contentType =
        imageResponse.headers.get("content-type") || "image/jpeg";

      const response = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          signal: AbortSignal.timeout(30_000),
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 200,
            system:
              'You are a content moderation system. Analyze the image and determine if it contains inappropriate content. Respond with JSON only: { "flagged": boolean, "categories": string[], "confidence": number }. Categories can include: "nudity", "violence", "drugs", "hate_speech", "offensive_gesture", "weapons". Confidence is 0-1. If the image is a normal selfie or group photo, return flagged: false with empty categories.',
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: contentType,
                      data: base64Image,
                    },
                  },
                  {
                    type: "text",
                    text: "Analyze this image for content moderation.",
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error("Anthropic API error:", response.status);
        return;
      }

      const data = await response.json();
      const content =
        data.content?.find(
          (b: { type: string }) => b.type === "text"
        )?.text || "";

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Could not parse AI moderation response:", content);
        return;
      }

      const result = JSON.parse(jsonMatch[0]);
      const flagged = result.flagged === true;
      const categories: string[] = Array.isArray(result.categories)
        ? result.categories
        : [];
      const confidence: number =
        typeof result.confidence === "number" ? result.confidence : 0;

      await ctx.runMutation(internal.selfies.updateAiModeration, {
        selfieId: args.selfieId,
        aiModeration: {
          flagged,
          categories,
          confidence,
          autoRejected: flagged,
          analyzedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error("AI moderation failed:", error);
    }
  },
});
