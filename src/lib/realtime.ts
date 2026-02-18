import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { Selfie } from "@/types/database";

type SelfieCallback = (selfie: Selfie) => void;

export function subscribeSelfies(
  supabase: SupabaseClient,
  eventId: string,
  callbacks: {
    onInsert?: SelfieCallback;
    onUpdate?: SelfieCallback;
    onDelete?: (old: { id: string }) => void;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`selfies:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "selfies",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        callbacks.onInsert?.(payload.new as Selfie);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "selfies",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        callbacks.onUpdate?.(payload.new as Selfie);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "selfies",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        callbacks.onDelete?.(payload.old as { id: string });
      }
    )
    .subscribe();

  return channel;
}
