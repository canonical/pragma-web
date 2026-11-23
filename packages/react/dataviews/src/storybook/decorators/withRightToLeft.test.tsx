import { describe, expect, it } from "vitest";
import renderDecorated from "../../../testing/renderDecorated.js";
import withRightToLeft from "./withRightToLeft.js";

describe("withRightToLeft", () => {
  it("renders the story in a right-to-left context", () => {
    expect(renderDecorated(withRightToLeft)).toHaveAttribute("dir", "rtl");
  });
});
