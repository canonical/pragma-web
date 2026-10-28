import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DefinitionsIcon from "./DefinitionsIcon.js";

describe("DefinitionsIcon SSR", () => {
  it("renders the glyph, hidden from assistive technology", () => {
    const html = renderToString(<DefinitionsIcon />);
    expect(html).toContain('class="ds definitions-icon"');
    expect(html).toContain('aria-hidden="true"');
  });
});
