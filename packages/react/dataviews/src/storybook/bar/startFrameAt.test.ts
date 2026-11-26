import { afterEach, describe, expect, it } from "vitest";
import startFrameAt from "./startFrameAt.js";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("startFrameAt", () => {
  it("keeps the frame's own parameters and starts on the story's query", () => {
    window.history.replaceState(
      null,
      "",
      "/iframe.html?id=bar--default&viewMode=story&status=broken",
    );
    startFrameAt("status=deployed&q=web");
    expect(window.location.search).toBe(
      "?id=bar--default&viewMode=story&status=deployed&q=web",
    );
  });
});
