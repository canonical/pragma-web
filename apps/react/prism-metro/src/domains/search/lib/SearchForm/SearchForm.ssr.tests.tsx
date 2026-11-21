// Scaffolded by @canonical/summon-component:react v0.46.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SearchForm from "./SearchForm.js";

describe("SearchForm SSR", () => {
  it("server-renders the form with its field carrying the text", () => {
    const html = renderToString(<SearchForm text="but" />);
    expect(html).toContain('class="ds search-form"');
    expect(html).toContain('method="get"');
    expect(html).toContain('name="q"');
    expect(html).toContain('value="but"');
  });
});
