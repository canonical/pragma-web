import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Tag from "./Tag.js";

describe("Tag SSR", () => {
  it("renders without errors on server", () => {
    const html = renderToString(<Tag>Server Tag</Tag>);
    expect(html).toContain("Server Tag");
    expect(html).toContain('class="ds tag"');
  });

  it("renders with criticality modifier on server", () => {
    const html = renderToString(<Tag criticality="error">Error</Tag>);
    expect(html).toContain("error");
  });
});
