import { describe, expect, it } from "vitest";
import * as publicApi from "./index.js";

describe("the package barrel", () => {
  it("exports the palette alone", () => {
    expect(Object.keys(publicApi)).toEqual(["CommandPalette"]);
  });
});
