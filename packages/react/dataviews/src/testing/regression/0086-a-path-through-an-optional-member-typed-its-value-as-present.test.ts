/**
 * A column over a dot path walked through `NonNullable` of each member and
 * never put the absence back: a path through an optional or nullable member
 * was typed as the value at its end, though a row missing the member reads
 * `undefined` there. Content calling a method on that value compiled and
 * failed at the row — the hole the typed column exists to close.
 *
 * A path through a member that may be absent carries `undefined` too.
 */
import { createCollection } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";

type Machine = {
  readonly id: string;
  readonly config?: { readonly region: string };
  readonly owner: { readonly team: string } | null;
  readonly rack: { readonly row: number };
};

const machines = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [
    { field: "config.region", kind: "text" },
    { field: "owner.team", kind: "text" },
    { field: "rack.row", kind: "number", min: 0 },
  ],
});

describe("a path through a member that may be absent", () => {
  it("carries undefined beside the value at its end", () => {
    createColumns(machines, [
      {
        field: "config.region",
        header: "Region",
        cell: ({ value }) => {
          expectTypeOf(value).toEqualTypeOf<string | undefined>();
          return null;
        },
      },
      {
        field: "owner.team",
        header: "Team",
        cell: ({ value }) => {
          expectTypeOf(value).toEqualTypeOf<string | undefined>();
          return null;
        },
      },
      {
        field: "rack.row",
        header: "Row",
        // A member always present: the value alone.
        cell: ({ value }) => {
          expectTypeOf(value).toEqualTypeOf<number>();
          return null;
        },
      },
    ]);
  });
});
