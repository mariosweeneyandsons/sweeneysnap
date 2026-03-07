"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { UserAvatar } from "./UserAvatar";

interface UserIdentity {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface UserProfilePopoverProps {
  identity: UserIdentity;
  displayName: string;
}

export function UserProfilePopover({
  identity,
  displayName,
}: UserProfilePopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-xs hover:bg-surface transition-colors text-left cursor-pointer"
      >
        <UserAvatar
          name={identity.name}
          image={identity.image}
          size={36}
        />
        <span className="flex-1 text-sm text-foreground truncate">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-foreground-faint transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xs bg-secondary backdrop-blur-xl border border-border p-4 z-50"
          >
            <div className="flex items-center gap-3 mb-4">
              <UserAvatar
                name={identity.name}
                image={identity.image}
                size={44}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground-emphasis truncate">
                  {identity.name ?? displayName}
                </p>
                {identity.email && (
                  <p className="text-xs text-foreground-faint truncate">
                    {identity.email}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xs text-sm text-foreground-muted hover:text-foreground-emphasis hover:bg-secondary transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
