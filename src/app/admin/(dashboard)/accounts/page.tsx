"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminProfile } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function AccountsPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: true });
    setProfiles(data || []);
  };

  useEffect(() => {
    fetchProfiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Create user via admin API (requires service role — we'll call a server action)
    const res = await fetch("/api/admin/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create account");
      setLoading(false);
      return;
    }

    setShowModal(false);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setLoading(false);
    fetchProfiles();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Accounts</h1>
        <Button onClick={() => setShowModal(true)}>New Account</Button>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{profile.display_name}</p>
              <p className="text-white/50 text-sm">{profile.role}</p>
            </div>
            <p className="text-white/30 text-sm">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Admin Account">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
