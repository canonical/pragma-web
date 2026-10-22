import { describe, expect, it } from "vitest";
import {
  METRO_NAMESPACES,
  NORTHGATE_CURIE,
  NORTHGATE_IRI,
  STATIONS_BINDING,
} from "../../testing/fixtures.js";
import buildEntityPageVariables from "./buildEntityPageVariables.js";

describe("buildEntityPageVariables", () => {
  it("expands a compact address through the namespaces, beside the class", () => {
    expect(
      buildEntityPageVariables(
        STATIONS_BINDING,
        NORTHGATE_CURIE,
        METRO_NAMESPACES,
      ),
    ).toEqual({ id: NORTHGATE_IRI, classUri: "metro:Station" });
  });

  it("passes an absolute IRI through", () => {
    expect(
      buildEntityPageVariables(STATIONS_BINDING, NORTHGATE_IRI, []),
    ).toEqual({ id: NORTHGATE_IRI, classUri: "metro:Station" });
  });
});
