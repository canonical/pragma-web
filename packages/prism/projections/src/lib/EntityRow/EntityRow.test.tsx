import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../testing/fixtures.js";
import type { NodePayload } from "../../../testing/types.js";
import { defaultProjectionMaps } from "../node/index.js";
import type { ProjectionMaps } from "../projections/index.js";
import EntityRow from "./EntityRow.js";
import type { EntityRowArmProps } from "./types.js";

/** A type's own row arm: prints what dispatch handed it. */
const ProbeRow = ({
  node,
  href,
  ...props
}: EntityRowArmProps): ReactElement => (
  <li {...props} data-arm="probe">
    {node._meta.curie} {href ?? "no home"}
  </li>
);

const probeMaps = {
  ...defaultProjectionMaps,
  row: {
    ...defaultProjectionMaps.row,
    OntologyClass: ProbeRow,
    Station: ProbeRow,
  },
};

/** Render `node`'s row, under `maps` when given. */
const renderRow = (
  node: NodePayload,
  maps?: ProjectionMaps,
  props: Partial<Omit<EntityRowArmProps, "node" | "href">> = {},
) =>
  render(
    createNodePage(
      node,
      (key) => (
        <ul>
          <EntityRow {...props} node={key} />
        </ul>
      ),
      { maps },
    ),
  );

describe("EntityRow", () => {
  it("renders a node of a type no map names through the Node arm", () => {
    const { container } = renderRow(STATION_NODE);
    expect(container.querySelector(".ds.node-row")).not.toBeNull();
  });

  it("renders a node through its type's own arm when the map names one", () => {
    const { container } = renderRow(STATION_NODE, probeMaps);
    expect(container.querySelector("[data-arm='probe']")).not.toBeNull();
    expect(container.querySelector(".ds.node-row")).toBeNull();
  });

  it("hands the arm the node's home", () => {
    renderRow(ONTOLOGY_CLASS_NODE, probeMaps);
    expect(
      screen.getByText(`ds:UIBlock ${ONTOLOGY_CLASS_HREF}`),
    ).toBeInTheDocument();
  });

  it("hands the arm no home when the site declares none for the type", () => {
    renderRow(STATION_NODE, probeMaps);
    expect(
      screen.getByText("metro:station/kings-cross no home"),
    ).toBeInTheDocument();
  });

  it("forwards native props to the arm's root and merges its className", () => {
    renderRow(ONTOLOGY_CLASS_NODE, undefined, {
      className: "listing",
      id: "the-row",
    });
    const root = document.getElementById("the-row");
    expect(root?.tagName).toBe("LI");
    expect(root?.className).toBe("ds node-row listing");
  });
});
