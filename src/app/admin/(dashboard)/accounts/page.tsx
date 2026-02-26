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
  const sessionsData = useQuery(api.sessions.listAdminSessions);
  const createAdmin = useMutation(api.adminProfiles.create);
  const forceDeleteSession = useMutation(api.sessions.forceDeleteSession);
  const forceDeleteAllUserSessions = useMutation(
    api.sessions.forceDeleteAllUserSessions
  );

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force logout confirmation state
  const [confirmTarget, setConfirmTarget] = useState<
    | { type: "session"; sessionId: Id<"authSessions">; isCurrentSession: boolean; label: string }
    | { type: "allUserSessions"; userId: Id<"users">; label: string }
    | null
  >(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

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

  const handleForceLogout = async () => {
    if (!confirmTarget) return;
    setLogoutLoading(true);
    setLogoutError(null);

    try {
      if (confirmTarget.type === "session") {
        await forceDeleteSession({ sessionId: confirmTarget.sessionId });
      } else {
        await forceDeleteAllUserSessions({ userId: confirmTarget.userId });
      }
      setConfirmTarget(null);
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Failed to force logout"
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  // Group sessions by userId for "Logout All" button
  type SessionItem = NonNullable<typeof sessionsData>["sessions"][number];
  const sessionsByUser = new Map<string, SessionItem[]>();
  if (sessionsData?.sessions) {
    for (const s of sessionsData.sessions) {
      const existing = sessionsByUser.get(s.userId) || [];
      existing.push(s);
      sessionsByUser.set(s.userId, existing);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Accounts</h1>
        <Button onClick={() => setShowModal(true)}>New Account</Button>
      </div>

      {/* Admin Profiles */}
      <div className="grid gap-4">
        {(profiles || []).map((profile) => (
          <Card key={profile._id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{profile.displayName}</p>
              <p className="text-foreground-muted text-sm">{profile.email}</p>
              <p className="text-foreground-muted text-sm">{profile.role}</p>
            </div>
            <p className="text-foreground-faint text-sm">
              {new Date(profile._creationTime).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>

      {/* Active Sessions */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Active Sessions</h2>

        {sessionsData?.unlinkedCount ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-yellow-400 text-sm">
              {sessionsData.unlinkedCount} admin profile
              {sessionsData.unlinkedCount > 1 ? "s are" : " is"} not linked to a
              user account yet. They need to sign in at least once to appear here.
            </p>
          </div>
        ) : null}

        {sessionsData?.sessions.length === 0 && (
          <p className="text-foreground-faint text-sm">No active sessions.</p>
        )}

        <div className="grid gap-4">
          {Array.from(sessionsByUser.entries()).map(([userId, userSessions]) => (
            <Card key={userId}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">{userSessions[0].displayName}</p>
                  <p className="text-foreground-muted text-sm">{userSessions[0].email}</p>
                </div>
                {userSessions.length > 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setConfirmTarget({
                        type: "allUserSessions",
                        userId: userId as Id<"users">,
                        label: userSessions[0].displayName,
                      })
                    }
                  >
                    Logout All ({userSessions.length})
                  </Button>
                )}
              </div>

              <div className="grid gap-3">
                {userSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between rounded-lg border border-border bg-input-bg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {session.isCurrentSession && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                          (you)
                        </span>
                      )}
                      <div className="text-sm text-foreground-faint">
                        <span>
                          Created{" "}
                          {new Date(session.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
                          )}
                        </span>
                        <span className="mx-2">·</span>
                        <span>
                          Expires{" "}
                          {new Date(session.expiresAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setConfirmTarget({
                          type: "session",
                          sessionId: session.sessionId as Id<"authSessions">,
                          isCurrentSession: session.isCurrentSession,
                          label: session.displayName,
                        })
                      }
                    >
                      Force Logout
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
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

      {/* Force Logout Confirmation Modal */}
      <Modal
        open={confirmTarget !== null}
        onClose={() => {
          setConfirmTarget(null);
          setLogoutError(null);
        }}
        title="Confirm Force Logout"
      >
        <div className="flex flex-col gap-4">
          {confirmTarget?.type === "session" && confirmTarget.isCurrentSession && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm font-medium">
                This is your current session. You will be logged out immediately.
              </p>
            </div>
          )}
          <p className="text-foreground-muted">
            {confirmTarget?.type === "allUserSessions"
              ? `Remove all sessions for ${confirmTarget.label}? They will need to sign in again.`
              : `Force logout ${confirmTarget?.label}? Their session will be terminated immediately.`}
          </p>
          {logoutError && <p className="text-red-400 text-sm">{logoutError}</p>}
          <div className="flex gap-3 justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setConfirmTarget(null);
                setLogoutError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={logoutLoading}
              onClick={handleForceLogout}
            >
              {confirmTarget?.type === "allUserSessions"
                ? "Logout All Sessions"
                : "Force Logout"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
