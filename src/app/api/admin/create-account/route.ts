import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify the caller is an admin
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await serverSupabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, displayName } = await request.json();

  if (!email || !displayName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Use service role to create the admin profile entry
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Look up existing user by email, or create a placeholder
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  if (existingUser) {
    // User already exists in auth — just create the admin profile
    const { error: profileError } = await adminClient
      .from("admin_profiles")
      .insert({
        id: existingUser.id,
        display_name: displayName,
        role: "super_admin",
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  // User doesn't exist yet — create a placeholder that will be linked on first Google sign-in
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (createError || !newUser.user) {
    return NextResponse.json(
      { error: createError?.message || "Failed to create user" },
      { status: 400 }
    );
  }

  // Create admin profile
  const { error: profileError } = await adminClient
    .from("admin_profiles")
    .insert({
      id: newUser.user.id,
      display_name: displayName,
      role: "super_admin",
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
