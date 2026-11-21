import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpansionIndicator from "./ExpansionIndicator.js";
import type { ExpansionIndicatorProps } from "./types.js";

const props = (
  overrides: Partial<ExpansionIndicatorProps> = {},
): ExpansionIndicatorProps => ({
  hidden: { kind: "exact", value: 12 },
  step: 4,
  onShowMore: () => {},
  onShowAll: () => {},
  moreHref: null,
  hydrated: true,
  ...overrides,
});

describe("ExpansionIndicator", () => {
  it("says how many events are hidden and offers both commands", () => {
    const onShowMore = vi.fn();
    const onShowAll = vi.fn();
    render(<ExpansionIndicator {...props({ onShowMore, onShowAll })} />);
    expect(screen.getByText("12 hidden")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show 4 more" }));
    expect(onShowMore).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(onShowAll).toHaveBeenCalledOnce();
  });

  it("says the hidden events as the source counts them", () => {
    render(
      <ExpansionIndicator
        {...props({ hidden: { kind: "unknown" }, onShowAll: null })}
      />,
    );
    expect(screen.getByText("More not yet shown")).toBeInTheDocument();
  });

  it("offers only to show all where a step reveals nothing", () => {
    render(<ExpansionIndicator {...props({ step: 0 })} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Show all" }),
    ).toBeInTheDocument();
  });

  it("offers no show all where the page hides nothing", () => {
    render(<ExpansionIndicator {...props({ onShowAll: null })} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Show 4 more" }),
    ).toBeInTheDocument();
  });

  it("links to the grown window before scripts take over", () => {
    render(
      <ExpansionIndicator
        {...props({ moreHref: "?size=54", hydrated: false, onShowAll: null })}
      />,
    );
    expect(screen.getByRole("link", { name: "Show 4 more" })).toHaveAttribute(
      "href",
      "?size=54",
    );
  });

  it("stays a button before scripts where there is nowhere to link to", () => {
    render(<ExpansionIndicator {...props({ hydrated: false })} />);
    expect(
      screen.getByRole("button", { name: "Show 4 more" }),
    ).toBeInTheDocument();
  });
});
