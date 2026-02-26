import { describe, it, expect } from "vitest";
import { formatBytes } from "./format";

describe("formatBytes", () => {
  it("returns '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(2621440)).toBe("2.5 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("rounds to one decimal place", () => {
    expect(formatBytes(1234567)).toBe("1.2 MB");
  });

  it("handles small byte values", () => {
    expect(formatBytes(1)).toBe("1 B");
  });

  it("handles exact power-of-1024 boundaries", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
  });
});
