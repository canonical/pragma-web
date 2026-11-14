/**
 * Encoding a query over a followed link whose refused clauses stand: the
 * clauses are carried as the link spelled them, less what the applied slice
 * supplied, so a destination widens nothing and brings back nothing it left
 * out.
 */
import { describe, expect, it } from "vitest";
import type { Slice } from "../query/index.js";
import { createSchema } from "../schema/index.js";
import encodeCarryingQuery from "./encodeCarryingQuery.js";

const machines = createSchema([
  { field: "status", kind: "choices", options: ["failed", "cancelled"] },
  { field: "name", kind: "text" },
  { field: "cpu", kind: "number" },
]);

const emptySlice: Slice = { filter: [], search: null, sort: [], group: [] };

const failedOnly: Slice = {
  ...emptySlice,
  filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
};

describe("encodeCarryingQuery", () => {
  it("carries the refused clauses named, as spelled, where they stood", () => {
    const preserve = new URLSearchParams(
      "status=melted&gone__isAny=x&q=old&tab=overview",
    );
    // The search is not carried, so what is written replaces it.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: { ...emptySlice, search: "new" },
        window: null,
        preserve,
        carry: ["status", "gone__isAny"],
        applied: emptySlice,
      }).toString(),
    ).toBe("status=melted&gone__isAny=x&tab=overview&q=new");
  });

  it("keeps a carried key's refused values beside the ones it writes", () => {
    // `melted` was refused and `failed` applied: writing `failed` again
    // leaves the refused value standing, once.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: failedOnly,
        window: null,
        preserve: new URLSearchParams("status=failed&status=melted&tab=a"),
        carry: ["status"],
        applied: failedOnly,
      }).toString(),
    ).toBe("tab=a&status=failed&status=melted");
  });

  it("drops what the applied slice supplied from a carried key it does not write", () => {
    // The destination leaves the status out: `failed` is not brought back,
    // and the refused `melted` stands alone.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: emptySlice,
        window: null,
        preserve: new URLSearchParams("status=failed&status=melted"),
        carry: ["status"],
        applied: failedOnly,
      }).toString(),
    ).toBe("status=melted");
  });

  it("reads a carried key under either spelling of its operator", () => {
    // `status__isAny` supplied `failed` as `status` does: the encode writes
    // it once, as `status`, and the link's spelling keeps only `melted`.
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: failedOnly,
        window: null,
        preserve: new URLSearchParams(
          "status__isAny=failed&status__isAny=melted",
        ),
        carry: ["status__isAny"],
        applied: failedOnly,
      }).toString(),
    ).toBe("status__isAny=melted&status=failed");
  });

  it("reads a carried value as the grammar reads it, not by its spelling", () => {
    // `5.0` is the bound the applied slice holds as `5`: written once.
    const fromFive: Slice = {
      ...emptySlice,
      filter: [{ field: "cpu", operator: "gte", operands: [5] }],
    };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: fromFive,
        window: null,
        preserve: new URLSearchParams("cpu__gte=5.0"),
        carry: ["cpu__gte"],
        applied: fromFive,
      }).toString(),
    ).toBe("cpu__gte=5");
  });

  it("carries a key on an operator the grammar does not know whole", () => {
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: emptySlice,
        window: null,
        preserve: new URLSearchParams("status__between=a"),
        carry: ["status__between"],
        applied: emptySlice,
      }).toString(),
    ).toBe("status__between=a");
  });

  it("drops a carried search the applied slice supplied", () => {
    const searched: Slice = { ...emptySlice, search: "web" };
    expect(
      encodeCarryingQuery({
        schema: machines,
        slice: emptySlice,
        window: null,
        preserve: new URLSearchParams("q=web"),
        carry: ["q"],
        applied: searched,
      }).toString(),
    ).toBe("");
  });
});
