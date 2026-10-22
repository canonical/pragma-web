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
import EntityTitle from "./EntityTitle.js";
import type { EntityTitleArmProps } from "./types.js";

/** A type's own title arm: prints what dispatch handed it. */
const ProbeTitle = ({
  node,
  href,
  ...props
}: EntityTitleArmProps): ReactElement => (
  <hgroup {...props} data-arm="probe">
    {node._meta.curie} {href ?? "no home"}
  </hgroup>
);

const probeMaps = {
  ...defaultProjectionMaps,
  title: {
    ...defaultProjectionMaps.title,
    OntologyClass: ProbeTitle,
    Station: ProbeTitle,
  },
};

/** Render `node`'s title, under `maps` when given. */
const renderTitle = (
  node: NodePayload,
  maps?: ProjectionMaps,
  props: Partial<Omit<EntityTitleArmProps, "node" | "href">> = {},
) =>
  render(
    createNodePage(node, (key) => <EntityTitle {...props} node={key} />, {
      maps,
    }),
  );

describe("EntityTitle", () => {
  it("renders a node of a type no map names through the Node arm", () => {
    const { container } = renderTitle(STATION_NODE);
    expect(container.querySelector(".ds.node-title")).not.toBeNull();
  });

  it("renders a node through its type's own arm when the map names one", () => {
    const { container } = renderTitle(STATION_NODE, probeMaps);
    expect(container.querySelector("[data-arm='probe']")).not.toBeNull();
    expect(container.querySelector(".ds.node-title")).toBeNull();
  });

  it("hands the arm the node's home", () => {
    renderTitle(ONTOLOGY_CLASS_NODE, probeMaps);
    expect(
      screen.getByText(`ds:UIBlock ${ONTOLOGY_CLASS_HREF}`),
    ).toBeInTheDocument();
  });

  it("hands the arm no home when the site declares none for the type", () => {
    renderTitle(STATION_NODE, probeMaps);
    expect(
      screen.getByText("metro:station/kings-cross no home"),
    ).toBeInTheDocument();
  });

  it("forwards native props to the arm's root and merges its className", () => {
    renderTitle(ONTOLOGY_CLASS_NODE, undefined, {
      className: "listing",
      id: "the-title",
    });
    const root = document.getElementById("the-title");
    expect(root?.tagName).toBe("HGROUP");
    expect(root?.className).toBe("ds node-title listing");
  });
});
