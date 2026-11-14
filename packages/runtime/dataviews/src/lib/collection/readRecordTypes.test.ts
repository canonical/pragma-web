import { describe, expect, it } from "vitest";
import { createSchema } from "../schema/index.js";
import readRecordTypes from "./readRecordTypes.js";

describe("readRecordTypes", () => {
  it("reads the discriminator's options as the record types, frozen", () => {
    const schema = createSchema([
      { field: "type", kind: "choices", options: ["container", "vm"] },
      { field: "processes", kind: "number", appliesTo: ["container"] },
    ]);
    const types = readRecordTypes(schema, "type");
    expect(types).toEqual({ field: "type", names: ["container", "vm"] });
    expect(Object.isFrozen(types)).toBe(true);
    expect(Object.isFrozen(types.names)).toBe(true);
  });

  it("refuses a discriminator the schema does not define", () => {
    const schema = createSchema([{ field: "name", kind: "text" }]);
    expect(() => readRecordTypes(schema, "type")).toThrow(
      'unknown discriminator field "type"',
    );
  });

  it("refuses a discriminator that is not a choices field", () => {
    const schema = createSchema([{ field: "type", kind: "text" }]);
    expect(() => readRecordTypes(schema, "type")).toThrow(
      'discriminator field "type" must be a choices field, not a text one',
    );
  });

  it("refuses a discriminator whose options are the server's", () => {
    const schema = createSchema([{ field: "type", kind: "choices" }]);
    expect(() => readRecordTypes(schema, "type")).toThrow(
      'discriminator field "type" must list its options',
    );
  });

  it("refuses a discriminator with an option that is not a string", () => {
    const schema = createSchema([
      { field: "type", kind: "choices", options: ["container", 2] },
    ]);
    expect(() => readRecordTypes(schema, "type")).toThrow(
      'discriminator field "type" requires string options',
    );
  });

  it("refuses a field scoped to a type the discriminator does not name", () => {
    const schema = createSchema([
      { field: "type", kind: "choices", options: ["container"] },
      { field: "cores", kind: "number", appliesTo: ["vm"] },
    ]);
    expect(() => readRecordTypes(schema, "type")).toThrow(
      'field "cores" is scoped to "vm", which is not a type of "type"',
    );
  });
});
