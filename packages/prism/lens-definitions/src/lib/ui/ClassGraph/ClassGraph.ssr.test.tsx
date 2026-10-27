import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../testing/createRouterHarness.js";
import ClassGraph from "./ClassGraph.js";

const { layout, terms, uris } = createClassGraphSetup();

describe("ClassGraph SSR", () => {
  it("renders the whole graph at full zoom, its links resolved", () => {
    const html = renderToString(
      createRouterHarness(
        <svg aria-label="graph" role="img">
          <ClassGraph
            layout={layout}
            tabStop={uris.get("ds:Entity")}
            terms={terms}
          />
        </svg>,
      ),
    );
    expect(html).toContain('class="ds class-graph"');
    expect(html).toContain('href="/definitions/ds%3AEntity"');
    expect(html.match(/class="node"/g)).toHaveLength(layout.nodes.size);
  });
});
