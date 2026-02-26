"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";

export function ConfigWarningBanner() {
  const getConfigStatus = useAction(api.systemHealth.getConfigStatus);
  const [status, setStatus] = useState<{
    email: boolean;
    sms: boolean;
    aiModeration: boolean;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getConfigStatus().then(setStatus).catch(() => {});
  }, [getConfigStatus]);

  if (!status || dismissed) return null;

  const missing: string[] = [];
  if (!status.email) missing.push("Email delivery (Resend)");
  if (!status.sms) missing.push("SMS delivery (Twilio)");
  if (!status.aiModeration) missing.push("AI moderation (OpenAI)");

  if (missing.length === 0) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xs border border-warning/20 bg-warning-bg px-4 py-3">
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-warning"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <div className="flex-1 text-sm">
        <p className="font-medium text-warning">Missing API keys</p>
        <p className="mt-1 text-foreground-muted">
          The following services are configured in code but won&apos;t work
          until their API keys are added to your Convex environment:
        </p>
        <ul className="mt-1.5 list-inside list-disc text-foreground-muted">
          {missing.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-xs p-1 text-foreground-muted transition-colors hover:bg-secondary hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
