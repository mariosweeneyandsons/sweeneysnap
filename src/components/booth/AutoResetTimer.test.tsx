import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { AutoResetTimer } from "./AutoResetTimer";

describe("AutoResetTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the initial remaining seconds", () => {
    const onReset = vi.fn();
    render(<AutoResetTimer seconds={10} onReset={onReset} />);
    expect(screen.getByText("10")).toBeDefined();
  });

  it("counts down each second", () => {
    const onReset = vi.fn();
    render(<AutoResetTimer seconds={5} onReset={onReset} />);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText("4")).toBeDefined();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText("3")).toBeDefined();
  });

  it("calls onReset when countdown reaches 0", () => {
    const onReset = vi.fn();
    render(<AutoResetTimer seconds={3} onReset={onReset} />);

    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("calls onReset when clicked (skip)", () => {
    const onReset = vi.fn();
    render(<AutoResetTimer seconds={30} onReset={onReset} />);

    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders an SVG circle for progress", () => {
    const onReset = vi.fn();
    const { container } = render(<AutoResetTimer seconds={10} onReset={onReset} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2); // background + progress
  });

  it("has 'Tap to skip' title on button", () => {
    const onReset = vi.fn();
    render(<AutoResetTimer seconds={10} onReset={onReset} />);
    expect(screen.getByTitle("Tap to skip")).toBeDefined();
  });
});
