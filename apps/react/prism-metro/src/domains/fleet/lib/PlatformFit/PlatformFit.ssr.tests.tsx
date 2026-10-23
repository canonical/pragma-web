import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NORTH_LINE_PLATFORMS } from "../../../../../testing/fixtures.js";
import measurePlatformFit from "../measurePlatformFit.js";
import PlatformFit from "./PlatformFit.js";

describe("PlatformFit SSR", () => {
  it("renders each line's fit on the server", () => {
    const html = renderToString(
      <PlatformFit fits={measurePlatformFit(120000, [NORTH_LINE_PLATFORMS])} />,
    );
    expect(html).toContain('class="ds platform-fit"');
    expect(html).toContain("Marsh End");
  });
});
