import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  PROPERTY_TERM,
} from "../../../../../../testing/fixtures.js";
import InspectorProbe from "../../../../../../testing/InspectorProbe.js";
import classEdges from "../../../../../../testing/records/classEdges.js";
import definitionsExplorerRecordsProperty from "../../../../../../testing/records/definitionsExplorerRecordsProperty.js";
import { MESSAGES } from "../../../../i18n/index.js";

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

  it("lists the property's class edges, the classes as links and the counts as figures", () => {
    const { container } = render(
      createStripHarness(
        `/definitions/${encodeURIComponent(PROPERTY_TERM)}`,
        definitionsExplorerRecordsProperty,
        createFetchSpy(),
        <InspectorProbe term={PROPERTY_TERM} />,
      ),
    );
    const own = classEdges.filter(
      (edge) => edge.property === "https://ds.canonical.com/hasSubcomponent",
    );
    expect(own.length).toBeGreaterThan(0);
    const rows = container.querySelectorAll(".property-view .edges tbody tr");
    expect(rows).toHaveLength(own.length);
    for (const [index, row] of [...rows].entries()) {
      expect(row.querySelectorAll("td a")).toHaveLength(2);
      expect(row.querySelector("td.is-figure")?.textContent).toBe(
        String(own.at(index)?.count),
      );
    }
  });

  it("says a property no statement between classes uses has none yet", () => {
    const { container } = render(
      createStripHarness(
        `/definitions/${encodeURIComponent(PROPERTY_TERM)}`,
        definitionsExplorerRecordsProperty,
        createFetchSpy(),
        <InspectorProbe classEdges={[]} term={PROPERTY_TERM} />,
      ),
    );
    const view = container.querySelector(".property-view");
    expect(view?.querySelector(".edges")).toBeNull();
    expect(view?.textContent).toContain(
      String(MESSAGES["inspector.property.edges.none"]),
    );
  });
});
