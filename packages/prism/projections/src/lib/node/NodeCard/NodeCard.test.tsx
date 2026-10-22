import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import { EntityCard } from "../../EntityCard/index.js";

/** Render `node`'s card under the default maps, and return its root. */
const renderCard = (node: NodePayload): Element => {
  const { container } = render(
    createNodePage(node, (key) => <EntityCard node={key} />),
  );
  const root = container.querySelector(".ds.node-card");
  if (root === null) {
    throw new Error("no node card rendered");
  }
  return root;
};

describe("NodeCard", () => {
  it("links its title to the node's home", () => {
    const title = renderCard(ONTOLOGY_CLASS_NODE).querySelector(".title");
    expect(title?.tagName).toBe("H3");
    const link = title?.querySelector("a");
    expect(link?.getAttribute("href")).toBe(ONTOLOGY_CLASS_HREF);
    expect(link?.textContent).toBe("UI Block");
  });

  it("renders its title as inert text when the node has no home", () => {
    const title = renderCard(STATION_NODE).querySelector(".title");
    expect(title?.tagName).toBe("H3");
    expect(title?.querySelector("a")).toBeNull();
    expect(title?.textContent).toBe("King's Cross");
  });

  it("renders the node's compact address as its location", () => {
    const location = renderCard(STATION_NODE).querySelector(".location");
    expect(location?.tagName).toBe("P");
    expect(location?.querySelector("code")?.textContent).toBe(
      "metro:station/kings-cross",
    );
  });

  it("carries the node's class as data-type on its article root", () => {
    const root = renderCard(STATION_NODE);
    expect(root.tagName).toBe("ARTICLE");
    expect(root.getAttribute("data-type")).toBe(
      "https://metro.example/Station",
    );
  });
});
