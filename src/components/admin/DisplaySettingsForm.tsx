"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicEvent, DisplayConfig } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import {
  DisplaySettingsFields,
  DisplayConfigFormState,
  initDisplayConfigState,
  buildDisplayConfig,
} from "./DisplaySettingsFields";

interface DisplaySettingsFormProps {
  event: PublicEvent;
  backHref: string;
  onConfigChange?: (config: DisplayConfig) => void;
  crewToken?: string;
}

export function DisplaySettingsForm({ event, backHref, onConfigChange, crewToken }: DisplaySettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const config = event.displayConfig;
  const updateDisplayConfig = useMutation(api.events.updateDisplayConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState<DisplayConfigFormState>(
    () => initDisplayConfigState(config)
  );

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const currentConfig = useCallback(
    () => buildDisplayConfig(formState, config),
    [formState, config]
  );

  useEffect(() => {
    onConfigChange?.(currentConfig());
  }, [currentConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const displayConfig = currentConfig();

    try {
      await updateDisplayConfig({
        id: event._id as Id<"events">,
        displayConfig: displayConfig as typeof displayConfig & {
          backgroundImageId?: Id<"_storage">;
          backgroundVideoId?: Id<"_storage">;
        },
        crewToken,
      });
      toast("Display settings saved", "success");
      router.push(backHref);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="flex flex-col gap-5">
        <DisplaySettingsFields config={formState} onChange={handleChange} />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push(backHref)}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Display Settings</Button>
        </div>
      </Card>
    </form>
  );
}
