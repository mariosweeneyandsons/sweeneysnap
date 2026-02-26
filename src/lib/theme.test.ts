import { describe, it, expect } from "vitest";
import { getGoogleFontUrl, getEventThemeVars, sanitizeCss } from "./theme";

describe("getGoogleFontUrl", () => {
  it("returns null for Inter (default font)", () => {
    expect(getGoogleFontUrl("Inter")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getGoogleFontUrl("")).toBeNull();
  });

  it("returns a Google Fonts URL for custom fonts", () => {
    const url = getGoogleFontUrl("Roboto");
    expect(url).toBe(
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap"
    );
  });

  it("encodes spaces as + in font names", () => {
    const url = getGoogleFontUrl("Open Sans");
    expect(url).toContain("family=Open+Sans");
  });

  it("handles multi-word font names", () => {
    const url = getGoogleFontUrl("Playfair Display");
    expect(url).toContain("family=Playfair+Display");
  });
});

describe("getEventThemeVars", () => {
  const baseEvent = {
    primaryColor: "#4a7ab5",
    fontFamily: "Roboto",
  } as any;

  it("returns CSS custom properties object", () => {
    const vars = getEventThemeVars(baseEvent);
    expect(vars).toHaveProperty("--ss-primary");
    expect(vars).toHaveProperty("--ss-primary-rgb");
    expect(vars).toHaveProperty("--ss-primary-contrast");
    expect(vars).toHaveProperty("--ss-font-family");
  });

  it("uses event primaryColor", () => {
    const vars = getEventThemeVars(baseEvent);
    expect(vars["--ss-primary"]).toBe("#4a7ab5");
  });

  it("computes RGB values", () => {
    const vars = getEventThemeVars(baseEvent);
    expect(vars["--ss-primary-rgb"]).toBe("74, 122, 181");
  });

  it("uses event fontFamily", () => {
    const vars = getEventThemeVars(baseEvent);
    expect(vars["--ss-font-family"]).toBe("Roboto");
  });

  it("defaults to Inter when fontFamily is missing", () => {
    const vars = getEventThemeVars({ primaryColor: "#ffffff" } as any);
    expect(vars["--ss-font-family"]).toBe("Inter");
  });

  it("defaults to #ffffff when primaryColor is missing", () => {
    const vars = getEventThemeVars({} as any);
    expect(vars["--ss-primary"]).toBe("#ffffff");
  });

  it("computes contrast color", () => {
    const darkVars = getEventThemeVars({ primaryColor: "#000000" } as any);
    expect(darkVars["--ss-primary-contrast"]).toBe("#ffffff");

    const lightVars = getEventThemeVars({ primaryColor: "#ffffff" } as any);
    expect(lightVars["--ss-primary-contrast"]).toBe("#000000");
  });
});

describe("sanitizeCss", () => {
  it("returns empty string for falsy input", () => {
    expect(sanitizeCss("")).toBe("");
  });

  it("passes through safe CSS", () => {
    const css = "body { color: red; }";
    expect(sanitizeCss(css)).toBe(css);
  });

  it("blocks expression()", () => {
    expect(sanitizeCss("div { width: expression(1+1); }")).toContain("/* blocked */");
    expect(sanitizeCss("div { width: expression(1+1); }")).not.toContain("expression(");
  });

  it("blocks javascript: protocol", () => {
    expect(sanitizeCss("div { background: javascript:alert(1); }")).toContain("/* blocked */");
  });

  it("blocks -moz-binding", () => {
    expect(sanitizeCss("div { -moz-binding: url('x'); }")).toContain("/* blocked */");
  });

  it("blocks behavior property", () => {
    expect(sanitizeCss("div { behavior: url('x.htc'); }")).toContain("/* blocked */");
  });

  it("blocks @import", () => {
    expect(sanitizeCss("@import url('evil.css');")).toContain("/* blocked */");
  });

  it("blocks @charset", () => {
    expect(sanitizeCss("@charset 'utf-8';")).toContain("/* blocked */");
  });

  it("blocks @namespace", () => {
    expect(sanitizeCss("@namespace url('x');")).toContain("/* blocked */");
  });

  it("blocks javascript in url()", () => {
    expect(sanitizeCss("div { background: url(javascript:alert(1)); }")).toContain("/* blocked */");
  });

  it("blocks <script> tags", () => {
    expect(sanitizeCss("</script><script>alert(1)</script>")).toContain("/* blocked */");
  });

  it("blocks <style> tags", () => {
    expect(sanitizeCss("</style><style>body{}</style>")).toContain("/* blocked */");
  });

  it("truncates CSS longer than 10KB", () => {
    const longCss = "a".repeat(15000);
    expect(sanitizeCss(longCss).length).toBeLessThanOrEqual(10000);
  });

  it("is case-insensitive for blocked patterns", () => {
    expect(sanitizeCss("EXPRESSION(1)")).toContain("/* blocked */");
    expect(sanitizeCss("JAVASCRIPT:alert()")).toContain("/* blocked */");
    expect(sanitizeCss("@IMPORT url()")).toContain("/* blocked */");
  });
});
