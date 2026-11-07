import { describe, expect, it } from "vitest";
import { ADDON_ID, KEY, PANEL_ID, PARAM_KEY, TOOL_ID } from "./constants.js";

describe("constants", () => {
  it("reads a story's handlers from parameters.msw", () => {
    expect(PARAM_KEY).toBe("msw");
  });

  it("derives the toolbar, panel and global keys from the addon id", () => {
    expect(ADDON_ID).toBe("ds-msw-addon");
    expect(TOOL_ID).toBe("ds-msw-addon/tool");
    expect(PANEL_ID).toBe("ds-msw-addon/panel");
    expect(KEY).toBe("ds-msw-addon");
  });
});
