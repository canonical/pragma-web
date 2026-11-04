/**
 * Regression: a presence field orders unset before set, and descending
 * reverses that.
 *
 * The kind was named `flag` and ordered as a boolean: `false` before
 * `true`, with an absent value placed last in both directions. So sorting a
 * presence column ascending and descending moved only the set rows, and the
 * unset ones stayed at the bottom either way. The kind is presence: unset
 * and set are its two ranks, `false` and `true` are both set and tie, and
 * only a row the field does not apply to orders with the empties.
 */

import { describe, expect, it } from "vitest";
import { createCollection } from "../../lib/collection/index.js";
import { DEFAULT_WINDOW, EMPTY_SLICE } from "../../lib/query/index.js";
import { createArraySource } from "../../lib/source/index.js";

type Instance = {
  readonly id: string;
  readonly type: "vm" | "container";
  readonly ephemeral?: boolean;
  readonly secureboot?: boolean;
};

const collection = createCollection({
  fields: [
    { field: "type", kind: "choices", options: ["vm", "container"] },
    { field: "ephemeral", kind: "presence" },
    { field: "secureboot", kind: "presence", appliesTo: ["vm"] },
  ] as const,
  identify: (row: Instance) => row.id,
  discriminator: "type",
});

const rows: readonly Instance[] = [
  { id: "true", type: "vm", ephemeral: true, secureboot: true },
  { id: "unset", type: "vm" },
  { id: "false", type: "vm", ephemeral: false, secureboot: false },
  { id: "container", type: "container" },
];

/** The ids a local source answers for one sort term. */
const orderBy = (
  field: string,
  direction: "asc" | "desc",
): readonly string[] => {
  let ids: readonly string[] = [];
  createArraySource({ collection, rows }).execute(
    {
      requestId: "r1",
      slice: { ...EMPTY_SLICE, sort: [{ field, direction }] },
      window: DEFAULT_WINDOW,
      facets: [],
    },
    (delivery) => {
      if (delivery.status === "succeeded") {
        ids = delivery.page.rows.map((row) => row.id);
      }
    },
  );
  return ids;
};

describe("regression 0122 — presence ordered as a boolean, unset last", () => {
  it("orders unset before set ascending, set first descending", () => {
    expect(orderBy("ephemeral", "asc")).toEqual([
      "unset",
      "container",
      "true",
      "false",
    ]);
    expect(orderBy("ephemeral", "desc")).toEqual([
      "true",
      "false",
      "unset",
      "container",
    ]);
  });

  it("orders a row the field does not apply to last in both directions", () => {
    expect(orderBy("secureboot", "asc")).toEqual([
      "unset",
      "true",
      "false",
      "container",
    ]);
    expect(orderBy("secureboot", "desc")).toEqual([
      "true",
      "false",
      "unset",
      "container",
    ]);
  });
});
