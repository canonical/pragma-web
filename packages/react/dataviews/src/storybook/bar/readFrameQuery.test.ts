import { afterEach, describe, expect, it } from "vitest";
import readFrameQuery from "./readFrameQuery.js";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("readFrameQuery", () => {
  it("reads the frame's query parameter", () => {
    window.history.replaceState(null, "", "/?query=status%3Dready");
    expect(readFrameQuery("q=web")).toBe("status=ready");
  });

  it("falls back without one", () => {
    expect(readFrameQuery("q=web")).toBe("q=web");
  });
});
