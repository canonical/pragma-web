/**
 * A column's scope over record types: its field's unless it narrows, checked
 * where the table mounts so a column can never name a type nothing carries.
 */
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import {
  container,
  createInstanceProvider,
  type Instance,
  virtualMachine,
} from "../../../../../../testing/instances.js";
import {
  createMachineProvider,
  machine,
} from "../../../../../../testing/machines.js";
import type { DataTableColumn } from "../../types.js";
import readColumnScopes from "./readColumnScopes.js";

const web = container("i-1", "web-01");
const db = virtualMachine("i-2", "db-01");

/** The scopes of the given columns over the instance collection. */
const scopesOver = (columns: readonly DataTableColumn[]) => {
  const { provider } = createInstanceProvider();
  const host = readProviderHost(provider);
  return readColumnScopes({
    collection: provider.collection,
    applicability: (field, record) => host.applicability(field, record),
    typeOf: (record) => host.typeOf(record),
    columns,
  });
};

describe("readColumnScopes", () => {
  it("applies an unscoped column over an unscoped field to every record", () => {
    const column: DataTableColumn = { id: "name", header: "Name" };
    const scope = scopesOver([column])(column);
    expect(scope.scopedTo).toBeNull();
    expect(scope.applicability(web)).toBe("applies");
    expect(scope.applicability(db)).toBe("applies");
  });

  it("gives an unscoped column its field's scope", () => {
    const column: DataTableColumn = { id: "image", header: "Image" };
    const scope = scopesOver([column])(column);
    expect(scope.scopedTo).toEqual(["container"]);
    expect(scope.applicability(web)).toBe("applies");
    expect(scope.applicability(db)).toBe("not-applicable");
  });

  it("narrows an unscoped field to the types a column names", () => {
    const column: DataTableColumn = {
      id: "vm-status",
      field: "status",
      header: "VM status",
      appliesTo: ["virtual-machine"],
    };
    const scope = scopesOver([column])(column);
    expect(scope.scopedTo).toEqual(["virtual-machine"]);
    expect(scope.applicability(db)).toBe("applies");
    expect(scope.applicability(web)).toBe("not-applicable");
  });

  it("withholds a narrowed column from a record of no declared type", () => {
    const column: DataTableColumn = {
      id: "status",
      header: "Status",
      appliesTo: ["container", "virtual-machine"],
    };
    // What a server that added a type would send, and the display refuses.
    const rogue = { id: "x", type: "sandbox" } as unknown as Instance;
    expect(scopesOver([column])(column).applicability(rogue)).toBe(
      "not-applicable",
    );
  });

  it("lets a column narrow within its field's own scope", () => {
    const column: DataTableColumn = {
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
    const { provider } = createMachineProvider();
    const host = readProviderHost(provider);
    expect(() =>
      readColumnScopes({
        collection: provider.collection,
        applicability: (field, record) => host.applicability(field, record),
        typeOf: (record) => host.typeOf(record),
        columns: [{ id: "name", header: "Name", appliesTo: ["container"] }],
      }),
    ).toThrow(
      'column "name" applies to record types, but the collection declares none',
    );
    expect(host.applicability("name", machine("m-1", "alpha"))).toBe("applies");
  });

  it("answers for no column it did not read", () => {
    const scopes = scopesOver([{ id: "name", header: "Name" }]);
    expect(() => scopes({ id: "status", header: "Status" })).toThrow(
      'column "status" is not one the table renders',
    );
  });
});
