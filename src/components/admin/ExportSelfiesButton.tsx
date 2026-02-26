"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";

interface ExportSelfiesButtonProps {
  eventId: string;
  eventName: string;
}

export function ExportSelfiesButton({ eventId, eventName }: ExportSelfiesButtonProps) {
  const selfies = useQuery(api.selfies.listApprovedByEvent, {
    eventId: eventId as Id<"events">,
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (!selfies || selfies.length === 0) return;
    setExporting(true);
    setProgress(0);

    try {
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      const zip = new JSZip();

      for (let i = 0; i < selfies.length; i++) {
        const selfie = selfies[i];
        if (!selfie.imageUrl) continue;

        const response = await fetch(selfie.imageUrl);
        const blob = await response.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const name = selfie.displayName
          ? `${selfie.displayName.replace(/[^a-zA-Z0-9]/g, "_")}_${i + 1}.${ext}`
          : `selfie_${i + 1}.${ext}`;
        zip.file(name, blob);

        setProgress(Math.round(((i + 1) / selfies.length) * 100));
      }

      const content = await zip.generateAsync({ type: "blob" });
      const safeName = eventName.replace(/[^a-zA-Z0-9]/g, "_");
      saveAs(content, `${safeName}_selfies.zip`);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const count = selfies?.length ?? 0;

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      loading={exporting}
      disabled={count === 0}
    >
      {exporting
        ? `Exporting... ${progress}%`
        : `Export Selfies (${count})`}
    </Button>
  );
}
