import { describe, expect, it, vi } from "vitest";
import silenceRenderErrors from "./silenceRenderErrors.js";

describe("silenceRenderErrors", () => {
  it("keeps the console's errors back while the test runs", () => {
    silenceRenderErrors();
    expect(vi.isMockFunction(console.error)).toBe(true);
    console.error("a render's report");
    expect(console.error).toHaveBeenCalledWith("a render's report");
  });

  it("gives the console its errors back once the test finishes", () => {
    expect(vi.isMockFunction(console.error)).toBe(false);
  });
});
