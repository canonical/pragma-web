import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpansionIndicator from "./ExpansionIndicator.js";

describe("ExpansionIndicator", () => {
  it("says how many events are hidden and offers both commands", () => {
    const onShowMore = vi.fn();
    const onShowAll = vi.fn();
    render(
      <ExpansionIndicator
        hiddenCount={12}
        step={4}
        onShowMore={onShowMore}
        onShowAll={onShowAll}
      />,
    );
    expect(screen.getByText("12 hidden")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show 4 more" }));
    expect(onShowMore).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(onShowAll).toHaveBeenCalledOnce();
  });

  it("never offers to show more than are hidden", () => {
    render(
      <ExpansionIndicator
        hiddenCount={2}
        step={4}
        onShowMore={() => {}}
        onShowAll={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Show 2 more" }),
    ).toBeInTheDocument();
  });

  it("offers only to show all where a step reveals nothing", () => {
    render(
      <ExpansionIndicator
        hiddenCount={3}
        step={0}
        onShowMore={() => {}}
        onShowAll={() => {}}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Show all" }),
    ).toBeInTheDocument();
  });
});
