import { describe, expect, it } from "vitest";
import renderDecorated from "../../../testing/renderDecorated.js";
import withScrollingFrame from "./withScrollingFrame.js";

describe("withScrollingFrame", () => {
  it("renders the story inside a frame of the given height that scrolls", () => {
    const frame = renderDecorated(withScrollingFrame("20rem"));
    expect(frame?.style.maxHeight).toBe("20rem");
    expect(frame?.style.overflow).toBe("auto");
  });
});
