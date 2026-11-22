// Scaffolded by @canonical/summon-component:react v0.46.0

import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SearchForm from "./SearchForm.js";

describe("SearchForm SSR", () => {
  it("server-renders the form with its field carrying the text", () => {
    const html = renderToString(
      <SearchForm placeholder="Search the graph" text="but" />,
    );
    expect(html).toContain('class="ds search-form"');
    expect(html).toContain('method="get"');
    expect(html).toContain('name="q"');
    expect(html).toContain('value="but"');
  });

  it("frames the field and the button in the strip's own styles", () => {
    const html = renderToString(
      <SearchForm placeholder="Search the graph" text="but" />,
    );
    expect(html).toContain('class="submit"');
    expect(html).not.toContain("ds button");
    const styles = readFileSync(
      `${process.cwd()}/src/lib/ui/SearchForm/styles.css`,
      "utf8",
    );
    const start = styles.lastIndexOf(".ds.search-form .submit {");
    expect(start).toBeGreaterThan(-1);
    expect(styles.slice(start, styles.indexOf("}", start))).toContain(
      "border-color: var(--search-form-submit-border-color);",
    );
    expect(styles).toContain("color: var(--search-form-color);");
  });
});
