"use client";

import { useEffect, useRef, useCallback } from "react";

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  enabled?: boolean;
  handler: () => void;
}

function isInputElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isInputElement(document.activeElement)) return;

    for (const hk of hotkeysRef.current) {
      if (hk.enabled === false) continue;
      if (e.key.toLowerCase() !== hk.key.toLowerCase()) continue;
      if (hk.ctrl && !e.ctrlKey && !e.metaKey) continue;
      if (hk.shift && !e.shiftKey) continue;

      e.preventDefault();
      hk.handler();
      return;
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Two-stroke key handler (e.g., "g" then "d").
 * Returns the first-key handler and provides a way to register second-key combos.
 */
export function useTwoStrokeHotkeys(
  firstKey: string,
  combos: { key: string; handler: () => void }[],
  enabled = true
) {
  const pendingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const combosRef = useRef(combos);
  combosRef.current = combos;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (isInputElement(document.activeElement)) return;

      if (pendingRef.current) {
        // Second stroke
        for (const combo of combosRef.current) {
          if (e.key.toLowerCase() === combo.key.toLowerCase()) {
            e.preventDefault();
            combo.handler();
            pendingRef.current = false;
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
          }
        }
        // Any other key cancels
        pendingRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
        return;
      }

      if (e.key.toLowerCase() === firstKey.toLowerCase()) {
        e.preventDefault();
        pendingRef.current = true;
        timerRef.current = setTimeout(() => {
          pendingRef.current = false;
        }, 1000);
      }
    },
    [firstKey, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleKeyDown]);
}
