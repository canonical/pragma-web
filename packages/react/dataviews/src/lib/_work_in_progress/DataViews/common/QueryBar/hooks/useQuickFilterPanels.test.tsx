import { act, render, renderHook, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../../../../testing/index.js";
import { FilterButton } from "../../../../FilterButton/index.js";
import useQuickFilterPanels from "./useQuickFilterPanels.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

describe("useQuickFilterPanels", () => {
  it("hands each field one ref, at one identity", () => {
    const { result, rerender } = renderHook(() => useQuickFilterPanels());
    const status = result.current.collectPanel("status");
    rerender();
    expect(result.current.collectPanel("status")).toBe(status);
    expect(result.current.collectPanel("pool")).not.toBe(status);
  });

  it("closes every open panel it holds, and forgets one unmounted", () => {
    const { result } = renderHook(() => useQuickFilterPanels());
    const { rerender } = render(
      <>
        <FilterButton
          label="Status"
          panelRef={result.current.collectPanel("status")}
        >
          Status options
        </FilterButton>
        <FilterButton
          label="Pool"
          panelRef={result.current.collectPanel("pool")}
        >
          Pool options
        </FilterButton>
      </>,
    );
    act(() => screen.getByRole("button", { name: "Status" }).click());
    const panel = document.getElementById(
      screen
        .getByRole("button", { name: "Status" })
        .getAttribute("aria-controls") ?? "",
    ) as HTMLElement;
    expect(panel.matches(":popover-open")).toBe(true);
    act(() => result.current.hidePanels());
    expect(panel.matches(":popover-open")).toBe(false);
    rerender(<></>);
    expect(() => result.current.hidePanels()).not.toThrow();
  });

  it("forgets a handle its ref lets go", () => {
    const { result } = renderHook(() => useQuickFilterPanels());
    const hide = vi.fn();
    const ref = result.current.collectPanel("status");
    ref({ show: vi.fn(), hide, toggle: vi.fn(), element: null });
    result.current.hidePanels();
    expect(hide).toHaveBeenCalledTimes(1);
    ref(null);
    result.current.hidePanels();
    expect(hide).toHaveBeenCalledTimes(1);
  });
});
