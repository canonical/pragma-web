import { describe, expect, it } from "vitest";
import compileRecordTypeReader from "./compileRecordTypeReader.js";
import createCollection from "./createCollection.js";

type Instance = { readonly id: string; readonly type?: unknown };

describe("compileRecordTypeReader", () => {
  it("names a row's declared type, and null for any other value", () => {
    const read = compileRecordTypeReader(
      createCollection({
        identify: (instance: Instance) => instance.id,
        discriminator: "type",
        fields: [
          { field: "type", kind: "choices", options: ["container", "vm"] },
        ],
      }),
    );
    expect(read({ id: "c", type: "container" })).toBe("container");
    expect(read({ id: "x", type: "sandbox" })).toBeNull();
    expect(read({ id: "x", type: 3 })).toBeNull();
    expect(read({ id: "x" })).toBeNull();
  });

  it("names no type on a collection declaring none", () => {
    const read = compileRecordTypeReader(
      createCollection({
        identify: (instance: Instance) => instance.id,
        fields: [{ field: "type", kind: "text" }],
      }),
    );
    expect(read({ id: "c", type: "container" })).toBeNull();
  });
});
