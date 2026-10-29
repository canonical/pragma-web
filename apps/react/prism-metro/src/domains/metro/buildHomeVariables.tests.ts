// @vitest-environment node

import { describe, expect, it } from "vitest";
import { FLEET_CLASS_URI } from "#domains/fleet";
import { LINES_BINDING, STATIONS_BINDING } from "#domains/lenses";
import buildHomeVariables from "./buildHomeVariables.js";

describe("buildHomeVariables", () => {
  it("names the classes the stations, lines and fleet lenses list", () => {
    expect(buildHomeVariables()).toEqual({
      stationClass: STATIONS_BINDING.classUri,
      lineClass: LINES_BINDING.classUri,
      fleetClass: FLEET_CLASS_URI,
    });
  });
});
