"use client";

import { useParams } from "next/navigation";
import { PrintQueueView } from "@/components/admin/PrintQueueView";

export default function PrintQueuePage() {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Print Queue</h1>
      <PrintQueueView eventId={eventId} />
    </div>
  );
}
