/**
 * The lens's components take the native props of their root element and
 * spread them onto it, so a site can give any of them an `id`, a `data-*`
 * hook or an `aria-*` attribute. The well is memoised, so its case also
 * proves the memo lets a changed native prop through. The parts the well
 * and the inspector compose do the same, and merge a given class and style
 * with their own.
 */

import { HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode, useMemo, useState } from "react";
import { useFragment, useLazyLoadQuery } from "react-relay";
import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../testing/createAllNamespacesFilter.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStripHarness from "../../../testing/createStripHarness.js";
import {
  COMPONENT_TERM,
  DEFINITIONS_TEST_TIMEOUT_MS,
  HOMES,
  PROPERTY_TERM,
} from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import definitionsExplorerRecordsComponent from "../../../testing/records/definitionsExplorerRecordsComponent.js";
import definitionsExplorerRecordsProperty from "../../../testing/records/definitionsExplorerRecordsProperty.js";
import type { DefinitionsExplorerQuery } from "../../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../../__generated__/DefinitionsExplorerQuery.graphql.js";
import type { TermInspector_class$key } from "../../__generated__/TermInspector_class.graphql.js";
import termInspectorClassFragmentNode from "../../__generated__/TermInspector_class.graphql.js";
import type { TermInspector_property$key } from "../../__generated__/TermInspector_property.graphql.js";
import termInspectorPropertyFragmentNode from "../../__generated__/TermInspector_property.graphql.js";
import { DefinitionsExplorer } from "../../lib/DefinitionsExplorer/index.js";
import { buildDefinitionsExplorerVariables } from "../../lib/definitionsQuery.js";
import { ExplorerControls } from "../../lib/ExplorerControls/index.js";
import { ExplorerStatus } from "../../lib/ExplorerStatus/index.js";
import { TermNode } from "../../lib/HierarchyWell/common/TermNode/index.js";
import { WellLegend } from "../../lib/HierarchyWell/common/WellLegend/index.js";
import { HierarchyWell } from "../../lib/HierarchyWell/index.js";
import { ClassView } from "../../lib/TermInspector/common/ClassView/index.js";
import { InstanceItem } from "../../lib/TermInspector/common/InstanceItem/index.js";
import { Lineage } from "../../lib/TermInspector/common/Lineage/index.js";
import { PropertyTable } from "../../lib/TermInspector/common/PropertyTable/index.js";
import { PropertyView } from "../../lib/TermInspector/common/PropertyView/index.js";
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

/** The inspector's class parts over the `ds:Component` store, each given
 * an `id` and a `data-probe` hook. */
const ClassPartsProbe = () => {
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(COMPONENT_TERM),
  );
  const classData = useFragment<TermInspector_class$key>(
    termInspectorClassFragmentNode,
    data.ontologyClass ?? null,
  );
  if (!classData) throw new Error("the store must hold the class lookup");
  const namespaces = data.ontologies;
  const instance = classData.instances.edges.at(0)?.node;
  if (!instance) throw new Error("the class must carry an instance");
  return (
    <>
      <ClassView
        data={classData}
        data-probe="class-view"
        id="class-view"
        namespaces={namespaces}
        term={COMPONENT_TERM}
      />
      <Lineage
        ancestors={classData.superclasses}
        className="probe"
        id="lineage"
        namespaces={namespaces}
        self={COMPONENT_TERM}
      />
      <PropertyTable
        className="probe"
        id="property-table"
        namespaces={namespaces}
        properties={classData.properties}
      />
      <ul>
        <InstanceItem
          data-probe="instance"
          id="instance-item"
          node={instance}
        />
      </ul>
    </>
  );
};

/** The inspector's property view over the `ds:hasSubcomponent` store. */
const PropertyViewProbe = () => {
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(PROPERTY_TERM),
  );
  const propertyData = useFragment<TermInspector_property$key>(
    termInspectorPropertyFragmentNode,
    data.ontologyProperty ?? null,
  );
  if (!propertyData) throw new Error("the store must hold the lookup");
  return (
    <PropertyView
      data={propertyData}
      data-probe="property-view"
      id="property-view"
      namespaces={data.ontologies}
      term={PROPERTY_TERM}
    />
  );
};

/** Mount `children` at `term` under the providers the inspector's instance
 * chips read their homes and arms from. */
const mountAtTerm = (
  term: string,
  records: Parameters<typeof createStripHarness>[1],
  children: ReactNode,
) =>
  createStripHarness(
    `/definitions/${encodeURIComponent(term)}`,
    records,
    createFetchSpy(),
    <HomesProvider homes={HOMES}>
      <ProjectionsProvider maps={defaultProjectionMaps}>
        {children}
      </ProjectionsProvider>
    </HomesProvider>,
  );

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

  it("reach the root of the well's node and legend, merging class and style", () => {
    const { container } = render(
      createStripHarness(
        "/definitions",
        undefined,
        createFetchSpy(),
        <>
          <TermNode
            className="probe"
            data-probe="node"
            id="term-node"
            node={{
              id: "ds:Component",
              data: {
                term: "ds:Component",
                label: "Component",
                isAbstract: true,
                prefix: "ds",
              },
              x: 60,
              y: 20,
              width: 100,
              height: 40,
              className: "is-faded",
            }}
            style={{ zIndex: 2 }}
          />
          <WellLegend className="probe" id="well-legend" />
        </>,
      ),
    );

    const node = container.querySelector("#term-node");
    expect(node).toHaveClass(
      "ds",
      "term-node",
      "abstract",
      "is-faded",
      "probe",
    );
    expect(node).toHaveAttribute("data-probe", "node");
    expect(node).toHaveAttribute("data-id", "ds:Component");
    // The given style joins the geometry; the geometry is the node's own.
    expect(node).toHaveStyle({ zIndex: "2", insetInlineStart: "10px" });
    expect(container.querySelector("#well-legend")).toHaveClass(
      "ds",
      "well-legend",
      "probe",
    );
    expect(screen.getByLabelText("Graph legend")).toHaveAttribute(
      "id",
      "well-legend",
    );
  });

  it("reach the root of the inspector's class parts", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      mountAtTerm(
        COMPONENT_TERM,
        definitionsExplorerRecordsComponent,
        <ClassPartsProbe />,
      ),
    );

    expect(container.querySelector("#class-view")).toHaveAttribute(
      "aria-labelledby",
      "term-inspector-title",
    );
    expect(container.querySelector("#class-view")).toHaveAttribute(
      "data-probe",
      "class-view",
    );
    expect(container.querySelector("#lineage")).toHaveClass(
      "ds",
      "lineage",
      "probe",
    );
    expect(container.querySelector("#property-table")).toHaveClass(
      "table",
      "probe",
    );
    expect(container.querySelector("#instance-item")).toHaveAttribute(
      "data-probe",
      "instance",
    );
  });

  it("reach the root of the inspector's property view", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      mountAtTerm(
        PROPERTY_TERM,
        definitionsExplorerRecordsProperty,
        <PropertyViewProbe />,
      ),
    );

    expect(container.querySelector("#property-view")).toHaveAttribute(
      "data-probe",
      "property-view",
    );
    expect(container.querySelector("#property-view")).toHaveAttribute(
      "aria-labelledby",
      "term-inspector-title",
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
