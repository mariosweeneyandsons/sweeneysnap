import { describe, it, expect, vi, afterEach } from "vitest";
import { getSiteUrl } from "./config";

describe("getSiteUrl", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns env var when NEXT_PUBLIC_SITE_URL is set", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_SITE_URL: "https://sweeneysnap.com" };
    expect(getSiteUrl()).toBe("https://sweeneysnap.com");
  });

  it("returns localhost fallback when env var is not set", () => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("returns localhost fallback when env var is empty string", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_SITE_URL: "" };
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("preserves trailing slashes from env var", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_SITE_URL: "https://sweeneysnap.com/" };
    expect(getSiteUrl()).toBe("https://sweeneysnap.com/");
  });

  it("returns a string type", () => {
    expect(typeof getSiteUrl()).toBe("string");
  });
});
