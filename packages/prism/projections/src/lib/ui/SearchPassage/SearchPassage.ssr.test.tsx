// Scaffolded by @canonical/summon-component:react v0.46.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SearchPassage from "./SearchPassage.js";

describe("SearchPassage SSR", () => {
  it("renders the marked passage on the server", () => {
    const html = renderToString(
      <SearchPassage passage="a but" ranges={[{ start: 2, length: 3 }]} />,
    );
    expect(html).toContain("ds search-passage");
    expect(html).toContain('<mark class="match">but</mark>');
  });
});
