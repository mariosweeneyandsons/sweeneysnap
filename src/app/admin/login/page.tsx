"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/Button";

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Authentication failed. Please try again.",
  no_admin_profile: "Your Google account is not authorized. Contact an admin to get access.",
};

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "An error occurred." : null;
  const { signIn } = useAuthActions();

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google");
  };

  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
      <p className="text-white/50 mb-8">Sign in to manage your events</p>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-400 text-sm">{errorMessage}</p>
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
    <main className="min-h-dvh bg-black text-white flex items-center justify-center p-4">
      <Suspense>
        <LoginContent />
      </Suspense>
    </main>
  );
}
