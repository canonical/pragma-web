import { describe, expect, it } from "vitest";
import {
  RACK_COLLECTION,
  RACKED_MACHINE_COLLECTION,
} from "../../../testing/index.js";
import assertColumnsOver from "./assertColumnsOver.js";
import readColumnRegistry from "./readColumnRegistry.js";

describe("assertColumnsOver", () => {
  it("accepts columns declared over the renderer's own collection", () => {
    const columns = [{ id: "zone", header: "Zone" }];
    readColumnRegistry().set(columns, RACK_COLLECTION);
    expect(() =>
      assertColumnsOver(columns, RACK_COLLECTION, "DataTable"),
    ).not.toThrow();
  });

  it("throws for columns declared over another collection, naming it", () => {
    const columns = [{ id: "name", header: "Name" }];
    readColumnRegistry().set(columns, RACKED_MACHINE_COLLECTION);
    expect(() =>
      assertColumnsOver(columns, RACK_COLLECTION, "DataCards"),
    ).toThrow(
      'DataCards was given columns declared over another collection, of fields "name"',
    );
  });

  it("does not check columns written by hand", () => {
    expect(() =>
      assertColumnsOver(
        [{ id: "x", header: "X" }],
        RACK_COLLECTION,
        "DataTable",
      ),
    ).not.toThrow();
  });
});
