"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { SelfieStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ModerationGridSkeleton } from "@/components/admin/skeletons/ModerationGridSkeleton";
import { useNewPendingAlert } from "@/hooks/useNewPendingAlert";
import { useHotkeys } from "@/hooks/useHotkeys";

interface ModerationGridProps {
  eventId: string;
  mode: "admin" | "crew";
  crewToken?: string;
  crewMemberId?: string;
}

type FilterTab = "all" | SelfieStatus;

export function ModerationGrid({ eventId, mode, crewToken, crewMemberId }: ModerationGridProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { toast } = useToast();

  const selfies = useQuery(api.selfies.listByEvent, {
    eventId: eventId as Id<"events">,
    status: filter === "all" ? undefined : filter,
    crewToken,
  });

  const pendingCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "pending",
      crewToken,
    }) ?? 0;

  const approvedCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "approved",
      crewToken,
    }) ?? 0;

  const rejectedCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "rejected",
      crewToken,
    }) ?? 0;

  const totalCount = pendingCount + approvedCount + rejectedCount;

  const updateStatus = useMutation(api.selfies.updateStatus);
  const updateStatusWithLog = useMutation(api.selfies.updateStatusWithLog);
  const bulkUpdateStatus = useMutation(api.selfies.bulkUpdateStatus);
  const removeSelfie = useMutation(api.selfies.remove);
  const createPrintJob = useMutation(api.printJobs.create);

  // Notification sound for new pending selfies
  useNewPendingAlert(eventId, crewToken);

  // Clamp selectedIndex when selfies list changes
  useEffect(() => {
    if (selfies && selectedIndex >= selfies.length) {
      setSelectedIndex(Math.max(selfies.length - 1, -1));
    }
  }, [selfies, selectedIndex]);

  const selectedSelfie = selfies && selectedIndex >= 0 ? selfies[selectedIndex] : null;

  // Keyboard shortcuts for moderation
  useHotkeys([
    {
      key: "j",
      enabled: !!selfies && selfies.length > 0,
      handler: () => setSelectedIndex((i) => Math.min(i + 1, (selfies?.length ?? 1) - 1)),
    },
    {
      key: "k",
      enabled: !!selfies && selfies.length > 0,
      handler: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
    },
    {
      key: "a",
      enabled: !!selectedSelfie && selectedSelfie.status !== "approved",
      handler: () => {
        if (selectedSelfie) handleUpdateStatus(selectedSelfie._id, "approved");
      },
    },
    {
      key: "r",
      enabled: !!selectedSelfie && selectedSelfie.status !== "rejected",
      handler: () => {
        if (selectedSelfie) handleUpdateStatus(selectedSelfie._id, "rejected");
      },
    },
    {
      key: "d",
      enabled: !!selectedSelfie && mode === "admin",
      handler: () => {
        if (selectedSelfie) handleDelete(selectedSelfie._id);
      },
    },
    {
      key: "1",
      handler: () => { setFilter("all"); setSelectedIndex(-1); },
    },
    {
      key: "2",
      handler: () => { setFilter("pending"); setSelectedIndex(-1); },
    },
    {
      key: "3",
      handler: () => { setFilter("approved"); setSelectedIndex(-1); },
    },
    {
      key: "4",
      handler: () => { setFilter("rejected"); setSelectedIndex(-1); },
    },
  ]);

  const handleUpdateStatus = async (
    selfieId: string,
    status: SelfieStatus
  ) => {
    try {
      if (crewToken) {
        await updateStatusWithLog({
          id: selfieId as Id<"selfies">,
          status,
          crewToken,
          crewMemberId: crewMemberId ? crewMemberId as Id<"crewMembers"> : undefined,
        });
      } else {
        await updateStatus({ id: selfieId as Id<"selfies">, status });
      }
      toast(`Selfie ${status}`, status === "approved" ? "success" : "warning");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const handleDelete = async (selfieId: string) => {
    if (!confirm("Delete this selfie permanently?")) return;
    try {
      await removeSelfie({ id: selfieId as Id<"selfies"> });
      toast("Selfie deleted", "success");
    } catch {
      toast("Failed to delete selfie", "error");
    }
  };

  const handlePrint = async (selfieId: string) => {
    try {
      await createPrintJob({
        selfieId: selfieId as Id<"selfies">,
        eventId: eventId as Id<"events">,
      });
      toast("Added to print queue", "success");
    } catch {
      toast("Failed to queue print", "error");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!selfies) return;
    if (selectedIds.size === selfies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selfies.map((s) => s._id)));
    }
  };

  const handleBulkAction = async (status: SelfieStatus) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdateStatus({
        ids: Array.from(selectedIds) as Id<"selfies">[],
        status,
      });
      toast(`${selectedIds.size} selfies ${status}`, "success");
      setSelectedIds(new Set());
    } catch {
      toast("Failed to update selfies", "error");
    }
  };

  const tabs: { label: string; value: FilterTab; count: number }[] = [
    { label: "All", value: "all", count: totalCount },
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Approved", value: "approved", count: approvedCount },
    { label: "Rejected", value: "rejected", count: rejectedCount },
  ];

  return (
    <div>
      {/* Filter tabs with count badges */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilter(tab.value);
              setSelectedIds(new Set());
            }}
            className={`px-3 py-1.5 rounded-xs text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === tab.value
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-xs ${
                filter === tab.value
                  ? "bg-secondary text-foreground-muted"
                  : "bg-secondary text-foreground-faint"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}

        {/* Select All checkbox */}
        {selfies && selfies.length > 0 && (
          <label className="ml-auto flex items-center gap-2 cursor-pointer text-sm text-foreground-muted hover:text-foreground-muted">
            <input
              type="checkbox"
              checked={
                selfies.length > 0 && selectedIds.size === selfies.length
              }
              onChange={toggleSelectAll}
              className="rounded"
            />
            Select All
          </label>
        )}
      </div>

      {!selfies ? (
        <ModerationGridSkeleton />
      ) : selfies.length === 0 ? (
        <div className="text-center py-12 text-foreground-muted">No selfies found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selfies.map((selfie, idx) => (
            <div
              key={selfie._id}
              className={`rounded-xs border overflow-hidden bg-input-bg transition-colors ${
                idx === selectedIndex
                  ? "ring-2 ring-primary border-primary"
                  : selectedIds.has(selfie._id)
                    ? "border-primary ring-1 ring-primary/50"
                    : "border-border"
              }`}
            >
              <div className="relative">
                {/* Selection checkbox */}
                <label className="absolute top-2 left-2 z-10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(selfie._id)}
                    onChange={() => toggleSelect(selfie._id)}
                    className="rounded w-4 h-4"
                  />
                </label>

                {/* AI Flagged badge */}
                {selfie.aiModeration?.flagged && (
                  <span
                    className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-xs text-xs font-medium bg-warning text-background"
                    title={`AI flagged: ${selfie.aiModeration.categories.join(", ")} (${Math.round(selfie.aiModeration.confidence * 100)}% confidence)`}
                  >
                    AI Flagged
                  </span>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selfie.imageUrl || ""}
                  alt={selfie.displayName || "Selfie"}
                  className="w-full aspect-square object-cover"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium truncate">
                    {selfie.displayName || "Anonymous"}
                  </p>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      selfie.status === "approved"
                        ? "bg-success-bg text-success"
                        : selfie.status === "rejected"
                          ? "bg-destructive-bg text-destructive"
                          : "bg-warning-bg text-warning"
                    }`}
                  >
                    {selfie.status}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {selfie.status !== "approved" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(selfie._id, "approved")
                      }
                      className="flex-1 text-xs"
                    >
                      Approve
                    </Button>
                  )}
                  {selfie.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleUpdateStatus(selfie._id, "rejected")
                      }
                      className="flex-1 text-xs"
                    >
                      Reject
                    </Button>
                  )}
                  {mode === "admin" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(selfie._id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  )}
                  {mode === "admin" && selfie.status === "approved" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handlePrint(selfie._id)}
                      className="text-xs"
                    >
                      Print
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded-xs px-5 py-3 flex items-center gap-4 shadow-2xl">
          <span className="text-sm text-foreground-muted font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            onClick={() => handleBulkAction("approved")}
            className="text-xs bg-success hover:bg-success/80"
          >
            Approve All
          </Button>
          <Button
            size="sm"
            onClick={() => handleBulkAction("rejected")}
            className="text-xs bg-destructive hover:bg-destructive/80"
          >
            Reject All
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
