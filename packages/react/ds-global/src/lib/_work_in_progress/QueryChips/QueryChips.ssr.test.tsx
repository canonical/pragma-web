import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Component from "./QueryChips.js";

describe("QueryChips SSR", () => {
  it("sends a named list with one item per chip", () => {
    const html = renderToString(
      <Component label="Filters">
        <span>status</span>
        <span>cpu</span>
      </Component>,
    );
    expect(html).toBe(
      '<ul role="list" aria-label="Filters" class="ds query-chips"><li><span>status</span></li><li><span>cpu</span></li></ul>',
    );
  });
});
