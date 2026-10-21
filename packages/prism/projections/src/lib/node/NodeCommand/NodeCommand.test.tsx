import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import { EntityCommand } from "../../EntityCommand/index.js";

/** Render `node`'s command under the default maps, and return its root. */
const renderCommand = (node: NodePayload): Element => {
  const { container } = render(
    createNodePage(node, (key) => (
      <ul>
        <EntityCommand node={key} />
      </ul>
    )),
  );
  const root = container.querySelector(".ds.node-command");
  if (root === null) {
    throw new Error("no node command rendered");
  }
  return root;
};

describe("NodeCommand", () => {
  it("links its title to the node's home", () => {
    const title = renderCommand(ONTOLOGY_CLASS_NODE).querySelector(".title");
    expect(title?.tagName).toBe("A");
    expect(title?.getAttribute("href")).toBe(ONTOLOGY_CLASS_HREF);
    expect(title?.textContent).toBe("UI Block");
  });

  it("renders its title as inert text when the node has no home", () => {
    const title = renderCommand(STATION_NODE).querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.hasAttribute("href")).toBe(false);
    expect(title?.textContent).toBe("King's Cross");
  });

  it("renders the node's compact address as its location", () => {
    const location = renderCommand(STATION_NODE).querySelector(".location");
    expect(location?.tagName).toBe("SPAN");
    expect(location?.textContent).toBe("metro:station/kings-cross");
  });

  it("carries the node's class as data-type on its li root", () => {
    const root = renderCommand(STATION_NODE);
    expect(root.tagName).toBe("LI");
    expect(root.getAttribute("data-type")).toBe(
      "https://metro.example/Station",
    );
  });
});
