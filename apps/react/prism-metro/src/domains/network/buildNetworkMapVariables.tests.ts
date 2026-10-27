// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkMapVariables from "./buildNetworkMapVariables.js";
import { LINE_CLASS_URI, LINE_PAGE_SIZE } from "./constants.js";

describe("buildNetworkMapVariables", () => {
  it("reads every line of the line class in one page", () => {
    expect(buildNetworkMapVariables()).toEqual({
      classUri: LINE_CLASS_URI,
      first: LINE_PAGE_SIZE,
    });
  });
});
