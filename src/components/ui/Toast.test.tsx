import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "./Toast";

// Mock motion/react to avoid animation timing issues
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, layout, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Helper component that triggers toasts
function TestConsumer({ message, type }: { message: string; type?: "success" | "error" | "info" | "warning" }) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(message, type)}>Show Toast</button>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("useToast throws outside provider", () => {
    // Suppress console.error for this expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      function Bad() { useToast(); return null; }
      render(<Bad />);
    }).toThrow("useToast must be used within <ToastProvider>");
    spy.mockRestore();
  });

  it("renders children inside provider", () => {
    render(
      <ToastProvider>
        <span>Hello</span>
      </ToastProvider>
    );
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("shows a toast message when triggered", () => {
    render(
      <ToastProvider>
        <TestConsumer message="Test message" />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });

    expect(screen.getByText("Test message")).toBeDefined();
  });

  it("auto-dismisses after 3 seconds", () => {
    render(
      <ToastProvider>
        <TestConsumer message="Auto dismiss" />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Show Toast"));
    });
    expect(screen.getByText("Auto dismiss")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByText("Auto dismiss")).toBeNull();
  });

  it("limits to 5 visible toasts", () => {
    let counter = 0;
    function MultiConsumer() {
      const { toast } = useToast();
      return (
        <button onClick={() => toast(`Toast ${++counter}`)}>Add</button>
      );
    }

    render(
      <ToastProvider>
        <MultiConsumer />
      </ToastProvider>
    );

    for (let i = 0; i < 7; i++) {
      act(() => {
        fireEvent.click(screen.getByText("Add"));
      });
    }

    // Only 5 should be visible (the last 5)
    const toastMessages = screen.queryAllByText(/^Toast \d+$/);
    expect(toastMessages.length).toBeLessThanOrEqual(5);
  });
});
