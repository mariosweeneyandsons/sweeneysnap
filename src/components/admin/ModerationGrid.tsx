"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { SelfieStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ModerationGridSkeleton } from "@/components/admin/skeletons/ModerationGridSkeleton";
import { useNewPendingAlert } from "@/hooks/useNewPendingAlert";

interface ModerationGridProps {
  eventId: string;
  mode: "admin" | "crew";
}

type FilterTab = "all" | SelfieStatus;

export function ModerationGrid({ eventId, mode }: ModerationGridProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const selfies = useQuery(api.selfies.listByEvent, {
    eventId: eventId as Id<"events">,
    status: filter === "all" ? undefined : filter,
  });

  const pendingCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "pending",
    }) ?? 0;

  const approvedCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "approved",
    }) ?? 0;

  const rejectedCount =
    useQuery(api.selfies.countByEventAndStatus, {
      eventId: eventId as Id<"events">,
      status: "rejected",
    }) ?? 0;

  const totalCount = pendingCount + approvedCount + rejectedCount;

  const updateStatus = useMutation(api.selfies.updateStatus);
  const bulkUpdateStatus = useMutation(api.selfies.bulkUpdateStatus);
  const removeSelfie = useMutation(api.selfies.remove);

  // Notification sound for new pending selfies
  useNewPendingAlert(eventId);

  const handleUpdateStatus = async (
    selfieId: string,
    status: SelfieStatus
  ) => {
    try {
      await updateStatus({ id: selfieId as Id<"selfies">, status });
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === tab.value
                ? "bg-white text-black"
                : "bg-white/10 text-white/60 hover:text-white"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.value
                  ? "bg-black/10 text-black/70"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}

        {/* Select All checkbox */}
        {selfies && selfies.length > 0 && (
          <label className="ml-auto flex items-center gap-2 cursor-pointer text-sm text-white/50 hover:text-white/70">
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
        <div className="text-center py-12 text-white/50">No selfies found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selfies.map((selfie) => (
            <div
              key={selfie._id}
              className={`rounded-xl border overflow-hidden bg-white/5 transition-colors ${
                selectedIds.has(selfie._id)
                  ? "border-blue-500 ring-1 ring-blue-500/50"
                  : "border-white/10"
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
                    className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/90 text-white"
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
                        ? "bg-green-500/20 text-green-400"
                        : selfie.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-white/20 rounded-xl px-5 py-3 flex items-center gap-4 shadow-2xl">
          <span className="text-sm text-white/70 font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            onClick={() => handleBulkAction("approved")}
            className="text-xs bg-green-600 hover:bg-green-500"
          >
            Approve All
          </Button>
          <Button
            size="sm"
            onClick={() => handleBulkAction("rejected")}
            className="text-xs bg-red-600 hover:bg-red-500"
          >
            Reject All
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-white/50 hover:text-white/80"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
