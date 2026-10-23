import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../testing/fixtures.js";
import { defaultProjectionMaps } from "../node/index.js";
import ChipProjection from "./ChipProjection.js";
import type { ChipArmProps } from "./types.js";

/** A type's own chip arm: prints what dispatch handed it. */
const StationChip = ({
  node,
  href,
  children,
  ...props
}: ChipArmProps): ReactElement => (
  <span {...props} data-arm="station">
    {node._meta.curie} {href ?? "no home"} {children}
  </span>
);

const stationMaps = {
  ...defaultProjectionMaps,
  chip: { ...defaultProjectionMaps.chip, Station: StationChip },
};

describe("ChipProjection", () => {
  it("renders a node of a type no map names through the Node arm", () => {
    const { container } = render(
      createNodePage(STATION_NODE, (node) => <ChipProjection node={node} />),
    );
    expect(container.querySelector(".ds.node-chip")).not.toBeNull();
    expect(screen.getByText("King's Cross")).toBeInTheDocument();
  });

  it("renders a node through its type's own arm when the map names one", () => {
    const { container } = render(
      createNodePage(STATION_NODE, (node) => <ChipProjection node={node} />, {
        maps: stationMaps,
      }),
    );
    expect(container.querySelector("[data-arm='station']")).not.toBeNull();
    expect(container.querySelector(".ds.node-chip")).toBeNull();
  });

  it("hands the arm the node's home", () => {
    render(
      createNodePage(ONTOLOGY_CLASS_NODE, (node) => (
        <ChipProjection node={node} />
      )),
    );
    expect(
      screen.getByRole("link", { name: "UI Block" }).getAttribute("href"),
    ).toBe(ONTOLOGY_CLASS_HREF);
  });

  it("hands the arm no home when the site declares none for the type", () => {
    render(
      createNodePage(STATION_NODE, (node) => <ChipProjection node={node} />, {
        maps: stationMaps,
      }),
    );
    expect(
      screen.getByText("metro:station/kings-cross no home"),
    ).toBeInTheDocument();
  });

  it("forwards native props to the arm's root and merges its className", () => {
    const { container } = render(
      createNodePage(ONTOLOGY_CLASS_NODE, (node) => (
        <ChipProjection className="mention" data-testid="chip" node={node} />
      )),
    );
    const root = screen.getByTestId("chip");
    expect(root.className).toBe("ds node-chip mention");
    expect(container.firstElementChild).toBe(root);
  });

  it("renders its children in place of the node's title", () => {
    render(
      createNodePage(ONTOLOGY_CLASS_NODE, (node) => (
        <ChipProjection node={node}>the block</ChipProjection>
      )),
    );
    expect(
      screen.getByRole("link", { name: "the block" }).getAttribute("href"),
    ).toBe(ONTOLOGY_CLASS_HREF);
    expect(screen.queryByText("UI Block")).toBeNull();
  });
});
