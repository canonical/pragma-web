/**
 * Regression: moving a set lifts only the conjunct the move names.
 *
 * Before the fix, `setPredicate` took any operator to replace and never
 * checked it, so a move naming its own operator, a bound or text replaced a
 * restriction nobody meant to lift, in the same transition that applied the
 * new one. A move is now an edit naming the one conjunct it removes, and a
 * `replaces` a JavaScript caller still spells lifts nothing.
 */

import { describe, expect, it } from "vitest";
import {
  applyQueryCommand,
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type Predicate,
  type QueryCommand,
} from "../../lib/query/index.js";

const standing = {
  ...EMPTY_SLICE,
  filter: [
    { field: "status", operator: "isAny", operands: ["failed"] },
    { field: "cpu", operator: "gte", operands: [4] },
  ] satisfies Predicate[],
};

/** A move as a JavaScript caller might spell one, unchecked by the compiler. */
const spellMove = (predicate: Predicate, replaces: string): QueryCommand =>
  ({ kind: "setPredicate", predicate, replaces }) as unknown as QueryCommand;

describe("regression 0073 — a set move could replace any restriction", () => {
  it("lifts nothing for a move spelled with what it replaces", () => {
    for (const predicate of [
      { field: "status", operator: "isNone", operands: ["failed"] },
      { field: "name", operator: "contains", operands: ["web"] },
    ] satisfies Predicate[]) {
      const result = applyQueryCommand(
        standing,
        DEFAULT_WINDOW,
        spellMove(predicate, "gte"),
      );
      expect(result.slice.filter).toEqual([...standing.filter, predicate]);
    }
  });

  it("lifts only the conjunct a move names", () => {
    const result = applyQueryCommand(standing, DEFAULT_WINDOW, {
      kind: "editPredicates",
      remove: [{ field: "status", operator: "isAny", nth: 0 }],
      add: [{ field: "status", operator: "isNone", operands: ["failed"] }],
    });
    expect(result.slice.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
      { field: "status", operator: "isNone", operands: ["failed"] },
    ]);
  });
});
