// @vitest-environment node

import { describe, expect, it } from "vitest";
import { FLEET_CLASS_URI } from "#domains/fleet";
import { LINES_BINDING, STATIONS_BINDING } from "#domains/lenses";
import { INTERCHANGE_CLASS_URI } from "#domains/network";
import buildHomeVariables from "./buildHomeVariables.js";

describe("buildHomeVariables", () => {
  it("names the classes the stations, lines and fleet lenses list, and the interchanges", () => {
    expect(buildHomeVariables()).toEqual({
      stationClass: STATIONS_BINDING.classUri,
      interchangeClass: INTERCHANGE_CLASS_URI,
      lineClass: LINES_BINDING.classUri,
      fleetClass: FLEET_CLASS_URI,
    });
  });
});
