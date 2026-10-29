import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import ExplorerControls from "./ExplorerControls.js";

describe("ExplorerControls SSR", () => {
  it("renders every chip with its pressed state", () => {
    const html = renderToString(
      <ExplorerControls
        filter={createAllNamespacesFilter(["ds"])}
        namespaceLabels={[
          { prefix: "ds", label: "ds" },
          { prefix: "cs", label: "cs" },
        ]}
        onFilterChange={() => {}}
      />,
    );
    expect(html).toContain('class="ds explorer-controls"');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(3);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
  });
});
