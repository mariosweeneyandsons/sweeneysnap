"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GOOGLE_FONTS, FONT_CATEGORIES, GoogleFont } from "@/lib/googleFonts";
import { BrandAsset } from "@/types/database";

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
  customFonts?: BrandAsset[];
  onUploadCustomFont?: () => void;
}

const BATCH_SIZE = 15;

export function FontPicker({ value, onChange, customFonts = [], onUploadCustomFont }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter fonts
  const filtered = GOOGLE_FONTS.filter((f) => {
    if (category !== "all" && f.category !== category) return false;
    if (search && !f.family.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Build full list: custom fonts first, then Google Fonts
  const customFontItems: { family: string; isCustom: true }[] = customFonts
    .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()))
    .map((a) => ({ family: a.name, isCustom: true as const }));

  const allItems = [
    ...customFontItems,
    ...filtered.map((f) => ({ family: f.family, isCustom: false as const })),
  ];

  // Load fonts in batches via IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadFont = useCallback(
    (family: string) => {
      if (loadedFonts.has(family)) return;
      const encoded = family.replace(/\s+/g, "+");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`;
      document.head.appendChild(link);
      setLoadedFonts((prev) => new Set(prev).add(family));
    },
    [loadedFonts]
  );

  useEffect(() => {
    if (!open || !listRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const family = (entry.target as HTMLElement).dataset.fontFamily;
            if (family) loadFont(family);
          }
        });
      },
      { root: listRef.current, rootMargin: "100px" }
    );

    const items = listRef.current.querySelectorAll("[data-font-family]");
    items.forEach((item) => observerRef.current!.observe(item));

    return () => observerRef.current?.disconnect();
  }, [open, filtered.length, category, search, loadFont]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, allItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < allItems.length) {
          onChange(allItems[highlightIndex].family);
          setOpen(false);
          setSearch("");
        }
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        break;
    }
  };

  // Load the currently selected font
  useEffect(() => {
    if (value && !customFonts.some((f) => f.name === value)) {
      loadFont(value);
    }
  }, [value, loadFont, customFonts]);

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <label className="block text-sm font-medium text-foreground-muted mb-1">Font Family</label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="w-full rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground text-left flex items-center justify-between gap-2"
      >
        <span style={{ fontFamily: `"${value}", sans-serif` }}>{value || "Select font..."}</span>
        <svg className={`w-4 h-4 text-foreground-faint transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xs shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightIndex(-1); }}
              placeholder="Search fonts..."
              className="w-full rounded-xs border border-border bg-input-bg px-2 py-1.5 text-sm text-foreground"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 px-2 py-1.5 border-b border-border overflow-x-auto">
            {FONT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => { setCategory(cat.value); setHighlightIndex(-1); }}
                className={`px-2 py-0.5 rounded text-xs whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-faint hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Font list */}
          <div ref={listRef} className="max-h-64 overflow-y-auto">
            {allItems.length === 0 && (
              <p className="p-3 text-sm text-foreground-faint text-center">No fonts found</p>
            )}
            {allItems.map((item, i) => (
              <button
                key={item.family}
                type="button"
                data-font-family={item.isCustom ? undefined : item.family}
                onClick={() => { onChange(item.family); setOpen(false); setSearch(""); }}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                  highlightIndex === i ? "bg-surface-hover" : ""
                } ${value === item.family ? "text-primary font-medium" : "text-foreground"}`}
              >
                <span
                  style={item.isCustom ? undefined : { fontFamily: `"${item.family}", sans-serif` }}
                  className="truncate"
                >
                  {item.family}
                </span>
                {item.isCustom && (
                  <span className="text-[10px] uppercase tracking-wider text-foreground-faint ml-2 shrink-0">Custom</span>
                )}
              </button>
            ))}
          </div>

          {/* Upload custom font */}
          {onUploadCustomFont && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={onUploadCustomFont}
                className="w-full text-left px-3 py-2 text-sm text-foreground-faint hover:text-foreground hover:bg-surface-hover rounded-xs transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Custom Font
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
