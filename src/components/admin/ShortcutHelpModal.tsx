"use client";

import { Modal } from "@/components/ui/Modal";

interface ShortcutHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const kbdClass = "bg-surface border border-border rounded px-1.5 py-0.5 font-mono text-xs text-foreground-emphasis";

const globalShortcuts = [
  { keys: ["?"], action: "Show this help" },
  { keys: ["g", "d"], action: "Go to Dashboard" },
  { keys: ["g", "p"], action: "Go to Presets" },
  { keys: ["g", "a"], action: "Go to Accounts" },
];

const moderationShortcuts = [
  { keys: ["a"], action: "Approve selected" },
  { keys: ["r"], action: "Reject selected" },
  { keys: ["d"], action: "Delete selected" },
  { keys: ["j"], action: "Select next" },
  { keys: ["k"], action: "Select previous" },
  { keys: ["1-4"], action: "Switch filter tab" },
];

export function ShortcutHelpModal({ open, onClose }: ShortcutHelpModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="flex flex-col gap-6">
        <ShortcutGroup title="Global" shortcuts={globalShortcuts} />
        <ShortcutGroup title="Moderation" shortcuts={moderationShortcuts} />
      </div>
    </Modal>
  );
}

function ShortcutGroup({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: { keys: string[]; action: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {shortcuts.map((s) => (
          <div key={s.action} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{s.action}</span>
            <span className="flex items-center gap-1">
              {s.keys.map((k, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-foreground-faint text-xs">then</span>}
                  <kbd className={kbdClass}>{k}</kbd>
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
