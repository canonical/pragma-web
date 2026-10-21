import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import { EntityTitle } from "../../EntityTitle/index.js";

/** Render `node`'s title under the default maps, and return its root. */
const renderTitle = (node: NodePayload): Element => {
  const { container } = render(
    createNodePage(node, (key) => <EntityTitle node={key} />),
  );
  const root = container.querySelector(".ds.node-title");
  if (root === null) {
    throw new Error("no node title rendered");
  }
  return root;
};

describe("NodeTitle", () => {
  it("heads the page with the node's title", () => {
    const title = renderTitle(STATION_NODE).querySelector(".title");
    expect(title?.tagName).toBe("H1");
    expect(title?.textContent).toBe("King's Cross");
  });

  it("never links, even when the node has a home", () => {
    const root = renderTitle(ONTOLOGY_CLASS_NODE);
    expect(root.querySelector("a")).toBeNull();
    expect(root.querySelector(".title")?.textContent).toBe("UI Block");
  });

  it("renders the node's compact address as its location", () => {
    const location = renderTitle(STATION_NODE).querySelector(".location");
    expect(location?.tagName).toBe("P");
    expect(location?.querySelector("code")?.textContent).toBe(
      "metro:station/kings-cross",
    );
  });

  it("carries the node's class as data-type on its hgroup root", () => {
    const root = renderTitle(STATION_NODE);
    expect(root.tagName).toBe("HGROUP");
    expect(root.getAttribute("data-type")).toBe(
      "https://metro.example/Station",
    );
  });
});
