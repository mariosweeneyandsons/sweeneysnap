import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("renders as a button element", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-foreground");
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-destructive");
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-secondary");
  });

  it("applies ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("hover:bg-secondary");
  });

  it("applies size classes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("px-3");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("px-6");
  });

  it("is disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner svg when loading", () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole("button");
    const svg = btn.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.classList.contains("animate-spin")).toBe(true);
  });

  it("calls onClick handler", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button disabled onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(false);
  });

  it("applies custom className", () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("my-custom");
  });

  it("has displayName", () => {
    expect(Button.displayName).toBe("Button");
  });
});
