import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import { EntityChip } from "../../EntityChip/index.js";

/** Render `node`'s chip under the default maps, and return its root. */
const renderChip = (node: NodePayload, children?: string): Element => {
  const { container } = render(
    createNodePage(node, (key) => (
      <EntityChip node={key}>{children}</EntityChip>
    )),
  );
  const root = container.querySelector(".ds.node-chip");
  if (root === null) {
    throw new Error("no node chip rendered");
  }
  return root;
};

describe("NodeChip", () => {
  it("links its title to the node's home", () => {
    const title = renderChip(ONTOLOGY_CLASS_NODE).querySelector(".title");
    expect(title?.tagName).toBe("A");
    expect(title?.getAttribute("href")).toBe(ONTOLOGY_CLASS_HREF);
    expect(title?.textContent).toBe("UI Block");
  });

  it("renders its title as inert text when the node has no home", () => {
    const title = renderChip(STATION_NODE).querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.hasAttribute("href")).toBe(false);
    expect(title?.textContent).toBe("King's Cross");
  });

  it("carries the node's class as data-type and its compact address as title", () => {
    const root = renderChip(STATION_NODE);
    expect(root.tagName).toBe("SPAN");
    expect(root.getAttribute("data-type")).toBe(
      "https://metro.example/Station",
    );
    expect(root.getAttribute("title")).toBe("metro:station/kings-cross");
  });

  it("labels the mention with the text it is given", () => {
    expect(renderChip(STATION_NODE, "the station").textContent).toBe(
      "the station",
    );
  });
});
