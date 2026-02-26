"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getSessionId } from "@/lib/session";
import {
  enqueue,
  dequeueAll,
  remove,
  count as getCount,
  type QueuedUpload,
} from "@/lib/offlineQueue";

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState(0);
  const [flushing, setFlushing] = useState(false);

  const generateUploadUrlForEvent = useMutation(api.selfies.generateUploadUrlForEvent);
  const createSelfie = useMutation(api.selfies.create);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Refresh queue count
  const refreshCount = useCallback(async () => {
    try {
      const c = await getCount();
      setQueueCount(c);
    } catch {
      // IndexedDB not available
    }
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Enqueue a failed upload
  const enqueueUpload = useCallback(
    async (
      blob: Blob,
      eventId: string,
      displayName?: string,
      message?: string,
      moderationEnabled = false
    ) => {
      await enqueue(blob, { eventId, displayName, message, moderationEnabled });
      await refreshCount();
    },
    [refreshCount]
  );

  // Flush all queued uploads
  const flushQueue = useCallback(async () => {
    if (flushing || !navigator.onLine) return;
    setFlushing(true);

    try {
      const items: QueuedUpload[] = await dequeueAll();
      for (const item of items) {
        try {
          const sessionId = getSessionId();
          const uploadUrl = await generateUploadUrlForEvent({
            eventId: item.eventId as Id<"events">,
            sessionId,
          });

          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": item.blob.type || "image/webp" },
            body: item.blob,
          });
          if (!result.ok) continue;
          const { storageId } = await result.json();

          await createSelfie({
            eventId: item.eventId as Id<"events">,
            storageId,
            displayName: item.displayName || undefined,
            message: item.message || undefined,
            status: item.moderationEnabled ? "pending" : "approved",
            fileSizeBytes: item.blob.size,
            sessionId,
          });

          await remove(item.id);
        } catch (err) {
          console.warn(`[OfflineQueue] Failed to flush item ${item.id}:`, err);
        }
      }
    } finally {
      await refreshCount();
      setFlushing(false);
    }
  }, [flushing, generateUploadUrlForEvent, createSelfie, refreshCount]);

  // Auto-flush when coming back online
  useEffect(() => {
    if (isOnline && queueCount > 0) {
      flushQueue();
    }
  }, [isOnline, queueCount, flushQueue]);

  return { isOnline, queueCount, enqueueUpload, flushQueue, flushing };
}
