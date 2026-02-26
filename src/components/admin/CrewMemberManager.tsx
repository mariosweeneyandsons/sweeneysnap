"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "./CopyButton";

interface CrewMemberManagerProps {
  eventId: string;
}

type Permission = "moderator" | "viewer";

export function CrewMemberManager({ eventId }: CrewMemberManagerProps) {
  const members = useQuery(api.crewMembers.listByEvent, {
    eventId: eventId as Id<"events">,
  });
  const createMember = useMutation(api.crewMembers.create);
  const updateMember = useMutation(api.crewMembers.update);
  const removeMember = useMutation(api.crewMembers.remove);
  const regenerateToken = useMutation(api.crewMembers.regenerateToken);

  const [newName, setNewName] = useState("");
  const [newPermission, setNewPermission] = useState<Permission>("moderator");
  const [adding, setAdding] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await createMember({
        eventId: eventId as Id<"events">,
        name: newName.trim(),
        permission: newPermission,
      });
      setNewName("");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this crew member?")) return;
    await removeMember({ id: id as Id<"crewMembers"> });
  };

  const handleRegenerate = async (id: string) => {
    if (!confirm("Regenerate this member's access token? Their old link will stop working.")) return;
    await regenerateToken({ id: id as Id<"crewMembers"> });
  };

  const handleTogglePermission = async (id: string, current: Permission) => {
    await updateMember({
      id: id as Id<"crewMembers">,
      permission: current === "moderator" ? "viewer" : "moderator",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold mb-4">Add Crew Member</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sarah (AV Tech)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Permission</label>
            <select
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value as Permission)}
              className="rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground text-sm"
            >
              <option value="moderator" className="bg-surface">Moderator</option>
              <option value="viewer" className="bg-surface">Viewer</option>
            </select>
          </div>
          <Button onClick={handleAdd} loading={adding} disabled={!newName.trim()}>
            Add
          </Button>
        </div>
      </Card>

      {members === undefined ? (
        <p className="text-foreground-faint text-sm">Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-foreground-faint text-sm">No crew members yet. Add one above or use the legacy shared crew link.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const crewUrl = `${siteUrl}/crew/${member.token}`;
            return (
              <Card key={member._id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{member.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-xs text-xs font-medium ${
                        member.permission === "moderator"
                          ? "bg-info-bg text-info"
                          : "bg-secondary text-foreground-faint"
                      }`}
                    >
                      {member.permission}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-foreground-faint truncate">{crewUrl}</code>
                    <CopyButton text={crewUrl} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePermission(member._id, member.permission)}
                    className="text-xs text-foreground-faint hover:text-foreground-emphasis transition-colors"
                    title={`Switch to ${member.permission === "moderator" ? "viewer" : "moderator"}`}
                  >
                    {member.permission === "moderator" ? "Make Viewer" : "Make Moderator"}
                  </button>
                  <button
                    onClick={() => handleRegenerate(member._id)}
                    className="text-xs text-warning/70 hover:text-warning transition-colors"
                    title="Regenerate access token"
                  >
                    Regen
                  </button>
                  <button
                    onClick={() => handleRemove(member._id)}
                    className="text-xs text-destructive/70 hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
