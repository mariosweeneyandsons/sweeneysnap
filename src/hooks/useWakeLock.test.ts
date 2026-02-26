import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWakeLock } from "./useWakeLock";

describe("useWakeLock", () => {
  let mockSentinel: any;

  beforeEach(() => {
    mockSentinel = {
      released: false,
      release: vi.fn().mockImplementation(function (this: any) {
        this.released = true;
        return Promise.resolve();
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, "wakeLock", {
      writable: true,
      value: {
        request: vi.fn().mockResolvedValue(mockSentinel),
      },
    });
  });

  it("starts with isActive false", () => {
    const { result } = renderHook(() => useWakeLock());
    expect(result.current.isActive).toBe(false);
  });

  it("request calls navigator.wakeLock.request", async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(navigator.wakeLock.request).toHaveBeenCalledWith("screen");
  });

  it("request sets isActive to true", async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(true);
  });

  it("release calls sentinel.release", async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(mockSentinel.release).toHaveBeenCalled();
  });

  it("release sets isActive to false", async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.isActive).toBe(false);
  });

  it("handles missing wakeLock API gracefully", async () => {
    Object.defineProperty(navigator, "wakeLock", {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request(); // should not throw
    });

    expect(result.current.isActive).toBe(false);
  });
});
