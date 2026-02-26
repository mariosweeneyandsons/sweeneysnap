import { PublicEvent } from "@/types/database";
import { hexToRgb, getContrastColor } from "./color-utils";

export { getContrastColor } from "./color-utils";

export function getGoogleFontUrl(fontFamily: string): string | null {
  if (!fontFamily || fontFamily === "Inter") return null;
  const encoded = fontFamily.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`;
}

export function getEventThemeVars(event: PublicEvent): Record<string, string> {
  const primary = event.primaryColor || "#ffffff";
  const rgb = hexToRgb(primary);
  const contrast = getContrastColor(primary);
  const font = event.fontFamily || "Inter";

  return {
    "--ss-primary": primary,
    "--ss-primary-rgb": rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "255, 255, 255",
    "--ss-primary-contrast": contrast,
    "--ss-font-family": font,
  };
}

export function sanitizeCss(css: string): string {
  if (!css) return "";
  // Enforce max length (10KB)
  if (css.length > 10000) {
    css = css.slice(0, 10000);
  }
  // Strip dangerous patterns
  return css
    .replace(/expression\s*\(/gi, "/* blocked */")
    .replace(/javascript\s*:/gi, "/* blocked */")
    .replace(/-moz-binding\s*:/gi, "/* blocked */")
    .replace(/behavior\s*:/gi, "/* blocked */")
    .replace(/@import/gi, "/* blocked */")
    .replace(/@charset/gi, "/* blocked */")
    .replace(/@namespace/gi, "/* blocked */")
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url("/* blocked */')
    .replace(/<\/?script/gi, "/* blocked */")
    .replace(/<\/?\s*style/gi, "/* blocked */");
}
