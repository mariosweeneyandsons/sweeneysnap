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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not set, skipping AI moderation");
      return;
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          signal: AbortSignal.timeout(30_000),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  'You are a content moderation system. Analyze the image and determine if it contains inappropriate content. Respond with JSON only: { "flagged": boolean, "categories": string[], "confidence": number }. Categories can include: "nudity", "violence", "drugs", "hate_speech", "offensive_gesture", "weapons". Confidence is 0-1. If the image is a normal selfie or group photo, return flagged: false with empty categories.',
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: imageUrl, detail: "low" },
                  },
                  {
                    type: "text",
                    text: "Analyze this image for content moderation.",
                  },
                ],
              },
            ],
            max_tokens: 200,
          }),
        }
      );

      if (!response.ok) {
        console.error("OpenAI API error:", response.status);
        return;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

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
