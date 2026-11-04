/**
 * Every conjunct a slice holds survives the wire: written and read back,
 * a slice of up to three conjuncts over one or two addresses of each kind
 * is its own canonical form, a link written once is written the same again,
 * the order conjuncts are given in changes nothing, and a saved view's
 * stored query reads back the conjuncts it was saved with.
 */

import { describe, expect, it } from "vitest";
import buildStoredView from "../../../testing/buildStoredView.js";
import declare from "../../../testing/declare.js";
import { createCollection } from "../../lib/collection/index.js";
import {
  areSlicesEqual,
  canonicalizeSlice,
  EMPTY_SLICE,
  type Predicate,
  type Slice,
} from "../../lib/query/index.js";
import readStoredQuery from "../../lib/views/readStoredQuery.js";
import { decodeQuery, encodeQuery } from "../../lib/wire/index.js";

const collection = createCollection({
  fields: [
    { field: "tags", kind: "choices" },
    { field: "cpu", kind: "number" },
    { field: "updated", kind: "date" },
    { field: "owner", kind: "presence" },
    { field: "hostname", kind: "text" },
  ],
  identify: (row: { readonly id: string }) => row.id,
});
const { schema } = collection;

/** Conjuncts of every kind, two or more per address, and two addresses on one field. */
const POOL: readonly Predicate[] = [
  { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
  { field: "tags", operator: "isAny", operands: ["ex-nvme", "ex-gpu"] },
  { field: "tags", operator: "isNone", operands: ["ex-ssd"] },
  { field: "cpu", operator: "gte", operands: [4] },
  { field: "cpu", operator: "gte", operands: [1e21] },
  { field: "updated", operator: "lte", operands: ["2026-01-02"] },
  { field: "owner", operator: "isSet", operands: [] },
  { field: "hostname", operator: "contains", operands: ["ex"] },
  { field: "hostname", operator: "contains", operands: ["web"] },
];

/** Every choice of up to `size` conjuncts from the pool, repeats included. */
const listSlices = (size: number): readonly Slice[] => {
  const slices: Slice[] = [];
  const extend = (from: number, filter: readonly Predicate[]): void => {
    slices.push({ ...EMPTY_SLICE, filter });
    if (filter.length === size) {
      return;
    }
    for (let at = from; at < POOL.length; at += 1) {
      extend(at, [...filter, POOL[at] as Predicate]);
    }
  };
  extend(0, []);
  return slices;
};

const write = (slice: Slice, preserve?: URLSearchParams): URLSearchParams =>
  encodeQuery({
    schema,
    slice,
    window: null,
    ...(preserve === undefined ? {} : { preserve }),
  });

const read = (params: URLSearchParams) => decodeQuery({ schema, params });

describe("conjuncts round trip through the wire", () => {
  const slices = listSlices(3);

  it("reads every written slice back as its canonical form", () => {
    for (const slice of slices) {
      const decoded = read(write(slice));
      expect(decoded.issues).toEqual([]);
      expect(canonicalizeSlice(decoded.slice)).toEqual(
        canonicalizeSlice(slice),
      );
    }
  });

  it("writes a link read back exactly as it was written", () => {
    for (const slice of slices) {
      const written = write(slice);
      expect(write(read(written).slice, written).toString()).toBe(
        written.toString(),
      );
    }
  });

  it("writes the same link whatever order the conjuncts are given in", () => {
    for (const slice of slices) {
      expect(
        write({ ...slice, filter: [...slice.filter].reverse() }).toString(),
      ).toBe(write(slice).toString());
    }
  });

  it("collapses a conjunct given twice, as A and A is A", () => {
    const [first] = POOL;
    expect(
      write({
        ...EMPTY_SLICE,
        filter: [first as Predicate, first as Predicate],
      }).toString(),
    ).toBe("tags=ex-gpu");
  });

  it("reads back a saved view's conjuncts, modified only when they differ", () => {
    const stored = readStoredQuery(
      buildStoredView({
        query: "tags=ex-gpu&tags__isAny__1=ex-nvme&cpu__gte=4&cpu__gte__1=8",
      }),
      {
        schema,
        capabilities: declare({ filter: { tags: ["isAny"], cpu: ["gte"] } }),
      },
    );
    expect(stored.issues).toEqual([]);
    expect(canonicalizeSlice(stored.slice).filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
      { field: "cpu", operator: "gte", operands: [8] },
      { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
      { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
    ]);
    // The same conjuncts in another order are the view as saved.
    expect(
      areSlicesEqual(stored.slice, {
        ...stored.slice,
        filter: [...stored.slice.filter].reverse(),
      }),
    ).toBe(true);
    // One conjunct gone, or another value, is a modified view.
    expect(
      areSlicesEqual(stored.slice, {
        ...stored.slice,
        filter: stored.slice.filter.slice(1),
      }),
    ).toBe(false);
    expect(
      areSlicesEqual(stored.slice, {
        ...stored.slice,
        filter: [
          ...stored.slice.filter.slice(1),
          { field: "tags", operator: "isAny", operands: ["ex-ssd"] },
        ],
      }),
    ).toBe(false);
  });
});
