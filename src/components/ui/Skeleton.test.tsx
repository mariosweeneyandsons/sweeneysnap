import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a div element", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.tagName).toBe("DIV");
  });

  it("has animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("animate-pulse");
  });

  it("has bg-secondary class", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("bg-secondary");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="w-full h-8" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("w-full");
    expect(div.className).toContain("h-8");
  });

  it("applies custom style", () => {
    const { container } = render(<Skeleton style={{ width: 200, height: 20 }} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe("200px");
    expect(div.style.height).toBe("20px");
  });

  it("uses empty string as default className", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("animate-pulse bg-secondary rounded-xs");
  });
});
