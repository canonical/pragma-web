import "../../../../testing/stubReactFlowGlobals.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import journeysExplorerRecords from "../__fixtures__/journeysExplorerRecords.js";
import {
  JOURNEYS_TEST_TIMEOUT_MS,
  journeysLayoutAt,
} from "../__fixtures__/journeysPageHarness.js";

/** The view the explorer in the canvas shows, read off its `data-view`. */
const readExplorerView = (): string | null =>
  document.querySelector(".journeys-explorer")?.getAttribute("data-view") ??
  null;

describe("JourneysLayout", () => {
  it("shares one view between the strip's switch and the explorer in the canvas", {
    timeout: JOURNEYS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    const { container } = render(
      journeysLayoutAt(undefined, journeysExplorerRecords, fetchFn),
    );

    const layout = container.querySelector(".ds.journeys-layout");
    expect(layout).not.toBeNull();
    const strip = layout?.querySelector('[data-region="mode-strip"]');
    const graphOption = screen.getByRole("button", { name: "Graph" });
    expect(strip?.contains(graphOption)).toBe(true);
    expect(readExplorerView()).toBe("table");

    fireEvent.click(graphOption);

    expect(graphOption).toHaveAttribute("aria-pressed", "true");
    expect(readExplorerView()).toBe("graph");
    expect(document.querySelector(".react-flow__node-hop")).not.toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
