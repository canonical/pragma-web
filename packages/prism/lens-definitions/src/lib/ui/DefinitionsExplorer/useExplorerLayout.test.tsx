import { createGraphBudget, GraphBudgetProvider } from "@canonical/prism-core";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../testing/createStripHarness.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";
import useCapturedExplorer from "../../../../testing/useCapturedExplorer.js";
import type { ClassGraphLayout } from "../../classGraph/types.js";

/** A reader of the explorer's layout, handing it to the test. */
function Reader({
  expand,
  onLayout,
}: {
  readonly expand?: string;
  readonly onLayout: (layout: ClassGraphLayout) => void;
}): ReactElement {
  onLayout(useCapturedExplorer(undefined, expand).layout);
  return <span />;
}

describe("useExplorerLayout", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("lays a page's map out once for every reader of the same data and budget, and again for another budget", () => {
    const layouts: Record<string, ClassGraphLayout> = {};
    const keep =
      (name: string) =>
      (layout: ClassGraphLayout): void => {
        layouts[name] = layout;
      };
    render(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <>
          <Reader onLayout={keep("canvas")} />
          <Reader onLayout={keep("inspector")} />
          <Reader expand="ds" onLayout={keep("opened")} />
          <Reader expand="ds" onLayout={keep("opened again")} />
          <GraphBudgetProvider
            budget={createGraphBudget({ drawnNodesMax: 20 })}
          >
            <Reader onLayout={keep("smaller")} />
          </GraphBudgetProvider>
        </>,
      ),
    );
    expect(layouts.inspector).toBe(layouts.canvas);
    expect(layouts["opened again"]).toBe(layouts.opened);
    expect(layouts.opened?.drilled).toBe("ds");
    // Within 20 nodes ds is a box: another budget, another map.
    expect(layouts.smaller).not.toBe(layouts.canvas);
    expect(
      layouts.smaller?.regions.find((region) => region.prefix === "ds")
        ?.collapsed,
    ).toBe(true);
  });
});
