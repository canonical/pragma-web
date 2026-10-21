/**
 * The lens's components take the native props of their root element and
 * spread them onto it, so a site can give any of them an `id`, a `data-*`
 * hook or an `aria-*` attribute. The well is memoised, so its case also
 * proves the memo lets a changed native prop through.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { useMemo, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../testing/createAllNamespacesFilter.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStripHarness from "../../../testing/createStripHarness.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import type { DefinitionsExplorerQuery } from "../../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../../__generated__/DefinitionsExplorerQuery.graphql.js";
import { DefinitionsExplorer } from "../../lib/DefinitionsExplorer/index.js";
import { buildDefinitionsExplorerVariables } from "../../lib/definitionsQuery.js";
import { ExplorerControls } from "../../lib/ExplorerControls/index.js";
import { ExplorerStatus } from "../../lib/ExplorerStatus/index.js";
import { HierarchyWell } from "../../lib/HierarchyWell/index.js";
import { TermInspector } from "../../lib/TermInspector/index.js";
import { TermRail } from "../../lib/TermRail/index.js";

const NO_DEPTHS: ReadonlyMap<string, number> = new Map();
const ignoreHover = (): void => {};

/** The data-reading components over the warm store, each given native props
 * derived from `id`. */
const NativeProbe = ({ id }: { readonly id: string }) => {
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(undefined),
  );
  const filter = useMemo(
    () =>
      createAllNamespacesFilter(
        data.ontologies.map((ontology) => ontology.prefix),
      ),
    [data.ontologies],
  );
  return (
    <>
      <TermRail
        data-probe="rail"
        depthByUri={NO_DEPTHS}
        filter={filter}
        hoverCentre={undefined}
        id={`${id}-rail`}
        onHoverTerm={ignoreHover}
        ontologies={data.ontologies}
      />
      <HierarchyWell
        data-probe="well"
        filter={filter}
        hoverCentre={undefined}
        id={`${id}-well`}
        onHoverTerm={ignoreHover}
        ontologies={data.ontologies}
        term={undefined}
      />
      <TermInspector
        classRef={null}
        data-probe="inspector"
        id={`${id}-inspector`}
        namespaces={[]}
        propertyRef={null}
        term={undefined}
      />
    </>
  );
};

/** The probe with a button that renames it, so the well's native props
 * change while the store, and so every fragment ref, stays the same. */
const RenamableProbe = () => {
  const [id, setId] = useState("first");
  return (
    <>
      <button onClick={() => setId("second")} type="button">
        Rename
      </button>
      <NativeProbe id={id} />
    </>
  );
};

describe("native props", () => {
  it("reach the root of the rail, the well and the inspector", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <RenamableProbe />,
      ),
    );

    expect(container.querySelector("#first-rail")).toHaveClass("term-rail");
    expect(container.querySelector("#first-well")).toHaveClass(
      "hierarchy-well",
    );
    expect(container.querySelector("#first-inspector")).toHaveClass(
      "term-inspector",
    );
    expect(container.querySelector('[data-probe="well"]')).not.toBeNull();

    // The memoised well answers to a changed native prop as well.
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    expect(container.querySelector("#second-well")).toHaveClass(
      "hierarchy-well",
    );
  });

  it("reach the explorer's root", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <DefinitionsExplorer id="explorer" term={undefined} />,
      ),
    );
    expect(container.querySelector("#explorer")).toHaveClass(
      "definitions-explorer",
    );
  });

  it("reach the root of the strip's toolbar and figure", () => {
    render(
      <>
        <ExplorerControls
          aria-describedby="controls-hint"
          filter={createAllNamespacesFilter(["ds"])}
          namespaceLabels={[{ prefix: "ds", label: "ds" }]}
          onFilterChange={() => {}}
        />
        <ExplorerStatus
          abstract={0}
          data-probe="status"
          total={2}
          visible={1}
        />
      </>,
    );
    expect(
      document.querySelector('[aria-describedby="controls-hint"]'),
    ).toHaveClass("explorer-controls");
    expect(screen.getByRole("figure")).toHaveAttribute("data-probe", "status");
  });
});
