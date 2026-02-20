"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { SelfieStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";

interface ModerationGridProps {
  eventId: string;
  mode: "admin" | "crew";
}

type FilterTab = "all" | SelfieStatus;

export function ModerationGrid({ eventId, mode }: ModerationGridProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const selfies = useQuery(api.selfies.listByEvent, {
    eventId: eventId as Id<"events">,
    status: filter === "all" ? undefined : filter,
  });

  const updateStatus = useMutation(api.selfies.updateStatus);
  const removeSelfie = useMutation(api.selfies.remove);

  const handleUpdateStatus = async (selfieId: string, status: SelfieStatus) => {
    await updateStatus({ id: selfieId as Id<"selfies">, status });
  };

  const handleDelete = async (selfieId: string) => {
    if (!confirm("Delete this selfie permanently?")) return;
    await removeSelfie({ id: selfieId as Id<"selfies"> });
  };

  const tabs: { label: string; value: FilterTab }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-white text-black"
                : "bg-white/10 text-white/60 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!selfies ? (
        <div className="text-center py-12 text-white/50">Loading...</div>
      ) : selfies.length === 0 ? (
        <div className="text-center py-12 text-white/50">No selfies found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selfies.map((selfie) => (
            <div
              key={selfie._id}
              className="rounded-xl border border-white/10 overflow-hidden bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfie.imageUrl || ""}
                alt={selfie.displayName || "Selfie"}
                className="w-full aspect-square object-cover"
              />
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
                      onClick={() => handleUpdateStatus(selfie._id, "approved")}
                      className="flex-1 text-xs"
                    >
                      Approve
                    </Button>
                  )}
                  {selfie.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUpdateStatus(selfie._id, "rejected")}
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
    </div>
  );
}
