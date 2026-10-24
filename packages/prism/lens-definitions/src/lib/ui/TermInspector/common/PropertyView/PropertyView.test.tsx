import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  PROPERTY_TERM,
} from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecordsProperty from "../../../../../../testing/records/definitionsExplorerRecordsProperty.js";

describe("PropertyView", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("renders in the inspector over the captured store", () => {
    const { container } = render(
      createStripHarness(
        `/definitions/${encodeURIComponent(PROPERTY_TERM)}`,
        definitionsExplorerRecordsProperty,
        createFetchSpy(),
        <InspectorProbe term={PROPERTY_TERM} />,
      ),
    );
    const view = container.querySelector(".ds.property-view");
    expect(view).not.toBeNull();
    expect(view?.querySelectorAll(".key")).toHaveLength(5);
    expect(view?.getAttribute("aria-labelledby")).toBe("term-inspector-title");
  });
});
