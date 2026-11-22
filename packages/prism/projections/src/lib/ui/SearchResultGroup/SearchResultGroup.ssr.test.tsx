// Scaffolded by @canonical/summon-component:react v0.46.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SearchResultGroup from "./SearchResultGroup.js";

describe("SearchResultGroup SSR", () => {
  it("renders the heading and rows on the server", () => {
    const html = renderToString(
      <SearchResultGroup count={1} title="Standard">
        <li>The ds selector namespace</li>
      </SearchResultGroup>,
    );
    expect(html).toContain("ds search-result-group");
    expect(html).toContain("· 1");
    expect(html).toContain("<li>The ds selector namespace</li>");
  });

  it("says a group that began on an earlier page continues", () => {
    const html = renderToString(
      <SearchResultGroup continued count={29} title="Code Standard">
        <li>A standard</li>
      </SearchResultGroup>,
    );
    expect(html).toContain("· 29, continued");
  });
});
