import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFullscreen } from "./useFullscreen";

describe("useFullscreen", () => {
  beforeEach(() => {
    // Mock fullscreen API
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: null,
    });

    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
  });

  it("starts with isFullscreen false", () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });

  it("enter calls requestFullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enter();
    });

    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it("exit calls exitFullscreen when in fullscreen", async () => {
    Object.defineProperty(document, "fullscreenElement", { value: document.documentElement });

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.exit();
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it("exit does not call exitFullscreen when not in fullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.exit();
    });

    expect(document.exitFullscreen).not.toHaveBeenCalled();
  });

  it("toggle calls enter when not fullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      result.current.toggle();
    });

    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it("updates isFullscreen on fullscreenchange event", () => {
    const { result } = renderHook(() => useFullscreen());

    act(() => {
      Object.defineProperty(document, "fullscreenElement", { value: document.documentElement });
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(true);
  });
});
