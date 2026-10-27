// @vitest-environment node

import { describe, expect, it } from "vitest";
import { LINES_BINDING, STATIONS_BINDING } from "#domains/lenses";
import { INTERCHANGE_CLASS_URI } from "#domains/network";
import buildHomeVariables from "./buildHomeVariables.js";

describe("buildHomeVariables", () => {
  it("names the classes the stations and lines lenses are bound to, and the interchanges", () => {
    expect(buildHomeVariables()).toEqual({
      stationClass: STATIONS_BINDING.classUri,
      interchangeClass: INTERCHANGE_CLASS_URI,
      lineClass: LINES_BINDING.classUri,
    });
  });
});
