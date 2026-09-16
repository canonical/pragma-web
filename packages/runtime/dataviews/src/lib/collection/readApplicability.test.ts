/**
 * The one reading of a field's type scoping: every field over a collection
 * of one type, an unscoped or undescribed field over every type, and a
 * scoped field over the types it names alone.
 */
import { describe, expect, it } from "vitest";
import createCollection from "./createCollection.js";
import readApplicability from "./readApplicability.js";

type Instance = { readonly id: string; readonly type: string };

const instances = createCollection({
  identify: (instance: Instance) => instance.id,
  discriminator: "type",
  fields: [
    {
      field: "type",
      kind: "choices",
      options: ["container", "virtual-machine"],
    },
    {
      field: "secureboot",
      kind: "choices",
      options: ["true", "false"],
      appliesTo: ["virtual-machine"],
    },
  ],
});

describe("readApplicability", () => {
  it("applies an unscoped field, or one the schema does not describe, to every type", () => {
    expect(readApplicability(instances, "type", "container")).toBe("applies");
    expect(readApplicability(instances, "uptime", "container")).toBe("applies");
    expect(readApplicability(instances, "type", null)).toBe("applies");
  });

  it("applies a scoped field to the types it names alone", () => {
    expect(readApplicability(instances, "secureboot", "virtual-machine")).toBe(
      "applies",
    );
    expect(readApplicability(instances, "secureboot", "container")).toBe(
      "not-applicable",
    );
    // A record carrying no declared type is named by no scope.
    expect(readApplicability(instances, "secureboot", null)).toBe(
      "not-applicable",
    );
  });

  it("applies every field over a collection declaring no types", () => {
    const monomorphic = createCollection({
      identify: (instance: Instance) => instance.id,
      fields: [{ field: "secureboot", kind: "flag", appliesTo: ["container"] }],
    });
    expect(readApplicability(monomorphic, "secureboot", null)).toBe("applies");
  });
});
