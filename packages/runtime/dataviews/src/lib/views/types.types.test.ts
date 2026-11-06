/**
 * The saved views' contracts: what a store answers with, how a command
 * ends, and what a view's stored query reads as. Every outcome is told
 * apart by its status, and a refused view carries the clauses it was
 * refused for.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { QueryIssue } from "../result/index.js";
import type {
  StoredQuery,
  ViewAdoptionCause,
  ViewChanges,
  ViewCommand,
  ViewCommandState,
  ViewGetResult,
  ViewOutcome,
  ViewSettledOutcome,
} from "./types.js";

describe("ViewChanges", () => {
  it("changes a view's name and query, never its arrangement", () => {
    expectTypeOf<keyof ViewChanges>().toEqualTypeOf<"name" | "query">();
  });
});

describe("ViewGetResult", () => {
  it("carries the view only when it was found", () => {
    const missing: ViewGetResult = { status: "missing" };
    // @ts-expect-error a missing view has no view to carry
    const carried: ViewGetResult = { status: "missing", view: null };
    expect([missing, carried]).toHaveLength(2);
  });
});

describe("ViewCommand", () => {
  it("names every command a session runs", () => {
    expectTypeOf<ViewCommand>().toEqualTypeOf<
      "open" | "save" | "save-as" | "rename" | "remove"
    >();
  });
});

describe("ViewOutcome", () => {
  it("carries the clauses a refused view could not read", () => {
    expectTypeOf<
      Extract<ViewOutcome, { readonly status: "refused" }>["issues"]
    >().toEqualTypeOf<readonly QueryIssue[]>();
  });
});

describe("ViewSettledOutcome", () => {
  it("is every outcome but a refused name", () => {
    expectTypeOf<ViewSettledOutcome["status"]>().toEqualTypeOf<
      Exclude<ViewOutcome["status"], "invalid">
    >();
  });
});

describe("ViewCommandState", () => {
  it("carries an outcome only once the command settled", () => {
    const pending: ViewCommandState = { command: "save", status: "pending" };
    const settled: ViewCommandState = {
      command: "remove",
      status: "settled",
      outcome: { status: "removed" },
    };
    expect([pending, settled]).toHaveLength(2);
  });
});

describe("ViewAdoptionCause", () => {
  it("opens a view or reverts to one", () => {
    expectTypeOf<ViewAdoptionCause>().toEqualTypeOf<"view" | "revert">();
  });
});

describe("StoredQuery", () => {
  it("is the slice a stored query reads as, with what it refuses", () => {
    expectTypeOf<StoredQuery["issues"]>().toEqualTypeOf<
      readonly QueryIssue[]
    >();
  });
});
