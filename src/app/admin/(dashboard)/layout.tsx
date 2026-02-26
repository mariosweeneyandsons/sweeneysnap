"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const adminProfile = useQuery(
    api.adminProfiles.getByCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const userIdentity = useQuery(
    api.adminProfiles.getCurrentUserIdentity,
    isAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (adminProfile === null) {
      router.push("/admin/login?error=no_admin_profile");
    }
  }, [adminProfile, router]);

  if (isLoading || !isAuthenticated || adminProfile === undefined) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!adminProfile) return null;

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-black text-white flex">
        <AdminSidebar profile={adminProfile} userIdentity={userIdentity} />
        <main className="flex-1 p-6 ml-64">
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
