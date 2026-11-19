import { describe, expect, it } from "vitest";
import renderDecorated from "../../../testing/renderDecorated.js";
import withAppScope from "./withAppScope.js";

describe("withAppScope", () => {
  it("renders the story inside the app scope", () => {
    expect(renderDecorated(withAppScope)).toHaveClass("app");
  });
});
