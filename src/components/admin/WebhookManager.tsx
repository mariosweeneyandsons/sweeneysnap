"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "./CopyButton";
import { useToast } from "@/components/ui/Toast";

const TRIGGER_OPTIONS = [
  { value: "selfie.created" as const, label: "Selfie Created" },
  { value: "selfie.approved" as const, label: "Selfie Approved" },
  { value: "selfie.rejected" as const, label: "Selfie Rejected" },
];

interface WebhookManagerProps {
  eventId: string;
}

export function WebhookManager({ eventId }: WebhookManagerProps) {
  const { toast } = useToast();
  const webhooks = useQuery(api.webhooks.listByEvent, {
    eventId: eventId as Id<"events">,
  });
  const createWebhook = useMutation(api.webhooks.create);
  const removeWebhook = useMutation(api.webhooks.remove);
  const updateWebhook = useMutation(api.webhooks.update);

  const [url, setUrl] = useState("");
  const [triggers, setTriggers] = useState<Set<string>>(new Set(["selfie.created"]));
  const [adding, setAdding] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());

  const handleAdd = async () => {
    if (!url.trim()) return;
    setAdding(true);
    try {
      await createWebhook({
        eventId: eventId as Id<"events">,
        url: url.trim(),
        triggers: Array.from(triggers) as ("selfie.created" | "selfie.approved" | "selfie.rejected")[],
      });
      setUrl("");
      setTriggers(new Set(["selfie.created"]));
      toast("Webhook added", "success");
    } catch {
      toast("Failed to add webhook", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this webhook?")) return;
    try {
      await removeWebhook({ id: id as Id<"webhooks"> });
      toast("Webhook removed", "success");
    } catch {
      toast("Failed to remove webhook", "error");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateWebhook({ id: id as Id<"webhooks">, isActive: !isActive });
  };

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) => {
      const next = new Set(prev);
      if (next.has(trigger)) {
        next.delete(trigger);
      } else {
        next.add(trigger);
      }
      return next;
    });
  };

  const toggleSecret = (id: string) => {
    setShowSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card>
      <h3 className="font-semibold mb-4">Webhooks</h3>
      <p className="text-foreground-muted text-sm mb-4">
        Receive HTTP POST notifications when selfies are created, approved, or rejected.
      </p>

      {/* Existing webhooks */}
      {webhooks && webhooks.length > 0 && (
        <div className="space-y-3 mb-6">
          {webhooks.map((wh) => (
            <div
              key={wh._id}
              className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate">{wh.url}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {wh.triggers.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-1.5 py-0.5 rounded bg-info-bg text-info"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-foreground-muted">Secret:</span>
                  <code className="text-xs text-foreground-muted">
                    {showSecrets.has(wh._id)
                      ? wh.secret
                      : "••••••••••••"}
                  </code>
                  <button
                    onClick={() => toggleSecret(wh._id)}
                    className="text-xs text-info hover:underline"
                  >
                    {showSecrets.has(wh._id) ? "Hide" : "Show"}
                  </button>
                  {showSecrets.has(wh._id) && <CopyButton text={wh.secret} />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(wh._id, wh.isActive)}
                  className={`text-xs px-2 py-1 rounded ${
                    wh.isActive
                      ? "bg-success-bg text-success"
                      : "bg-secondary text-foreground-muted"
                  }`}
                >
                  {wh.isActive ? "Active" : "Paused"}
                </button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(wh._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add webhook form */}
      <div className="space-y-3">
        <Input
          label="Webhook URL"
          placeholder="https://example.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            Triggers
          </label>
          <div className="flex gap-3">
            {TRIGGER_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={triggers.has(opt.value)}
                  onChange={() => toggleTrigger(opt.value)}
                  className="rounded"
                />
                <span className="text-sm text-foreground-muted">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Button
          onClick={handleAdd}
          loading={adding}
          disabled={!url.trim() || triggers.size === 0}
          size="sm"
        >
          Add Webhook
        </Button>
      </div>
    </Card>
  );
}
