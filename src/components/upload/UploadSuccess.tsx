"use client";

import { Button } from "@/components/ui/Button";
import { ShareButtons } from "./ShareButtons";

interface UploadSuccessProps {
  successText?: string;
  moderationEnabled?: boolean;
  onUploadAnother: () => void;
  uploadCount?: number;
  maxUploads?: number;
  multiPhotoEnabled?: boolean;
  limitReached?: boolean;
  primaryColor?: string;
  selfieId?: string;
  imageUrl?: string;
  shareEnabled?: boolean;
  shareText?: string;
  shareHashtag?: string;
  eventName?: string;
}

export function UploadSuccess({
  successText,
  moderationEnabled,
  onUploadAnother,
  uploadCount = 1,
  maxUploads = 10,
  multiPhotoEnabled = true,
  limitReached = false,
  primaryColor,
  selfieId,
  imageUrl,
  shareEnabled,
  shareText,
  shareHashtag,
  eventName,
}: UploadSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: primaryColor ? `${primaryColor}33` : "rgba(34,197,94,0.2)" }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke={primaryColor || "#4ade80"}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-xl font-semibold">
        {successText || "Your selfie is on the wall!"}
      </p>
      {multiPhotoEnabled && (
        <p className="text-sm" style={{ opacity: 0.5 }}>
          Photo {uploadCount} of {maxUploads} uploaded
        </p>
      )}
      <p style={{ opacity: 0.5 }}>
        {moderationEnabled
          ? "Your selfie will appear once it's been approved."
          : "Look for it on the big screen."}
      </p>

      {shareEnabled && selfieId && imageUrl && eventName && (
        <ShareButtons
          selfieId={selfieId}
          imageUrl={imageUrl}
          shareText={shareText}
          shareHashtag={shareHashtag}
          eventName={eventName}
        />
      )}

      {limitReached ? (
        <p className="text-sm font-medium" style={{ opacity: 0.6 }}>
          You&apos;ve reached the upload limit. Thanks for participating!
        </p>
      ) : (
        multiPhotoEnabled && (
          <Button
            onClick={onUploadAnother}
            variant="secondary"
            size="lg"
            style={primaryColor ? { borderColor: primaryColor, color: primaryColor } : undefined}
          >
            Take Another
          </Button>
        )
      )}
      {!multiPhotoEnabled && !limitReached && (
        <Button
          onClick={onUploadAnother}
          variant="secondary"
          size="lg"
          style={primaryColor ? { borderColor: primaryColor, color: primaryColor } : undefined}
        >
          Take Another
        </Button>
      )}
    </div>
  );
}
