"use client";

interface OfflineQueueIndicatorProps {
  isOnline: boolean;
  queueCount: number;
  flushing: boolean;
}

export function OfflineQueueIndicator({
  isOnline,
  queueCount,
  flushing,
}: OfflineQueueIndicatorProps) {
  if (queueCount === 0 && isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline && (
        <div className="bg-warning text-foreground-emphasis text-center text-sm py-1.5 px-4">
          <svg
            className="inline-block w-4 h-4 mr-1.5 -mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0"
            />
          </svg>
          You&apos;re offline
          {queueCount > 0 && ` — ${queueCount} photo${queueCount > 1 ? "s" : ""} queued`}
        </div>
      )}
      {isOnline && queueCount > 0 && (
        <div className="bg-primary text-foreground-emphasis text-center text-sm py-1.5 px-4">
          {flushing
            ? `Uploading ${queueCount} queued photo${queueCount > 1 ? "s" : ""}...`
            : `${queueCount} photo${queueCount > 1 ? "s" : ""} queued — will upload shortly`}
        </div>
      )}
    </div>
  );
}
