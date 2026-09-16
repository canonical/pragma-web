/**
 * Declaring a table's columns over the collection they show. Mutation-tested:
 * each expectation fails if the identity default, the frozen result or the
 * field a column carries moves.
 *
 * What the compiler refuses is pinned beside what the function returns: the
 * typing is the point of this factory, and a narrowing that silently widened
 * would leave every runtime expectation below still passing.
 */

import { createCollection } from "@canonical/dataviews-core";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { DisplayField } from "../../common/index.js";
import createColumns from "./createColumns.js";
import type { DataTableColumn } from "./types.js";

type Machine = {
  readonly id: string;
  readonly name: string;
  readonly cores: number;
  readonly config: { readonly region: string };
};

const machines = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "cores", kind: "number", min: 1 },
    { field: "config.region", kind: "text" },
  ],
});

describe("createColumns", () => {
  it("names each column by the field it shows", () => {
    const columns = createColumns(machines, [
      { field: "name", header: "Host" },
      { field: "cores", header: "Cores" },
    ]);
    expect(columns.map((column) => column.id)).toEqual(["name", "cores"]);
    expect(columns.map((column) => column.field)).toEqual(["name", "cores"]);
  });

  it("keeps an identity the caller gives, for two columns over one field", () => {
    const columns = createColumns(machines, [
      { id: "host", field: "name", header: "Host" },
      { id: "host-again", field: "name", header: "Also the host" },
    ]);
    expect(columns.map((column) => column.id)).toEqual(["host", "host-again"]);
    expect(columns.every((column) => column.field === "name")).toBe(true);
  });

  it("carries the table's own members through", () => {
    const columns = createColumns(machines, [
      {
        field: "cores",
        header: "Cores",
        sortable: true,
        hideable: false,
        resizable: true,
        sizing: { kind: "fixed", px: 80 },
      },
    ]);
    expect(columns.at(0)).toMatchObject({
      id: "cores",
      field: "cores",
      sortable: true,
      hideable: false,
      resizable: true,
      sizing: { kind: "fixed", px: 80 },
    });
  });

  it("names a nested field by its dot path", () => {
    const columns = createColumns(machines, [
      { field: "config.region", header: "Region" },
    ]);
    expect(columns.at(0)?.id).toBe("config.region");
    expect(columns.at(0)?.field).toBe("config.region");
  });

  it("answers a frozen list of frozen columns", () => {
    const columns = createColumns(machines, [
      { field: "name", header: "Host" },
    ]);
    expect(Object.isFrozen(columns)).toBe(true);
    expect(Object.isFrozen(columns.at(0))).toBe(true);
  });

  it("answers columns a table takes, and fields any renderer takes", () => {
    // A column is a display field plus the table's own members, so what this
    // builds is given to a table and to a renderer that shows fields alike.
    const columns = createColumns(machines, [
      { field: "name", header: "Host" },
    ]);
    expectTypeOf(columns).toExtend<readonly DataTableColumn[]>();
    expectTypeOf(columns).toExtend<readonly DisplayField[]>();
  });
});

describe("what a column declaration refuses", () => {
  it("refuses a field the collection does not declare", () => {
    createColumns(machines, [
      // @ts-expect-error - "nmae" is not one of the collection's fields.
      { field: "nmae", header: "Host" },
    ]);
    createColumns(machines, [
      // @ts-expect-error - a nested field is named by its whole path.
      { field: "region", header: "Region" },
    ]);
  });

  it("types a column's own content by the field beside it", () => {
    createColumns(machines, [
      {
        field: "cores",
        header: "Cores",
        // A number field's value is a number: reading it as one compiles.
        cell: ({ value }) => String(value.toFixed(0)),
      },
    ]);
    createColumns(machines, [
      // @ts-expect-error - a text field's value is a string, so content
      // declaring it a number is content for another field.
      {
        field: "name",
        header: "Host",
        cell: ({ value }: { readonly value: number }) => String(value),
      },
    ]);
  });

  it("types a nested field's content by the value at the end of its path", () => {
    createColumns(machines, [
      {
        field: "config.region",
        header: "Region",
        // The value at `config.region` is a string.
        cell: ({ value }) => value.toUpperCase(),
      },
    ]);
  });
});
