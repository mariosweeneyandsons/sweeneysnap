"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { compressImage } from "@/lib/compression";
import { getSessionId } from "@/lib/session";
import { Id } from "../../convex/_generated/dataModel";

type UploadState = "idle" | "compressing" | "uploading" | "saving" | "done" | "error";

interface UseImageUploadOptions {
  maxFileSizeMb?: number;
}

interface UseImageUploadReturn {
  state: UploadState;
  progress: string;
  error: string | null;
  uploadCount: number;
  limitReached: boolean;
  upload: (file: File, eventId: string, displayName?: string, message?: string, moderationEnabled?: boolean) => Promise<void>;
  reset: () => void;
  setLimitReached: (v: boolean) => void;
}

export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const generateUploadUrlForEvent = useMutation(api.selfies.generateUploadUrlForEvent);
  const createSelfie = useMutation(api.selfies.create);

  const upload = async (
    file: File,
    eventId: string,
    displayName?: string,
    message?: string,
    moderationEnabled?: boolean
  ) => {
    try {
      setError(null);

      // Compress
      setState("compressing");
      setProgress("Compressing image...");
      const compressed = await compressImage(file, {
        maxSizeMB: options?.maxFileSizeMb ?? 0.2,
      });

      // Upload to Convex storage (rate-limited)
      setState("uploading");
      setProgress("Uploading...");
      const sessionId = getSessionId();

      let uploadUrl: string;
      try {
        uploadUrl = await generateUploadUrlForEvent({
          eventId: eventId as Id<"events">,
          sessionId,
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes("Upload limit reached")) {
          setLimitReached(true);
          throw err;
        }
        throw err;
      }

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      // Save to database
      setState("saving");
      setProgress("Saving...");

      await createSelfie({
        eventId: eventId as Id<"events">,
        storageId,
        displayName: displayName || undefined,
        message: message || undefined,
        status: moderationEnabled ? "pending" : "approved",
        fileSizeBytes: compressed.size,
        sessionId,
      });

      setUploadCount((c) => c + 1);
      setState("done");
      setProgress("Done!");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const reset = () => {
    setState("idle");
    setProgress("");
    setError(null);
  };

  return { state, progress, error, uploadCount, limitReached, upload, reset, setLimitReached };
}
