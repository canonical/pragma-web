/**
 * The row model is what keys selection, focus and actions to records rather
 * than to array positions. Every case here is mutation-tested: dropping the
 * identity guards, the entry carry or the whole-model carry fails one.
 */
import { describe, expect, it } from "vitest";
import {
  buildRowModel,
  type StatusMachine as Machine,
} from "../../../testing/index.js";
import { assertInvariant } from "../assertion/index.js";
import createRowModel from "./createRowModel.js";
import type {
  RowIdentifier,
  RowModel,
  RowModelConfig,
  RowRecord,
} from "./types.js";

const buildMachine = (id: string, status = "running"): Machine => ({
  id,
  status,
});

/** The identity every case reads: the machine's own `id`. */
const readId = (row: Machine): string => row.id;

/** The reason of a build the case expects to be rejected. */
const readRejection = <TRow extends object>(
  config: RowModelConfig<TRow>,
): string => {
  const result = createRowModel(config);
  return result.status === "rejected" ? result.reason : "";
};

/** The entry a model holds at one position, which the case has put there. */
const readEntry = (
  model: RowModel<Machine>,
  position: number,
): RowModel<Machine>["entries"][number] =>
  assertInvariant(model.entries.at(position), `an entry at ${position}`);

describe("createRowModel", () => {
  it("answers with the built model, never the model itself", () => {
    expect(
      createRowModel({ identify: readId, rows: [buildMachine("m-1")] }),
    ).toEqual({
      status: "built",
      model: expect.objectContaining({ ids: ["m-1"] }),
    });
  });

  it("orders entries and identities as the result did", () => {
    const model = buildRowModel({
      identify: readId,
      rows: [buildMachine("m-2"), buildMachine("m-1")],
    });
    expect(model.ids).toEqual(["m-2", "m-1"]);
    expect(model.entries.map((entry) => entry.id)).toEqual(["m-2", "m-1"]);
  });

  it("addresses records by identity, not position", () => {
    const rows = [buildMachine("m-1"), buildMachine("m-2")];
    const model = buildRowModel({ identify: readId, rows });
    expect(model.findRecord("m-2")).toBe(rows.at(1));
    expect(model.findRecord("absent")).toBeUndefined();
  });

  it("freezes the entries, the identities and each entry", () => {
    const model = buildRowModel({
      identify: readId,
      rows: [buildMachine("m-1")],
    });
    expect(Object.isFrozen(model.entries)).toBe(true);
    expect(Object.isFrozen(model.ids)).toBe(true);
    expect(Object.isFrozen(readEntry(model, 0))).toBe(true);
  });

  it("rejects a record whose identity is not a non-empty string", () => {
    const reason = "row identity must be a non-empty string";
    expect(
      readRejection({
        rows: [{ id: "" }],
        identify: (row: { readonly id: string }) => row.id,
      }),
    ).toBe(reason);
    expect(
      readRejection({
        rows: [{ id: 7 }],
        identify: ((row: { readonly id: number }) =>
          row.id) as unknown as RowIdentifier<{ readonly id: number }>,
      }),
    ).toBe(reason);
  });

  it("keys the model by the declared identifier", () => {
    const model = buildRowModel({
      rows: [{ uuid: "a" }, { uuid: "b" }],
      identify: (row: { readonly uuid: string }) => row.uuid,
    });
    expect(model.ids).toEqual(["a", "b"]);
  });

  it("rejects a declared identifier that answers with a non-string", () => {
    const broken = ((): unknown => 42) as RowIdentifier<RowRecord>;
    expect(readRejection({ rows: [{ id: "m-1" }], identify: broken })).toBe(
      "row identity must be a non-empty string",
    );
  });

  it("rejects a declared identifier that answers with an empty string", () => {
    expect(readRejection({ rows: [{ id: "m-1" }], identify: () => "" })).toBe(
      "row identity must be a non-empty string",
    );
  });

  it("rejects two records claiming one identity", () => {
    expect(
      readRejection({
        identify: readId,
        rows: [buildMachine("m-1"), buildMachine("m-1")],
      }),
    ).toBe('duplicate row id "m-1"');
  });

  it("returns the previous model whole when nothing moved", () => {
    const rows = [buildMachine("m-1"), buildMachine("m-2")];
    const first = buildRowModel({ identify: readId, rows });
    expect(
      buildRowModel({ identify: readId, rows: [...rows], previous: first }),
    ).toBe(first);
  });

  it("carries the entries of unchanged records past a replaced one", () => {
    const kept = buildMachine("m-1");
    const first = buildRowModel({
      identify: readId,
      rows: [kept, buildMachine("m-2")],
    });
    const second = buildRowModel({
      identify: readId,
      rows: [kept, buildMachine("m-2", "stopped")],
      previous: first,
    });
    expect(second).not.toBe(first);
    expect(readEntry(second, 0)).toBe(readEntry(first, 0));
    expect(readEntry(second, 1)).not.toBe(readEntry(first, 1));
  });

  it("carries entries across a reorder, keying by identity", () => {
    const one = buildMachine("m-1");
    const two = buildMachine("m-2");
    const first = buildRowModel({ identify: readId, rows: [one, two] });
    const second = buildRowModel({
      identify: readId,
      rows: [two, one],
      previous: first,
    });
    expect(second).not.toBe(first);
    expect(readEntry(second, 0)).toBe(readEntry(first, 1));
    expect(readEntry(second, 1)).toBe(readEntry(first, 0));
  });

  it("carries surviving entries when the result grows or shrinks", () => {
    const one = buildMachine("m-1");
    const first = buildRowModel({
      identify: readId,
      rows: [one, buildMachine("m-2")],
    });
    const shorter = buildRowModel({
      identify: readId,
      rows: [one],
      previous: first,
    });
    expect(readEntry(shorter, 0)).toBe(readEntry(first, 0));
    expect(shorter.ids).toEqual(["m-1"]);
    const longer = buildRowModel({
      identify: readId,
      rows: [one, buildMachine("m-3")],
      previous: shorter,
    });
    expect(readEntry(longer, 0)).toBe(readEntry(first, 0));
    expect(longer.ids).toEqual(["m-1", "m-3"]);
  });

  it("builds a fresh model when no predecessor is offered", () => {
    const rows = [buildMachine("m-1")];
    expect(buildRowModel({ identify: readId, rows })).not.toBe(
      buildRowModel({ identify: readId, rows }),
    );
  });
});
