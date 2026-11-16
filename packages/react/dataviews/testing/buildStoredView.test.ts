import { describe, expect, it } from "vitest";
import buildStoredView from "./buildStoredView.js";

describe("buildStoredView", () => {
  it("is one stored view, with the given fields changed", () => {
    expect(buildStoredView({ pinned: true })).toMatchObject({
      id: "v1",
      pinned: true,
    });
  });
});
