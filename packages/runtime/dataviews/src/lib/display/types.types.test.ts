/**
 * The display contracts every binding renders the same answer from: the
 * table's status, the entries of its body and the pagination facts.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { Count } from "../result/index.js";
import type {
  DisplayEntriesConfig,
  DisplayEntry,
  DisplayEntryKind,
  DisplayPagination,
  DisplayStatus,
  DisplayStatusPhase,
} from "./types.js";

describe("DisplayStatus", () => {
  it("names each thing a table says in place of its rows, or above them", () => {
    expectTypeOf<DisplayStatus["status"]>().toEqualTypeOf<
      | "pending"
      | "failed"
      | "refused"
      | "refresh-failed"
      | "stale"
      | "regrouping"
      | "no-data"
      | "no-results"
    >();
  });

  it("says why a link was refused", () => {
    expectTypeOf<
      Extract<DisplayStatus, { readonly status: "refused" }>
    >().toEqualTypeOf<{
      readonly status: "refused";
      readonly reason: string;
    }>();
  });
});

describe("DisplayStatusPhase", () => {
  it("is a settled outcome or a passing state", () => {
    expectTypeOf<DisplayStatusPhase>().toEqualTypeOf<
      "terminal" | "transient"
    >();
  });
});

describe("DisplayEntry", () => {
  it("is a record's row or a status row, told apart by kind", () => {
    expectTypeOf<DisplayEntryKind>().toEqualTypeOf<"record" | "status">();
    expectTypeOf<
      Extract<DisplayEntry, { readonly kind: "status" }>["status"]
    >().toEqualTypeOf<DisplayStatus>();
    expectTypeOf<
      Extract<DisplayEntry, { readonly kind: "record" }>["rowId"]
    >().toEqualTypeOf<string>();
  });
});

describe("DisplayEntriesConfig", () => {
  it("takes the modelled rows and the table's status, or null", () => {
    expectTypeOf<
      DisplayEntriesConfig["status"]
    >().toEqualTypeOf<DisplayStatus | null>();
  });
});

describe("DisplayPagination", () => {
  it("counts how exactly the source knows its total, and its pages when numbered", () => {
    expectTypeOf<DisplayPagination["total"]>().toEqualTypeOf<Count>();
    expectTypeOf<DisplayPagination["pages"]>().toEqualTypeOf<number | null>();
    expectTypeOf<DisplayPagination["shown"]>().toEqualTypeOf<number | null>();
  });
});
