"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-dvh bg-background-elevated flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-foreground-muted rounded-full animate-spin" />
        <p className="text-foreground-muted text-sm">Completing sign-in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
