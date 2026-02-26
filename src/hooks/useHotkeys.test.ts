import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHotkeys, useTwoStrokeHotkeys } from "./useHotkeys";

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, ...opts });
  document.dispatchEvent(event);
}

describe("useHotkeys", () => {
  it("calls handler when matching key is pressed", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", handler }]));

    fireKey("a");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call handler for non-matching key", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", handler }]));

    fireKey("b");
    expect(handler).not.toHaveBeenCalled();
  });

  it("is case-insensitive for key matching", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "A", handler }]));

    fireKey("a");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("requires ctrl/meta key when ctrl option is set", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "s", ctrl: true, handler }]));

    fireKey("s");
    expect(handler).not.toHaveBeenCalled();

    fireKey("s", { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("requires shift key when shift option is set", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "?", shift: true, handler }]));

    fireKey("?");
    expect(handler).not.toHaveBeenCalled();

    fireKey("?", { shiftKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire when enabled is false", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", enabled: false, handler }]));

    fireKey("a");
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not fire when input element is focused", () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", handler }]));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    fireKey("a");
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("cleans up listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkeys([{ key: "a", handler }]));

    unmount();
    fireKey("a");
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useTwoStrokeHotkeys", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires handler on two-stroke combo", () => {
    const handler = vi.fn();
    renderHook(() =>
      useTwoStrokeHotkeys("g", [{ key: "d", handler }])
    );

    fireKey("g");
    fireKey("d");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire handler without first stroke", () => {
    const handler = vi.fn();
    renderHook(() =>
      useTwoStrokeHotkeys("g", [{ key: "d", handler }])
    );

    fireKey("d");
    expect(handler).not.toHaveBeenCalled();
  });

  it("cancels pending after 1 second timeout", () => {
    const handler = vi.fn();
    renderHook(() =>
      useTwoStrokeHotkeys("g", [{ key: "d", handler }])
    );

    fireKey("g");
    act(() => { vi.advanceTimersByTime(1100); });
    fireKey("d");
    expect(handler).not.toHaveBeenCalled();
  });

  it("cancels pending on non-matching second key", () => {
    const handler = vi.fn();
    renderHook(() =>
      useTwoStrokeHotkeys("g", [{ key: "d", handler }])
    );

    fireKey("g");
    fireKey("x"); // wrong second key
    fireKey("d"); // should not fire
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not fire when enabled is false", () => {
    const handler = vi.fn();
    renderHook(() =>
      useTwoStrokeHotkeys("g", [{ key: "d", handler }], false)
    );

    fireKey("g");
    fireKey("d");
    expect(handler).not.toHaveBeenCalled();
  });

  it("supports multiple second-key combos", () => {
    const handlerD = vi.fn();
    const handlerP = vi.fn();
    renderHook(() =>
      useTwoStrokeHotkeys("g", [
        { key: "d", handler: handlerD },
        { key: "p", handler: handlerP },
      ])
    );

    fireKey("g");
    fireKey("p");
    expect(handlerP).toHaveBeenCalledTimes(1);
    expect(handlerD).not.toHaveBeenCalled();
  });

  it("cleans up listeners on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useTwoStrokeHotkeys("g", [{ key: "d", handler }])
    );

    unmount();
    fireKey("g");
    fireKey("d");
    expect(handler).not.toHaveBeenCalled();
  });
});
