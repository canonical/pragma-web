import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import PhoneGraph from "./PhoneGraph.js";

const { layout, terms } = createClassGraphSetup();

describe("PhoneGraph SSR", () => {
  it("renders every row, the lattice under them", () => {
    const html = renderToString(
      createRouterHarness(
        <PhoneGraph
          dimmed={new Set()}
          hidden={new Set()}
          layout={layout}
          terms={terms}
        />,
      ),
    );
    expect(html).toContain('class="ds phone-graph"');
    expect(html).toContain('class="lattice"');
    expect(html.match(/class="row"/g)).toHaveLength(layout.nodes.size);
  });
});
