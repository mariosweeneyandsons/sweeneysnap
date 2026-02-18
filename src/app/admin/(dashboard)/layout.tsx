import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Login page doesn't need auth guard (handled by middleware too, but this is belt-and-suspenders)
  if (!user) {
    redirect("/admin/login");
  }

  // Verify admin profile exists
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-black text-white flex">
      <AdminSidebar profile={profile} />
      <main className="flex-1 p-6 ml-64">
        {children}
      </main>
    </div>
  );
}
