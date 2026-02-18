"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Selfie, SelfieStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";

interface ModerationGridProps {
  eventId: string;
  mode: "admin" | "crew";
}

type FilterTab = "all" | SelfieStatus;

export function ModerationGrid({ eventId, mode }: ModerationGridProps) {
  const [selfies, setSelfies] = useState<Selfie[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSelfies = async () => {
    setLoading(true);
    let query = supabase
      .from("selfies")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setSelfies(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSelfies();
  }, [filter, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (selfieId: string, status: SelfieStatus) => {
    await supabase.from("selfies").update({ status }).eq("id", selfieId);
    setSelfies((prev) =>
      prev.map((s) => (s.id === selfieId ? { ...s, status } : s))
    );
  };

  const deleteSelfie = async (selfieId: string, imagePath: string) => {
    if (!confirm("Delete this selfie permanently?")) return;
    await supabase.storage.from("selfies").remove([imagePath]);
    await supabase.from("selfies").delete().eq("id", selfieId);
    setSelfies((prev) => prev.filter((s) => s.id !== selfieId));
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

      {loading ? (
        <div className="text-center py-12 text-white/50">Loading...</div>
      ) : selfies.length === 0 ? (
        <div className="text-center py-12 text-white/50">No selfies found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selfies.map((selfie) => (
            <div
              key={selfie.id}
              className="rounded-xl border border-white/10 overflow-hidden bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfie.image_url}
                alt={selfie.display_name || "Selfie"}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium truncate">
                    {selfie.display_name || "Anonymous"}
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
                      onClick={() => updateStatus(selfie.id, "approved")}
                      className="flex-1 text-xs"
                    >
                      Approve
                    </Button>
                  )}
                  {selfie.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(selfie.id, "rejected")}
                      className="flex-1 text-xs"
                    >
                      Reject
                    </Button>
                  )}
                  {mode === "admin" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteSelfie(selfie.id, selfie.image_path)}
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
