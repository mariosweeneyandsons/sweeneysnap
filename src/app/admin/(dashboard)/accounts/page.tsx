"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function AccountsPage() {
  const { toast } = useToast();
  const profiles = useQuery(api.adminProfiles.list);
  const pendingRequests = useQuery(api.accessRequests.listPending);
  const currentAdmin = useQuery(api.adminProfiles.getByCurrentUser);
  const createAdmin = useMutation(api.adminProfiles.create);
  const removeAdmin = useMutation(api.adminProfiles.remove);
  const approveRequest = useMutation(api.accessRequests.approve);
  const denyRequest = useMutation(api.accessRequests.deny);

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove admin confirmation state
  const [removeTarget, setRemoveTarget] = useState<{ id: Id<"adminProfiles">; name: string } | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createAdmin({ email, displayName });
      setShowModal(false);
      setEmail("");
      setDisplayName("");
      toast("Admin account created", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      await removeAdmin({ id: removeTarget.id });
      setRemoveTarget(null);
      toast("Admin account removed", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove admin", "error");
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Accounts</h1>
        <Button onClick={() => setShowModal(true)}>New Account</Button>
      </div>

      {/* Pending Access Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="grid gap-3">
            {pendingRequests.map((request) => (
              <Card
                key={request._id}
                className="flex items-center justify-between border-warning/30"
              >
                <div>
                  <p className="font-medium">{request.displayName}</p>
                  <p className="text-foreground-muted text-sm">{request.email}</p>
                  <p className="text-foreground-faint text-xs">
                    Requested{" "}
                    {new Date(request.requestedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await approveRequest({ requestId: request._id });
                        toast("Access approved — admin profile created", "success");
                      } catch (err) {
                        toast(
                          err instanceof Error ? err.message : "Failed to approve",
                          "error"
                        );
                      }
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      try {
                        await denyRequest({ requestId: request._id });
                        toast("Request denied", "success");
                      } catch (err) {
                        toast(
                          err instanceof Error ? err.message : "Failed to deny",
                          "error"
                        );
                      }
                    }}
                  >
                    Deny
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Admin Profiles */}
      <div className="grid gap-4">
        {(profiles || []).map((profile) => {
          const isSelf = currentAdmin?._id === profile._id;
          return (
            <Card key={profile._id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {profile.displayName}
                  {isSelf && (
                    <span className="ml-2 text-xs text-success">(you)</span>
                  )}
                </p>
                <p className="text-foreground-muted text-sm">{profile.email}</p>
                <p className="text-foreground-muted text-sm">{profile.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-foreground-faint text-sm">
                  {new Date(profile._creationTime).toLocaleDateString()}
                </p>
                {!isSelf && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setRemoveTarget({ id: profile._id, name: profile.displayName })
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Admin Modal */}
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
          {error && <p className="text-destructive text-sm">{error}</p>}
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

      {/* Remove Admin Confirmation Modal */}
      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove Admin Account"
      >
        <div className="flex flex-col gap-4">
          <p className="text-foreground-muted">
            Remove <strong>{removeTarget?.name}</strong> from admin accounts? They will
            lose all admin access immediately.
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={removeLoading} onClick={handleRemoveAdmin}>
              Remove Admin
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
