"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { ThemeProvider } from "@/components/admin/ThemeProvider";
import { ShortcutHelpModal } from "@/components/admin/ShortcutHelpModal";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfigWarningBanner } from "@/components/admin/ConfigWarningBanner";
import { useHotkeys, useTwoStrokeHotkeys } from "@/hooks/useHotkeys";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);

  const adminProfile = useQuery(
    api.adminProfiles.getByCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const userIdentity = useQuery(
    api.adminProfiles.getCurrentUserIdentity,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    // Only redirect when BOTH Clerk and Convex confirm no session
    if (!isLoading && !isAuthenticated && clerkLoaded && !isSignedIn) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, clerkLoaded, isSignedIn, router]);

  useEffect(() => {
    if (adminProfile === null) {
      router.push("/admin/login?error=no_admin_profile");
    }
  }, [adminProfile, router]);

  // Auto-close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Global keyboard shortcuts
  const isReady = !isLoading && isAuthenticated && !!adminProfile;
  useHotkeys([
    {
      key: "?",
      enabled: isReady,
      handler: () => setShortcutHelpOpen((v) => !v),
    },
  ]);
  useTwoStrokeHotkeys(
    "g",
    [
      { key: "d", handler: () => router.push("/admin") },
      { key: "p", handler: () => router.push("/admin/presets") },
      { key: "a", handler: () => router.push("/admin/accounts") },
    ],
    isReady
  );

  if (isLoading || !isAuthenticated || adminProfile === undefined) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-foreground-muted rounded-full animate-spin" />
          <p className="text-foreground-muted text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!adminProfile) return null;

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-background text-foreground flex">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <AdminSidebar
            profile={adminProfile}
            userIdentity={userIdentity}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Mobile header bar */}
          <div className="fixed top-0 left-0 right-0 z-20 lg:hidden bg-background border-b border-border px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-xs text-foreground hover:bg-secondary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="font-bold text-foreground">SweeneySnap</span>
          </div>

          <main className="flex-1 p-4 lg:p-6 ml-0 lg:ml-64 mt-14 lg:mt-0">
            <AdminBreadcrumbs />
            <ConfigWarningBanner />
            {children}
          </main>
        </div>
        <ShortcutHelpModal
          open={shortcutHelpOpen}
          onClose={() => setShortcutHelpOpen(false)}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}
