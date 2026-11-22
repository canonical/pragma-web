// Scaffolded by @canonical/summon-component:react v0.46.0

import { readFileSync } from "node:fs";
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

  it("drops the user agent's highlight from a match", () => {
    const styles = readFileSync(
      new URL("./styles.css", import.meta.url),
      "utf8",
    );
    const start = styles.indexOf(".ds.search-passage .match {");
    expect(start).toBeGreaterThan(-1);
    const match = styles.slice(start, styles.indexOf("}", start));
    expect(match).toContain(
      "background-color: var(--search-passage-match-background);",
    );
    expect(styles).toContain("--search-passage-match-background: transparent;");
  });

  it("keeps the passage on one line, so its ellipsis can cut it", () => {
    const styles = readFileSync(
      new URL("./styles.css", import.meta.url),
      "utf8",
    );
    const start = styles.indexOf(".ds.search-passage {");
    expect(start).toBeGreaterThan(-1);
    const root = styles.slice(start, styles.indexOf("\n  }", start));
    expect(root).toContain("white-space: nowrap;");
    expect(root).toContain("text-overflow: ellipsis;");
  });
});
