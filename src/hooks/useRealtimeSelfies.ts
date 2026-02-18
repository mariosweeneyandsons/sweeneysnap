"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeSelfies } from "@/lib/realtime";
import { Selfie } from "@/types/database";

export function useRealtimeSelfies(eventId: string, initialSelfies: Selfie[] = []) {
  const [selfies, setSelfies] = useState<Selfie[]>(initialSelfies);

  const handleInsert = useCallback((selfie: Selfie) => {
    if (selfie.status === "approved") {
      setSelfies((prev) => [selfie, ...prev]);
    }
  }, []);

  const handleUpdate = useCallback((selfie: Selfie) => {
    setSelfies((prev) => {
      const exists = prev.find((s) => s.id === selfie.id);
      if (selfie.status === "approved") {
        if (exists) {
          return prev.map((s) => (s.id === selfie.id ? selfie : s));
        }
        return [selfie, ...prev];
      }
      // If no longer approved, remove it
      return prev.filter((s) => s.id !== selfie.id);
    });
  }, []);

  const handleDelete = useCallback((old: { id: string }) => {
    setSelfies((prev) => prev.filter((s) => s.id !== old.id));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = subscribeSelfies(supabase, eventId, {
      onInsert: handleInsert,
      onUpdate: handleUpdate,
      onDelete: handleDelete,
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, handleInsert, handleUpdate, handleDelete]);

  return selfies;
}
