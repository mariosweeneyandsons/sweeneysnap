import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShortcutHelpModal } from "./ShortcutHelpModal";

// Mock the Modal component since it uses native dialog which jsdom doesn't fully support
vi.mock("@/components/ui/Modal", () => ({
  Modal: ({ open, onClose, title, children }: any) => {
    if (!open) return null;
    return (
      <div data-testid="modal" role="dialog">
        {title && <h2>{title}</h2>}
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

describe("ShortcutHelpModal", () => {
  it("renders nothing when closed", () => {
    const onClose = vi.fn();
    const { container } = render(<ShortcutHelpModal open={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders modal when open", () => {
    const onClose = vi.fn();
    render(<ShortcutHelpModal open={true} onClose={onClose} />);
    expect(screen.getByTestId("modal")).toBeDefined();
  });

  it("shows 'Keyboard Shortcuts' title", () => {
    const onClose = vi.fn();
    render(<ShortcutHelpModal open={true} onClose={onClose} />);
    expect(screen.getByText("Keyboard Shortcuts")).toBeDefined();
  });

  it("shows Global shortcuts section", () => {
    const onClose = vi.fn();
    render(<ShortcutHelpModal open={true} onClose={onClose} />);
    expect(screen.getByText("Global")).toBeDefined();
  });

  it("shows Moderation shortcuts section", () => {
    const onClose = vi.fn();
    render(<ShortcutHelpModal open={true} onClose={onClose} />);
    expect(screen.getByText("Moderation")).toBeDefined();
  });

  it("displays shortcut actions", () => {
    const onClose = vi.fn();
    render(<ShortcutHelpModal open={true} onClose={onClose} />);
    expect(screen.getByText("Show this help")).toBeDefined();
    expect(screen.getByText("Go to Dashboard")).toBeDefined();
    expect(screen.getByText("Approve selected")).toBeDefined();
  });

  it("renders kbd elements for keys", () => {
    const onClose = vi.fn();
    const { container } = render(<ShortcutHelpModal open={true} onClose={onClose} />);
    const kbds = container.querySelectorAll("kbd");
    expect(kbds.length).toBeGreaterThan(0);
    expect(kbds[0].textContent).toBe("?");
  });

  it("shows 'then' for two-stroke shortcuts", () => {
    const onClose = vi.fn();
    render(<ShortcutHelpModal open={true} onClose={onClose} />);
    const thenElements = screen.getAllByText("then");
    expect(thenElements.length).toBeGreaterThan(0);
  });
});
