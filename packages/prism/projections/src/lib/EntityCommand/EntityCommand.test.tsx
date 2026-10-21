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
import {
  defaultProjectionMaps,
  type ProjectionMaps,
} from "../projections/index.js";
import EntityCommand from "./EntityCommand.js";
import type { EntityCommandArmProps } from "./types.js";

/** A type's own command arm: prints what dispatch handed it. */
const ProbeCommand = ({
  node,
  href,
  ...props
}: EntityCommandArmProps): ReactElement => (
  <li {...props} data-arm="probe">
    {node._meta.curie} {href ?? "no home"}
  </li>
);

const probeMaps = {
  ...defaultProjectionMaps,
  command: {
    ...defaultProjectionMaps.command,
    OntologyClass: ProbeCommand,
    Station: ProbeCommand,
  },
};

/** Render `node`'s command, under `maps` when given. */
const renderCommand = (
  node: NodePayload,
  maps?: ProjectionMaps,
  props: Partial<Omit<EntityCommandArmProps, "node" | "href">> = {},
) =>
  render(
    createNodePage(
      node,
      (key) => (
        <ul>
          <EntityCommand {...props} node={key} />
        </ul>
      ),
      { maps },
    ),
  );

describe("EntityCommand", () => {
  it("renders a node of a type no map names through the Node arm", () => {
    const { container } = renderCommand(STATION_NODE);
    expect(container.querySelector(".ds.node-command")).not.toBeNull();
  });

  it("renders a node through its type's own arm when the map names one", () => {
    const { container } = renderCommand(STATION_NODE, probeMaps);
    expect(container.querySelector("[data-arm='probe']")).not.toBeNull();
    expect(container.querySelector(".ds.node-command")).toBeNull();
  });

  it("hands the arm the node's home", () => {
    renderCommand(ONTOLOGY_CLASS_NODE, probeMaps);
    expect(
      screen.getByText(`ds:UIBlock ${ONTOLOGY_CLASS_HREF}`),
    ).toBeInTheDocument();
  });

  it("hands the arm no home when the site declares none for the type", () => {
    renderCommand(STATION_NODE, probeMaps);
    expect(
      screen.getByText("metro:station/kings-cross no home"),
    ).toBeInTheDocument();
  });

  it("forwards native props to the arm's root and merges its className", () => {
    renderCommand(ONTOLOGY_CLASS_NODE, undefined, {
      className: "listing",
      id: "the-command",
    });
    const root = document.getElementById("the-command");
    expect(root?.tagName).toBe("LI");
    expect(root?.className).toBe("ds node-command listing");
  });
});
