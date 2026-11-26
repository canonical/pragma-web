import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Tag from "./Tag.js";

describe("Tag", () => {
  it("renders children", () => {
    render(<Tag>Test Tag</Tag>);
    expect(screen.getByText("Test Tag")).toBeInTheDocument();
  });

  it("applies ds tag class", () => {
    render(<Tag>Tag</Tag>);
    const tag = screen.getByText("Tag");
    expect(tag).toHaveClass("ds", "tag");
  });

  it("applies criticality modifier class", () => {
    render(<Tag criticality="warning">Warning</Tag>);
    const tag = screen.getByText("Warning");
    expect(tag).toHaveClass("ds", "tag", "warning");
  });

  it("applies custom className", () => {
    render(<Tag className="custom">Tag</Tag>);
    const tag = screen.getByText("Tag");
    expect(tag).toHaveClass("ds", "tag", "custom");
  });

  it("renders as span element", () => {
    render(<Tag>Tag</Tag>);
    const tag = screen.getByText("Tag");
    expect(tag.tagName).toBe("SPAN");
  });

  it("passes through HTML attributes", () => {
    render(<Tag data-testid="my-tag">Tag</Tag>);
    expect(screen.getByTestId("my-tag")).toBeInTheDocument();
  });
});
