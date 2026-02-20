"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function AccountsPage() {
  const profiles = useQuery(api.adminProfiles.list);
  const createAdmin = useMutation(api.adminProfiles.create);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createAdmin({ email, displayName });
      setShowModal(false);
      setEmail("");
      setDisplayName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Accounts</h1>
        <Button onClick={() => setShowModal(true)}>New Account</Button>
      </div>

      <div className="grid gap-4">
        {(profiles || []).map((profile) => (
          <Card key={profile._id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{profile.displayName}</p>
              <p className="text-white/50 text-sm">{profile.role}</p>
            </div>
            <p className="text-white/30 text-sm">
              {new Date(profile._creationTime).toLocaleDateString()}
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
            label="Google Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
