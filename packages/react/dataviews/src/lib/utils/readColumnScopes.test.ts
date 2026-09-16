/**
 * A column's scope over record types: its field's unless it narrows, checked
 * where the renderer mounts so a column can never name a type nothing
 * carries.
 */
import { describe, expect, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import { machines } from "../../../testing/machines.js";
import type { DisplayField } from "../common/index.js";
import readColumnScopes from "./readColumnScopes.js";

/** The scopes of the given columns over the instance collection. */
const scopesOver = (columns: readonly DisplayField[]) =>
  readColumnScopes({ collection: instances, columns });

describe("readColumnScopes", () => {
  it("applies an unscoped column over an unscoped field to every type", () => {
    const column: DisplayField = { id: "name", header: "Name" };
    const scope = scopesOver([column])(column);
    expect(scope.scopedTo).toBeNull();
    expect(scope.applicability("container")).toBe("applies");
    expect(scope.applicability("virtual-machine")).toBe("applies");
  });

  it("gives an unscoped column its field's scope", () => {
    const column: DisplayField = { id: "image", header: "Image" };
    const scope = scopesOver([column])(column);
    expect(scope.scopedTo).toEqual(["container"]);
    expect(scope.applicability("container")).toBe("applies");
    expect(scope.applicability("virtual-machine")).toBe("not-applicable");
  });

  it("narrows an unscoped field to the types a column names", () => {
    const column: DisplayField = {
      id: "vm-status",
      field: "status",
      header: "VM status",
      appliesTo: ["virtual-machine"],
    };
    const scope = scopesOver([column])(column);
    expect(scope.scopedTo).toEqual(["virtual-machine"]);
    expect(scope.applicability("virtual-machine")).toBe("applies");
    expect(scope.applicability("container")).toBe("not-applicable");
  });

  it("withholds a narrowed column from a record of no declared type", () => {
    const column: DisplayField = {
      id: "status",
      header: "Status",
      appliesTo: ["container", "virtual-machine"],
    };
    expect(scopesOver([column])(column).applicability(null)).toBe(
      "not-applicable",
    );
  });

  it("lets a column narrow within its field's own scope", () => {
    const column: DisplayField = {
      id: "image",
      header: "Image",
      appliesTo: ["container"],
    };
    expect(scopesOver([column])(column).scopedTo).toEqual(["container"]);
  });

  it("refuses a column naming a type its field does not apply to", () => {
    expect(() =>
      scopesOver([
        { id: "image", header: "Image", appliesTo: ["virtual-machine"] },
      ]),
    ).toThrow(
      'column "image" applies to "virtual-machine", which its field "image" does not',
    );
  });

  it("refuses a column naming a type the collection does not declare", () => {
    expect(() =>
      scopesOver([{ id: "name", header: "Name", appliesTo: ["sandbox"] }]),
    ).toThrow(
      'column "name" applies to "sandbox", which is not a type of "type"',
    );
  });

  it("refuses a column applying to no type at all", () => {
    expect(() =>
      scopesOver([{ id: "name", header: "Name", appliesTo: [] }]),
    ).toThrow('column "name" applies to no record type');
  });

  it("refuses a narrowing over a collection declaring no types", () => {
    expect(() =>
      readColumnScopes({
        collection: machines,
        columns: [{ id: "name", header: "Name", appliesTo: ["container"] }],
      }),
    ).toThrow(
      'column "name" applies to record types, but the collection declares none',
    );
  });

  it("answers for no column it did not read", () => {
    const scopes = scopesOver([{ id: "name", header: "Name" }]);
    expect(() => scopes({ id: "status", header: "Status" })).toThrow(
      'column "status" is not one the table renders',
    );
  });
});
