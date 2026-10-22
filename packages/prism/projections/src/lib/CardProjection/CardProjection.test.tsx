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
import CardProjection from "./CardProjection.js";
import type { CardArmProps } from "./types.js";

/** A type's own card arm: prints what dispatch handed it. */
const ProbeCard = ({ node, href, ...props }: CardArmProps): ReactElement => (
  <article {...props} data-arm="probe">
    {node._meta.curie} {href ?? "no home"}
  </article>
);

const probeMaps = {
  ...defaultProjectionMaps,
  card: {
    ...defaultProjectionMaps.card,
    OntologyClass: ProbeCard,
    Station: ProbeCard,
  },
};

/** Render `node`'s card, under `maps` when given. */
const renderCard = (
  node: NodePayload,
  maps?: ProjectionMaps,
  props: Partial<Omit<CardArmProps, "node" | "href">> = {},
) =>
  render(
    createNodePage(node, (key) => <CardProjection {...props} node={key} />, {
      maps,
    }),
  );

describe("CardProjection", () => {
  it("renders a node of a type no map names through the Node arm", () => {
    const { container } = renderCard(STATION_NODE);
    expect(container.querySelector(".ds.node-card")).not.toBeNull();
  });

  it("renders a node through its type's own arm when the map names one", () => {
    const { container } = renderCard(STATION_NODE, probeMaps);
    expect(container.querySelector("[data-arm='probe']")).not.toBeNull();
    expect(container.querySelector(".ds.node-card")).toBeNull();
  });

  it("hands the arm the node's home", () => {
    renderCard(ONTOLOGY_CLASS_NODE, probeMaps);
    expect(
      screen.getByText(`ds:UIBlock ${ONTOLOGY_CLASS_HREF}`),
    ).toBeInTheDocument();
  });

  it("hands the arm no home when the site declares none for the type", () => {
    renderCard(STATION_NODE, probeMaps);
    expect(
      screen.getByText("metro:station/kings-cross no home"),
    ).toBeInTheDocument();
  });

  it("forwards native props to the arm's root and merges its className", () => {
    renderCard(ONTOLOGY_CLASS_NODE, undefined, {
      className: "listing",
      id: "the-card",
    });
    const root = document.getElementById("the-card");
    expect(root?.tagName).toBe("ARTICLE");
    expect(root?.className).toBe("ds node-card listing");
  });
});
