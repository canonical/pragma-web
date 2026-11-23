import { describe, expect, it } from "vitest";
import renderDecorated from "../../../testing/renderDecorated.js";
import withServerMarkup from "./withServerMarkup.js";

describe("withServerMarkup", () => {
  it("renders the markup a server sends for the story", () => {
    expect(renderDecorated(withServerMarkup)?.innerHTML).toBe("<p>Story</p>");
  });
});
