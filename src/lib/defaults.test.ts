import { describe, it, expect } from "vitest";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_BG_COLOR,
  DEFAULT_FONT,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_MAX_UPLOADS,
  DEFAULT_COUNTDOWN_SECONDS,
  IMAGE_QUALITY,
  CANVAS_SIZE,
  CURSOR_HIDE_DELAY_MS,
} from "./defaults";

describe("defaults", () => {
  it("DEFAULT_PRIMARY_COLOR is a valid hex color", () => {
    expect(DEFAULT_PRIMARY_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("DEFAULT_BG_COLOR is a valid hex color", () => {
    expect(DEFAULT_BG_COLOR).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("DEFAULT_FONT is Inter", () => {
    expect(DEFAULT_FONT).toBe("Inter");
  });

  it("DEFAULT_MAX_FILE_SIZE_MB is a positive number", () => {
    expect(DEFAULT_MAX_FILE_SIZE_MB).toBeGreaterThan(0);
    expect(DEFAULT_MAX_FILE_SIZE_MB).toBe(10);
  });

  it("DEFAULT_MAX_UPLOADS is a positive integer", () => {
    expect(DEFAULT_MAX_UPLOADS).toBeGreaterThan(0);
    expect(Number.isInteger(DEFAULT_MAX_UPLOADS)).toBe(true);
  });

  it("DEFAULT_COUNTDOWN_SECONDS is a positive integer", () => {
    expect(DEFAULT_COUNTDOWN_SECONDS).toBeGreaterThan(0);
    expect(DEFAULT_COUNTDOWN_SECONDS).toBe(3);
  });

  it("IMAGE_QUALITY is between 0 and 1", () => {
    expect(IMAGE_QUALITY).toBeGreaterThan(0);
    expect(IMAGE_QUALITY).toBeLessThanOrEqual(1);
    expect(IMAGE_QUALITY).toBe(0.9);
  });

  it("CANVAS_SIZE is a positive number", () => {
    expect(CANVAS_SIZE).toBeGreaterThan(0);
    expect(CANVAS_SIZE).toBe(1080);
  });

  it("CURSOR_HIDE_DELAY_MS is a positive number", () => {
    expect(CURSOR_HIDE_DELAY_MS).toBeGreaterThan(0);
    expect(CURSOR_HIDE_DELAY_MS).toBe(3000);
  });
});
