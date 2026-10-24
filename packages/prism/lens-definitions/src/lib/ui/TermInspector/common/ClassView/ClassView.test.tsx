import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";

describe("ClassView", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("renders in the inspector over the captured store", () => {
    const { container } = render(
      createStripHarness(
        `/definitions/${encodeURIComponent(UIBLOCK_TERM)}`,
        definitionsExplorerRecords,
        createFetchSpy(),
        <InspectorProbe term={UIBLOCK_TERM} />,
      ),
    );
    const view = container.querySelector(".ds.class-view");
    expect(view).not.toBeNull();
    expect(view?.querySelectorAll(".section")).toHaveLength(6);
    expect(view?.getAttribute("aria-labelledby")).toBe("term-inspector-title");
  });
});
