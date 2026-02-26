"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { compressImage } from "@/lib/compression";
import { getSessionId } from "@/lib/session";
import { Id } from "../../convex/_generated/dataModel";

type UploadState = "idle" | "compressing" | "uploading" | "saving" | "done" | "error" | "queued";

interface UseImageUploadOptions {
  maxFileSizeMb?: number;
  onOfflineQueue?: (blob: Blob, eventId: string, displayName?: string, message?: string, moderationEnabled?: boolean) => Promise<void>;
}

interface UseImageUploadReturn {
  state: UploadState;
  progress: string;
  error: string | null;
  uploadCount: number;
  limitReached: boolean;
  selfieId: string | null;
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
  const [selfieId, setSelfieId] = useState<string | null>(null);

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
      setSelfieId(null);

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
        // Offline: queue the compressed blob
        if (typeof navigator !== "undefined" && !navigator.onLine && options?.onOfflineQueue) {
          await options.onOfflineQueue(compressed, eventId, displayName, message, moderationEnabled);
          setState("queued");
          setProgress("Saved offline");
          return;
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

      const id = await createSelfie({
        eventId: eventId as Id<"events">,
        storageId,
        displayName: displayName || undefined,
        message: message || undefined,
        status: moderationEnabled ? "pending" : "approved",
        fileSizeBytes: compressed.size,
        sessionId,
      });

      setSelfieId(id);
      setUploadCount((c) => c + 1);
      setState("done");
      setProgress("Done!");
    } catch (err) {
      // Offline fallback for network errors
      if (typeof navigator !== "undefined" && !navigator.onLine && options?.onOfflineQueue) {
        try {
          const compressed = await compressImage(file, {
            maxSizeMB: options?.maxFileSizeMb ?? 0.2,
          });
          await options.onOfflineQueue(compressed, eventId, displayName, message, moderationEnabled);
          setState("queued");
          setProgress("Saved offline");
          return;
        } catch {
          // Fall through to error state
        }
      }
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const reset = () => {
    setState("idle");
    setProgress("");
    setError(null);
    setSelfieId(null);
  };

  return { state, progress, error, uploadCount, limitReached, selfieId, upload, reset, setLimitReached };
}
