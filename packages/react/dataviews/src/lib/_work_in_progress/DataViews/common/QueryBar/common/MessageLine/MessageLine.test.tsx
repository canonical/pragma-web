import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MessageLine from "./MessageLine.js";

describe("MessageLine", () => {
  it("renders nothing without a message", () => {
    const { container } = render(<MessageLine entries={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows each message with its criticality, never as an alert", () => {
    render(
      <MessageLine
        data-testid="line"
        className="extra"
        entries={[
          { id: "a", text: "Invalid: 16 GX", criticality: "error" },
          { id: "b", text: "Cannot both hold", criticality: "warning" },
        ]}
      />,
    );
    const line = screen.getByTestId("line");
    expect(line).toHaveClass(
      "ds",
      "data-views-query-bar-message-line",
      "extra",
    );
    expect(screen.getByText("Invalid: 16 GX").parentElement).toHaveAttribute(
      "data-criticality",
      "error",
    );
    expect(screen.getByText("Cannot both hold").parentElement).toHaveAttribute(
      "data-criticality",
      "warning",
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers the action that resolves a message", () => {
    const onAction = vi.fn();
    render(
      <MessageLine
        entries={[
          {
            id: "a",
            text: "Cannot both hold",
            criticality: "warning",
            action: { label: "Merge", onAction },
          },
        ]}
      />,
    );
    const merge = screen.getByRole("button", { name: "Merge" });
    // A press takes no focus from where it is.
    expect(fireEvent.mouseDown(merge)).toBe(false);
    fireEvent.click(merge);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("offers it as a link where it leads to an address", () => {
    render(
      <MessageLine
        entries={[
          {
            id: "a",
            text: "Cannot both hold",
            criticality: "warning",
            action: { label: "Merge", href: "?cores__gte=2" },
          },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Merge" })).toHaveAttribute(
      "href",
      "?cores__gte=2",
    );
  });
});
