import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  hexToHsl,
  hslToHex,
  deriveBackground,
  deriveTextColor,
  getContrastColor,
} from "./color-utils";

describe("hexToRgb", () => {
  it("converts white hex to RGB", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black hex to RGB", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts a color hex to RGB", () => {
    expect(hexToRgb("#4a7ab5")).toEqual({ r: 74, g: 122, b: 181 });
  });

  it("handles hex without hash prefix", () => {
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("invalid")).toBeNull();
    expect(hexToRgb("#xyz")).toBeNull();
    expect(hexToRgb("")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("hexToHsl", () => {
  it("converts white to HSL", () => {
    expect(hexToHsl("#ffffff")).toEqual([0, 0, 100]);
  });

  it("converts black to HSL", () => {
    expect(hexToHsl("#000000")).toEqual([0, 0, 0]);
  });

  it("converts pure red to HSL", () => {
    expect(hexToHsl("#ff0000")).toEqual([0, 100, 50]);
  });

  it("converts pure green to HSL", () => {
    expect(hexToHsl("#00ff00")).toEqual([120, 100, 50]);
  });

  it("converts pure blue to HSL", () => {
    expect(hexToHsl("#0000ff")).toEqual([240, 100, 50]);
  });

  it("returns [0, 0, 0] for invalid hex", () => {
    expect(hexToHsl("invalid")).toEqual([0, 0, 0]);
  });
});

describe("hslToHex", () => {
  it("converts red HSL to hex", () => {
    expect(hslToHex(0, 100, 50)).toBe("#ff0000");
  });

  it("converts white HSL to hex", () => {
    expect(hslToHex(0, 0, 100)).toBe("#ffffff");
  });

  it("converts black HSL to hex", () => {
    expect(hslToHex(0, 0, 0)).toBe("#000000");
  });

  it("produces a valid hex string", () => {
    const result = hslToHex(210, 50, 50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("deriveBackground", () => {
  it("produces a very dark color", () => {
    const bg = deriveBackground("#4a7ab5");
    const [, , l] = hexToHsl(bg);
    expect(l).toBeLessThanOrEqual(15);
  });

  it("returns a valid hex string", () => {
    expect(deriveBackground("#ff0000")).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("deriveTextColor", () => {
  it("produces a very light color", () => {
    const text = deriveTextColor("#4a7ab5");
    const [, , l] = hexToHsl(text);
    expect(l).toBeGreaterThanOrEqual(85);
  });

  it("returns a valid hex string", () => {
    expect(deriveTextColor("#00ff00")).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("getContrastColor", () => {
  it("returns black for white background", () => {
    expect(getContrastColor("#ffffff")).toBe("#000000");
  });

  it("returns white for black background", () => {
    expect(getContrastColor("#000000")).toBe("#ffffff");
  });

  it("returns white for dark colors", () => {
    expect(getContrastColor("#1a2744")).toBe("#ffffff");
  });

  it("returns black for light colors", () => {
    expect(getContrastColor("#f0f0f0")).toBe("#000000");
  });

  it("returns #ffffff for invalid hex", () => {
    expect(getContrastColor("invalid")).toBe("#ffffff");
  });
});
