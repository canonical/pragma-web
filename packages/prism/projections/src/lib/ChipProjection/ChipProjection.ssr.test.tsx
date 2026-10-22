import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../testing/fixtures.js";
import ChipProjection from "./ChipProjection.js";

describe("ChipProjection on the server", () => {
  it("renders a real link to a homed node, so it navigates without scripts", () => {
    const html = renderToString(
      createNodePage(ONTOLOGY_CLASS_NODE, (node) => (
        <ChipProjection node={node} />
      )),
    );
    expect(html).toContain(
      `<a class="title" href="${ONTOLOGY_CLASS_HREF}">UI Block</a>`,
    );
  });

  it("renders inert text for a node without a home", () => {
    const html = renderToString(
      createNodePage(STATION_NODE, (node) => <ChipProjection node={node} />),
    );
    expect(html).toContain(`<span class="title">King&#x27;s Cross</span>`);
    expect(html).not.toContain("<a");
  });
});
