"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Authentication failed. Please try again.",
  no_admin_profile: "Your Google account is not authorized.",
};

function RequestAccessPanel() {
  const identity = useQuery(api.adminProfiles.getCurrentUserIdentity);
  const myRequest = useQuery(api.accessRequests.getMyRequest);
  const requestAccess = useMutation(api.accessRequests.requestAccess);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Not authenticated yet — nothing to show
  if (identity === undefined || identity === null) return null;

  const handleRequest = async () => {
    setLoading(true);
    try {
      await requestAccess();
      setSent(true);
    } catch {
      // Already handled by Convex
    } finally {
      setLoading(false);
    }
  };

  if (myRequest?.status === "approved") {
    return (
      <div className="bg-success-bg border border-success/30 rounded-lg px-4 py-3">
        <p className="text-success text-sm font-medium">Your request was approved! Try signing in again.</p>
      </div>
    );
  }

  if (myRequest?.status === "denied") {
    return (
      <div className="bg-destructive-bg border border-destructive/30 rounded-lg px-4 py-3">
        <p className="text-destructive text-sm">Your access request was denied.</p>
      </div>
    );
  }

  if (myRequest?.status === "pending" || sent) {
    return (
      <div className="bg-warning-bg border border-warning/30 rounded-lg px-4 py-3">
        <p className="text-warning text-sm font-medium">Request pending</p>
        <p className="text-foreground-muted text-sm mt-1">
          You&apos;ll get access once an admin approves your request.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        {identity.image && (
          <img
            src={identity.image}
            alt=""
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="text-left">
          {identity.name && <p className="text-sm font-medium">{identity.name}</p>}
          {identity.email && <p className="text-foreground-muted text-xs">{identity.email}</p>}
        </div>
      </div>
      <Button
        onClick={handleRequest}
        loading={loading}
        variant="ghost"
        className="w-full"
      >
        Request Access
      </Button>
    </div>
  );
}

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "An error occurred." : null;
  const showRequestAccess = errorCode === "no_admin_profile";

  const { signIn } = useAuthActions();

  // Redirect to admin dashboard once authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && !errorCode) {
      router.replace("/admin");
    }
  }, [authLoading, isAuthenticated, errorCode, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Clear any stale Convex auth verifiers from localStorage
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("__convexAuth")) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
    try {
      await signIn("google", { redirectTo: "/admin/login" });
    } catch (error) {
      console.error("[auth] signIn failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
      <p className="text-foreground-faint mb-8">Sign in to manage your events</p>

      {errorMessage && (
        <div className="bg-destructive-bg border border-destructive/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-destructive text-sm">{errorMessage}</p>
        </div>
      )}

      {showRequestAccess && (
        <div className="mb-6">
          <RequestAccessPanel />
        </div>
      )}

      <Button
        onClick={handleGoogleLogin}
        loading={loading}
        size="lg"
        className="w-full"
      >
        Sign in with Google
      </Button>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-dvh bg-background-elevated text-foreground flex items-center justify-center p-4">
      <Suspense>
        <LoginContent />
      </Suspense>
    </main>
  );
}
