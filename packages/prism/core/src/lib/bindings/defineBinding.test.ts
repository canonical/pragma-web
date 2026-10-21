import { describe, expect, it } from "vitest";
import { defineBinding } from "./defineBinding.js";
import type { EntityBinding } from "./types.js";

const station = {
  id: "station",
  classUri: "metro:Station",
  typename: "Station",
} as const;

describe("defineBinding", () => {
  it("returns the binding by identity", () => {
    expect(defineBinding(station)).toBe(station);
  });

  it("keeps the id a literal type", () => {
    const binding = defineBinding(station);
    const entityRoute: `${typeof binding.id}Entity` = "stationEntity";
    expect(entityRoute).toBe(`${binding.id}Entity`);
  });

  it("accepts a lower-camel-case id with digits", () => {
    expect(() =>
      defineBinding({ ...station, id: "codeStandard2" }),
    ).not.toThrow();
  });

  it("rejects an empty or missing field, naming it", () => {
    expect(() => defineBinding({ ...station, id: "" })).toThrow(
      "defineBinding: id must be a non-empty string",
    );
    expect(() => defineBinding({ ...station, classUri: "" })).toThrow(
      "defineBinding: classUri must be a non-empty string",
    );
    expect(() =>
      defineBinding({
        ...station,
        typename: undefined,
      } as unknown as EntityBinding),
    ).toThrow("defineBinding: typename must be a non-empty string");
  });

  it("rejects an id that is not lower camel case", () => {
    for (const id of ["Station", "metro-station", "2station", "station_a"]) {
      expect(() => defineBinding({ ...station, id })).toThrow(
        `defineBinding: id "${id}" is not lower camel case`,
      );
    }
  });
});
