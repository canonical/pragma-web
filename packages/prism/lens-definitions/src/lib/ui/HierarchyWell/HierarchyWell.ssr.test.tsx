import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import HierarchyWell from "./HierarchyWell.js";

const { layout, terms } = createClassGraphSetup();

/** Render the well to a string at a selected term. */
function renderWell(term: string | undefined): string {
  return renderToString(
    createRouterHarness(
      <HierarchyWell
        filter={createAllNamespacesFilter(["ds", "cs", "anatomy"])}
        hoverCentre={undefined}
        layout={layout}
        onHoverTerm={() => {}}
        term={term}
        terms={terms}
      />,
    ),
  );
}

describe("HierarchyWell SSR", () => {
  it("server-renders the selection's ring, lineage and fade, the camera untouched", () => {
    const html = renderWell("ds:Component");
    expect(html).toContain('class="ring is-selected"');
    expect(html).toContain('class="chain"');
    expect(html).toContain("node is-faded");
    expect(html).toContain('<g class="camera">');
  });

  it("server-renders no fade without a selection", () => {
    expect(renderWell(undefined)).not.toContain("is-faded");
  });

  it("renders the same markup every time", () => {
    expect(renderWell("ds:Component")).toBe(renderWell("ds:Component"));
  });
});
