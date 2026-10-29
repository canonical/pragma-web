import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExplorerStatus from "./ExplorerStatus.js";

describe("ExplorerStatus SSR", () => {
  it("renders the share on the bar's channel and in words", () => {
    const html = renderToString(
      <ExplorerStatus abstract={4} total={20} visible={10} />,
    );
    expect(html).toContain('class="ds explorer-status"');
    expect(html).toContain("--explorer-status-share:50%");
    expect(html).toContain("10 of 20 classes");
  });
});
