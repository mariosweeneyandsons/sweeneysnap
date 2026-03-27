"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useSignIn, useAuth } from "@clerk/nextjs";
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { signIn } = useSignIn();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "An error occurred." : null;
  const showRequestAccess = errorCode === "no_admin_profile";

  useEffect(() => {
    if (clerkLoaded && isSignedIn && !convexLoading && isAuthenticated && !errorCode) {
      router.replace("/admin");
    }
  }, [clerkLoaded, isSignedIn, convexLoading, isAuthenticated, errorCode, router]);

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    setLoading(true);
    setError(null);
    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
      });
    } catch (err) {
      console.error("[auth] Google sign-in failed:", err);
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold mb-1">SweeneySnap</h1>
        <p className="text-foreground-faint text-sm mb-8">Sign in to the admin panel</p>

        {(errorMessage || error) && (
          <div className="bg-destructive-bg border border-destructive/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-destructive text-sm">{errorMessage || error}</p>
          </div>
        )}

        {showRequestAccess && (
          <div className="mb-6">
            <RequestAccessPanel />
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <svg className="animate-spin h-[18px] w-[18px]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <p className="text-foreground-faint text-xs mt-6">
          Only authorized accounts can access the admin panel.
        </p>
      </div>
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
