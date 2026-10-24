import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import TermLink from "./TermLink.js";

describe("TermLink SSR", () => {
  it("renders the link with its resolved address", () => {
    const html = renderToString(
      createRouterHarness(
        <TermLink
          label="Tag"
          namespaces={[
            { prefix: "ds", namespace: "https://ds.canonical.com/" },
          ]}
          uri="https://ds.canonical.com/Tag"
        />,
      ),
    );
    expect(html).toContain('class="ds term-link"');
    expect(html).toContain('href="/definitions/ds%3ATag"');
  });
});
