import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import { EntityRow } from "../../EntityRow/index.js";

/** Render `node`'s row under the default maps, and return its root. */
const renderRow = (node: NodePayload): Element => {
  const { container } = render(
    createNodePage(node, (key) => (
      <ul>
        <EntityRow node={key} />
      </ul>
    )),
  );
  const root = container.querySelector(".ds.node-row");
  if (root === null) {
    throw new Error("no node row rendered");
  }
  return root;
};

describe("NodeRow", () => {
  it("links its title to the node's home", () => {
    const title = renderRow(ONTOLOGY_CLASS_NODE).querySelector(".title");
    expect(title?.tagName).toBe("A");
    expect(title?.getAttribute("href")).toBe(ONTOLOGY_CLASS_HREF);
    expect(title?.textContent).toBe("UI Block");
  });

  it("renders its title as inert text when the node has no home", () => {
    const title = renderRow(STATION_NODE).querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.hasAttribute("href")).toBe(false);
    expect(title?.textContent).toBe("King's Cross");
  });

  it("renders the node's compact address as its location", () => {
    const location = renderRow(STATION_NODE).querySelector(".location");
    expect(location?.tagName).toBe("CODE");
    expect(location?.textContent).toBe("metro:station/kings-cross");
  });

  it("carries the node's class as data-type on its li root", () => {
    const root = renderRow(STATION_NODE);
    expect(root.tagName).toBe("LI");
    expect(root.getAttribute("data-type")).toBe(
      "https://metro.example/Station",
    );
  });
});
