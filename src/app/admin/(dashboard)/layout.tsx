"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
      <div className="min-h-dvh bg-black flex items-center justify-center text-white/50">
        Loading...
      </div>
    );
  }

  if (!adminProfile) return null;

  return (
    <div className="min-h-dvh bg-black text-white flex">
      <AdminSidebar profile={adminProfile} />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  );
}
