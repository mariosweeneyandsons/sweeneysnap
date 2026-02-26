import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CaptureCountdownOverlay } from "./CaptureCountdownOverlay";

// Mock motion/react to avoid animation complexities in tests
vi.mock("motion/react", () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("CaptureCountdownOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows initial count", () => {
    const onComplete = vi.fn();
    render(<CaptureCountdownOverlay onComplete={onComplete} />);
    expect(screen.getByText("3")).toBeDefined();
  });

  it("uses custom seconds prop", () => {
    const onComplete = vi.fn();
    render(<CaptureCountdownOverlay seconds={5} onComplete={onComplete} />);
    expect(screen.getByText("5")).toBeDefined();
  });

  it("counts down each second", () => {
    const onComplete = vi.fn();
    render(<CaptureCountdownOverlay seconds={3} onComplete={onComplete} />);

    expect(screen.getByText("3")).toBeDefined();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText("2")).toBeDefined();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText("1")).toBeDefined();
  });

  it("calls onComplete when countdown reaches 0", () => {
    const onComplete = vi.fn();
    render(<CaptureCountdownOverlay seconds={2} onComplete={onComplete} />);

    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("applies primaryColor style", () => {
    const onComplete = vi.fn();
    const { container } = render(
      <CaptureCountdownOverlay onComplete={onComplete} primaryColor="#ff0000" />
    );
    const span = container.querySelector("span[style]");
    expect(span?.getAttribute("style")).toContain("color: rgb(255, 0, 0)");
  });

  it("uses inline variant by default", () => {
    const onComplete = vi.fn();
    const { container } = render(<CaptureCountdownOverlay onComplete={onComplete} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("absolute");
  });

  it("applies fullscreen variant", () => {
    const onComplete = vi.fn();
    const { container } = render(
      <CaptureCountdownOverlay onComplete={onComplete} variant="fullscreen" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("fixed");
  });

  it("defaults to white color when primaryColor not provided", () => {
    const onComplete = vi.fn();
    const { container } = render(<CaptureCountdownOverlay onComplete={onComplete} />);
    const span = container.querySelector("span[style]");
    const style = span?.getAttribute("style") ?? "";
    // jsdom may render as rgb or hex
    expect(style.includes("#ffffff") || style.includes("rgb(255, 255, 255)")).toBe(true);
  });
});
