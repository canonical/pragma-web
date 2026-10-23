import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FleetIcon from "./FleetIcon.js";

describe("FleetIcon SSR", () => {
  it("renders the glyph on the server", () => {
    const html = renderToString(<FleetIcon />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="ds fleet-icon"');
  });
});
