import { describe, expect, it } from "vitest";
import {
  MACHINE_CAPABILITIES,
  MACHINE_DECLARATION,
  machines,
} from "./machines.js";

describe("machines", () => {
  it("is a collection of name, status and cores", () => {
    expect(machines.schema.fieldNames).toEqual(["name", "status", "cores"]);
  });
});

describe("MACHINE_DECLARATION and MACHINE_CAPABILITIES", () => {
  it("filter, search and order by name alone", () => {
    expect(MACHINE_DECLARATION.search).toEqual(["name"]);
    expect(MACHINE_CAPABILITIES.sort.fields).toEqual(["name"]);
    expect(MACHINE_CAPABILITIES.sort.terms).toBe(1);
  });
});
