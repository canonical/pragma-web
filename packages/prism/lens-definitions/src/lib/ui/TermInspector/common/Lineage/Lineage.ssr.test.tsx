import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import Lineage from "./Lineage.js";

describe("Lineage SSR", () => {
  it("renders the class as the chain's plain leaf", () => {
    const html = renderToString(
      createRouterHarness(
        <Lineage ancestors={[]} namespaces={[]} self="Entity" />,
      ),
    );
    expect(html).toBe(
      '<p class="ds lineage"><span class="self">Entity</span></p>',
    );
  });
});
