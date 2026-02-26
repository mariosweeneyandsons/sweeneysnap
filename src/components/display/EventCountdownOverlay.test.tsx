import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCountdownOverlay } from "./EventCountdownOverlay";

describe("EventCountdownOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when no dates are set", () => {
    const { container } = render(<EventCountdownOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when event has ended", () => {
    const past = Date.now() - 60000;
    const { container } = render(<EventCountdownOverlay endsAt={past} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows 'Starts in' when event hasn't started", () => {
    const future = Date.now() + 3600000; // 1 hour from now
    render(<EventCountdownOverlay startsAt={future} />);
    expect(screen.getByText("Starts in")).toBeDefined();
  });

  it("shows 'Ends in' when event is active", () => {
    const past = Date.now() - 1000;
    const future = Date.now() + 3600000;
    render(<EventCountdownOverlay startsAt={past} endsAt={future} />);
    expect(screen.getByText("Ends in")).toBeDefined();
  });

  it("formats time as HH:MM:SS", () => {
    // Set time to exactly 1 hour, 30 minutes, 45 seconds from now
    const future = Date.now() + (1 * 3600 + 30 * 60 + 45) * 1000;
    render(<EventCountdownOverlay startsAt={future} />);
    expect(screen.getByText("01:30:45")).toBeDefined();
  });

  it("shows 00:00:00 format for very small remaining time", () => {
    const future = Date.now() + 500; // less than 1 second
    render(<EventCountdownOverlay startsAt={future} />);
    expect(screen.getByText("00:00:00")).toBeDefined();
  });
});
