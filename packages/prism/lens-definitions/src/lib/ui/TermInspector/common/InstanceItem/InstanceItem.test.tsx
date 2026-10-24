import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import {
  COMPONENT_TERM,
  DEFINITIONS_TEST_TIMEOUT_MS,
} from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import definitionsExplorerRecordsComponent from "../../../../../../testing/records/definitionsExplorerRecordsComponent.js";

describe("InstanceItem", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("renders in the inspector over the captured store", () => {
    const { container } = render(
      createStripHarness(
        `/definitions/${encodeURIComponent(COMPONENT_TERM)}`,
        definitionsExplorerRecordsComponent,
        createFetchSpy(),
        <InspectorProbe term={COMPONENT_TERM} />,
      ),
    );
    const view = container.querySelector(".ds.instance-item");
    expect(view).not.toBeNull();
    expect(view?.querySelector("code")?.textContent).toBe(
      "ds:apps_launchpad.component.accordion",
    );
  });
});
