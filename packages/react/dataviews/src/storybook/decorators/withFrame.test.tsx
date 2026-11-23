import { describe, expect, it } from "vitest";
import renderDecorated from "../../../testing/renderDecorated.js";
import withFrame from "./withFrame.js";

describe("withFrame", () => {
  it("renders the story inside a frame of the given width", () => {
    // The frame is read as declared: a computed style resolves rem.
    expect(renderDecorated(withFrame("40rem"))?.style.maxWidth).toBe("40rem");
  });
});
