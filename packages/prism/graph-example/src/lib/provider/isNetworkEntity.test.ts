import { describe, expect, it } from "vitest";
import { isNetworkEntity } from "./isNetworkEntity.js";
import type { ExampleEntity } from "./types.js";

const base = { uri: "urn:e", type: "urn:C" } as const;

describe("isNetworkEntity", () => {
  it.each(["Line", "Station", "Interchange", "Zone"] as const)(
    "accepts a %s",
    (typename) => {
      expect(isNetworkEntity({ ...base, typename })).toBe(true);
    },
  );

  const fleet: readonly ExampleEntity[] = [
    {
      ...base,
      typename: "CarType",
      code: "T",
      hasCab: false,
      length: 1,
      capacity: 1,
    },
    { ...base, typename: "Unit", cars: [] },
  ];

  it.each(fleet.map((entity) => [entity.typename, entity] as const))(
    "rejects a %s",
    (_typename, entity) => {
      expect(isNetworkEntity(entity)).toBe(false);
    },
  );
});
