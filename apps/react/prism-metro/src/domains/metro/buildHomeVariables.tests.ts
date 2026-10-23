// @vitest-environment node

import { describe, expect, it } from "vitest";
import { LINES_BINDING, STATIONS_BINDING } from "#domains/lenses";
import buildHomeVariables from "./buildHomeVariables.js";

describe("buildHomeVariables", () => {
  it("names the classes the stations and lines lenses are bound to", () => {
    expect(buildHomeVariables()).toEqual({
      stationClass: STATIONS_BINDING.classUri,
      lineClass: LINES_BINDING.classUri,
    });
  });
});
