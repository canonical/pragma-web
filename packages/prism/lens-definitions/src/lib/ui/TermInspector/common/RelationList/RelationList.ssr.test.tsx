import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import RelationList from "./RelationList.js";

describe("RelationList SSR", () => {
  it("renders a row per relation, its arrow hidden from assistive technology", () => {
    const html = renderToString(
      createRouterHarness(
        <RelationList
          direction="outgoing"
          namespaces={[
            { prefix: "ds", namespace: "https://ds.canonical.com/" },
          ]}
          relations={[
            {
              predicate: {
                uri: "https://ds.canonical.com/tier",
                label: "tier",
              },
              other: { uri: "https://ds.canonical.com/Tier", label: "Tier" },
            },
          ]}
        />,
      ),
    );
    expect(html).toContain('class="ds relation-list"');
    expect(html).toContain('<span aria-hidden="true" class="arrow">');
  });
});
