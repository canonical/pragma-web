import { describe, expect, it } from "vitest";
import buildRowModel from "./buildRowModel.js";

/** A row's identity. */
const readRowId = (row: { readonly id: string }): string => row.id;

describe("buildRowModel", () => {
  it("answers the model of a build that succeeds", () => {
    const model = buildRowModel({ identify: readRowId, rows: [{ id: "a" }] });
    expect(model.ids).toEqual(["a"]);
  });

  it("throws with the reason a build is rejected", () => {
    expect(() =>
      buildRowModel({ identify: readRowId, rows: [{ id: "a" }, { id: "a" }] }),
    ).toThrow('expected a built row model, got: duplicate row id "a"');
  });
});
