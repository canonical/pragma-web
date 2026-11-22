import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DateTime from "./DateTime.js";
import type { DateTimeProps } from "./types.js";

const props = (overrides: Partial<DateTimeProps> = {}): DateTimeProps => ({
  value: "2024-06-15T10:00:00Z",
  display: "Jun 15, 2024, 10:00 AM",
  alternate: "2 hours ago",
  tooltip: true,
  toggleable: false,
  pressed: false,
  onToggle: () => {},
  ...overrides,
});

const readTime = (container: HTMLElement): HTMLTimeElement => {
  const time = container.querySelector("time");
  if (time === null) {
    throw new Error("no time drawn");
  }
  return time;
};

describe("DateTime", () => {
  it("draws the date as a time element carrying its ISO value", () => {
    const { container } = render(<DateTime {...props()} />);
    const time = readTime(container);
    expect(time).toHaveTextContent("Jun 15, 2024, 10:00 AM");
    expect(time).toHaveAttribute("datetime", "2024-06-15T10:00:00Z");
    expect(time).toHaveClass("ds", "data-timeline-datetime");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("describes the date by its other form", () => {
    render(<DateTime {...props()} />);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
      "2 hours ago",
    );
  });

  it("shows no tooltip where the formats turn it off, or it would repeat the date", () => {
    const { unmount } = render(<DateTime {...props({ tooltip: false })} />);
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
    unmount();
    render(<DateTime {...props({ alternate: "Jun 15, 2024, 10:00 AM" })} />);
    expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
  });

  it("draws a pressed-state button switching the form where toggling is allowed", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <DateTime {...props({ toggleable: true, pressed: true, onToggle })} />,
    );
    const button = screen.getByRole("button", {
      name: "Jun 15, 2024, 10:00 AM",
    });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("ds", "data-timeline-datetime");
    expect(readTime(container)).toHaveClass("value");
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
