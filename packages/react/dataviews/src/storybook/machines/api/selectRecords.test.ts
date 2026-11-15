import { describe, expect, it } from "vitest";
import selectRecords from "./selectRecords.js";
import type { ApiQuery, ApiRecord, ApiTextMatch } from "./types.js";

/** The records every case selects from, in input order. */
const RECORDS: readonly ApiRecord[] = [
  { id: "a", name: "alpha", owner: "ops", status: "running", cores: 4 },
  { id: "b", name: "beta", owner: "alpha-team", status: "failed", cores: 16 },
  { id: "c", name: "gamma", owner: "ops", status: "pending", cores: 8 },
  { id: "d", name: "delta", owner: "dev", status: 7, cores: "8" },
  { id: "e", name: "alphabet", status: null, cores: 2 },
  { id: "f", name: 42, owner: "dev", status: "running", cores: 4 },
];

/** A query restricting nothing, with these members in its place. */
const createQuery = (members: Partial<ApiQuery>): ApiQuery => ({
  text: [],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  facets: [],
  sort: null,
  ...members,
});

/** Whether a value holds text, compared as written. */
const matchPlainText =
  (operator: ApiTextMatch["operator"], text: string) => (value: string) =>
    operator === "contains" ? value.includes(text) : value.startsWith(text);

/** The ids of the records one query selects. */
const selectIds = (members: Partial<ApiQuery>): readonly string[] =>
  selectRecords(RECORDS, createQuery(members), matchPlainText).map(
    ({ id }) => id,
  );

describe("selectRecords", () => {
  it("selects every record, in input order, when the query restricts nothing", () => {
    expect(selectIds({})).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("keeps a record whose status is any of the listed ones", () => {
    expect(selectIds({ statuses: { isAny: ["running"], isNone: [] } })).toEqual(
      ["a", "f"],
    );
  });

  it("keeps a record whose status is none of the listed ones, if it has one", () => {
    expect(
      selectIds({ statuses: { isAny: [], isNone: ["running", "failed"] } }),
    ).toEqual(["c", "d"]);
  });

  it("keeps a record whose cores are a number within both bounds", () => {
    expect(selectIds({ cores: { gte: 4, lte: 8 } })).toEqual(["a", "c", "f"]);
    expect(selectIds({ cores: { gte: 8, lte: null } })).toEqual(["b", "c"]);
    expect(selectIds({ cores: { gte: null, lte: 2 } })).toEqual(["e"]);
  });

  it("keeps a record whose text field holds every text match", () => {
    expect(
      selectIds({
        text: [
          { field: "name", operator: "startsWith", text: "alpha" },
          { field: "name", operator: "contains", text: "bet" },
        ],
      }),
    ).toEqual(["e"]);
    expect(
      selectIds({ text: [{ field: "name", operator: "contains", text: "4" }] }),
    ).toEqual([]);
  });

  it("searches the name and the owner for the search text", () => {
    expect(selectIds({ search: "alpha" })).toEqual(["a", "b", "e"]);
    expect(selectIds({ search: "dev" })).toEqual(["d", "f"]);
  });

  it("prepares each operand once per query", () => {
    const operands: string[] = [];
    selectRecords(
      RECORDS,
      createQuery({
        text: [{ field: "name", operator: "contains", text: "a" }],
        search: "o",
      }),
      (operator, text) => {
        operands.push(`${operator} ${text}`);
        return matchPlainText(operator, text);
      },
    );
    expect(operands).toEqual(["contains a", "contains o"]);
  });

  it("requires every restriction at once", () => {
    expect(
      selectIds({
        statuses: { isAny: ["running", "pending"], isNone: [] },
        cores: { gte: 4, lte: null },
        search: "ops",
      }),
    ).toEqual(["a", "c"]);
  });

  it("orders by its one term, keeping ties in input order", () => {
    expect(
      selectIds({
        cores: { gte: 1, lte: null },
        sort: { field: "cores", direction: "desc" },
      }),
    ).toEqual(["b", "c", "a", "f", "e"]);
  });
});
