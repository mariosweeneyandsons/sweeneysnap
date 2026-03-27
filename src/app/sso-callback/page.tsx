"use client";

import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SSOCallbackPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  // Fallback redirect once both auth systems confirm session
  useEffect(() => {
    if (isLoaded && isSignedIn && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isLoaded, isSignedIn, isAuthenticated, router]);

  return (
    <main className="min-h-dvh bg-background-elevated flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-foreground-muted rounded-full animate-spin" />
        <p className="text-foreground-muted text-sm">Completing sign-in...</p>
      </div>
      <AuthenticateWithRedirectCallback signInForceRedirectUrl="/admin" signUpForceRedirectUrl="/admin" />
    </main>
  );
}
