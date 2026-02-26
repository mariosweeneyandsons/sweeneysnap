"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface ShareButtonsProps {
  selfieId: string;
  imageUrl: string;
  shareText?: string;
  shareHashtag?: string;
  eventName: string;
}

export function ShareButtons({
  selfieId,
  imageUrl,
  shareText,
  shareHashtag,
  eventName,
}: ShareButtonsProps) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const selfieUrl = `${siteUrl}/selfie/${selfieId}`;
  const text = shareText || `Check out my selfie from ${eventName}!`;
  const hashtag = shareHashtag || "SweeneySnap";

  const handleWebShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      // Try sharing with file
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "selfie.webp", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ text, url: selfieUrl, files: [file] });
        return;
      }
    } catch {
      // fallback to URL-only share
    }
    try {
      await navigator.share({ text, url: selfieUrl });
    } catch {
      // User cancelled or share failed
    }
  }, [imageUrl, text, selfieUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(selfieUrl);
    } catch {
      // Clipboard API not available
    }
  }, [selfieUrl]);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(selfieUrl)}&hashtags=${encodeURIComponent(hashtag)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selfieUrl)}`;

  const supportsWebShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-sm text-center" style={{ opacity: 0.6 }}>
        Share your selfie
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        {supportsWebShare && (
          <Button onClick={handleWebShare} variant="secondary" size="sm">
            Share
          </Button>
        )}
        <Button
          onClick={() => window.open(twitterUrl, "_blank")}
          variant="secondary"
          size="sm"
        >
          Twitter
        </Button>
        <Button
          onClick={() => window.open(facebookUrl, "_blank")}
          variant="secondary"
          size="sm"
        >
          Facebook
        </Button>
        <Button onClick={handleCopyLink} variant="secondary" size="sm">
          Copy Link
        </Button>
      </div>
    </div>
  );
}
