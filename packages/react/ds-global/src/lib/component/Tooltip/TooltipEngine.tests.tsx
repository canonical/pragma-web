import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WindowFitmentSide } from "../../hooks/index.js";
import { TooltipEngine } from "./index.js";

const EXPLICIT_DIRECTIONS: readonly WindowFitmentSide[] = ["block-end"];

describe("TooltipEngine", () => {
  const Target = ({ state }: { state: string }) => (
    <button type="button">{`Target (${state})`}</button>
  );

  it("renders the message as a live prop — reactive to rerender", async () => {
    const { rerender } = render(
      <TooltipEngine Message="Collapse">
        <Target state="expanded" />
      </TooltipEngine>,
    );
    fireEvent.pointerEnter(screen.getByRole("button"));
    expect(await screen.findByText("Collapse")).toBeInTheDocument();

    rerender(
      <TooltipEngine Message="Expand">
        <Target state="collapsed" />
      </TooltipEngine>,
    );
    fireEvent.pointerEnter(screen.getByRole("button"));
    expect(await screen.findByText("Expand")).toBeInTheDocument();
  });

  it("keeps the same target element identity across rerenders", () => {
    const { rerender } = render(
      <TooltipEngine Message="Collapse">
        <Target state="expanded" />
      </TooltipEngine>,
    );
    const targetBefore = document.querySelector(
      ".ds.tooltip-area > .target",
    ) as HTMLElement;
    rerender(
      <TooltipEngine Message="Expand">
        <Target state="collapsed" />
      </TooltipEngine>,
    );
    const targetAfter = document.querySelector(
      ".ds.tooltip-area > .target",
    ) as HTMLElement;
    // One stable element across prop changes — switching between two
    // withTooltip-wrapped types would remount the target.
    expect(targetAfter).toBe(targetBefore);
  });

  it("resolves placement and reveals role='tooltip' on hover and focus when preferredDirections is explicit", async () => {
    render(
      <TooltipEngine
        Message="Positioned tooltip"
        preferredDirections={EXPLICIT_DIRECTIONS}
      >
        <Target state="idle" />
      </TooltipEngine>,
    );

    const button = screen.getByRole("button");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.pointerEnter(button);
    const tooltipOnHover = await screen.findByRole("tooltip");
    expect(tooltipOnHover).toBeVisible();
    expect(tooltipOnHover).toHaveAttribute("aria-hidden", "false");
    expect(tooltipOnHover).toHaveClass("bottom");

    fireEvent.pointerLeave(button);
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );

    fireEvent.focus(button);
    const tooltipOnFocus = await screen.findByRole("tooltip");
    expect(tooltipOnFocus).toBeVisible();
    expect(tooltipOnFocus).toHaveClass("bottom");
  });

  it("resolves placement and reveals role='tooltip' when controlled open with explicit preferredDirections", async () => {
    render(
      <TooltipEngine
        open
        Message="Always open"
        preferredDirections={EXPLICIT_DIRECTIONS}
      >
        <Target state="pinned" />
      </TooltipEngine>,
    );

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveAttribute("aria-hidden", "false");
    expect(tooltip).toHaveClass("bottom");
  });
});
