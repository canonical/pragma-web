import { describe, expect, expectTypeOf, it, vi } from "vitest";
import answerWith from "../../../testing/answerWith.js";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import declareSort from "../../../testing/declareSort.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../collection/index.js";
import { createMemoryLocation } from "../location/index.js";
import type { ReadonlyChannel } from "../observable/index.js";
import {
  createDataViewsProvider,
  readProviderHost,
} from "../provider/index.js";
import type { EmptyOr } from "../schema/index.js";
import createFilterInputs from "./createFilterInputs.js";

const machines = createCollection({
  identify: readId,
  fields: [
    { field: "status", kind: "choices", options: ["failed", "cancelled"] },
    { field: "cpu", kind: "number", min: 0, max: 64 },
    { field: "owner", kind: "presence" },
    { field: "updated", kind: "date" },
    { field: "name", kind: "text" },
  ],
});

/** A provider whose source executes every filter, over an empty page. */
const provider = (location?: ReturnType<typeof createMemoryLocation>) =>
  createDataViewsProvider({
    collection: machines,
    source: createManualSource({
      capabilities: declare({
        filter: {
          status: ["isAny"],
          cpu: ["gte", "lte"],
          owner: ["isSet"],
          updated: ["gte", "lte"],
        },
        sort: declareSort(["cpu"]),
      }),
      answer: answerWith([]),
    }).source,
    ...(location === undefined ? {} : { location }),
  });

describe("createFilterInputs", () => {
  it("builds one handle per field and legal operator, typed by the schema", () => {
    const { handles } = createFilterInputs({
      host: readProviderHost(provider()),
    });
    expect(Object.keys(handles).sort()).toEqual([
      "cpu",
      "name",
      "owner",
      "status",
      "updated",
    ]);
    expect(Object.keys(handles.cpu).sort()).toEqual(["gte", "lte"]);
    expect(Object.keys(handles.name)).toEqual(["contains", "startsWith"]);
    expect(Object.keys(handles.status)).toEqual(["isAny", "isNone"]);
    expectTypeOf(handles.name.contains.applied).toEqualTypeOf<
      ReadonlyChannel<EmptyOr<string>>
    >();
    expectTypeOf(handles.status.isAny.applied).toEqualTypeOf<
      ReadonlyChannel<EmptyOr<ReadonlySet<"failed" | "cancelled">>>
    >();
    expectTypeOf(handles.cpu.gte.applied).toEqualTypeOf<
      ReadonlyChannel<EmptyOr<number>>
    >();
    // The adoption stays with the records: a root's handle cannot impose
    // a predicate the query does not hold.
    expect(handles.cpu.gte).not.toHaveProperty("setApplied");
  });

  it("routes a valid edit to the provider's query as a request", () => {
    const p = provider();
    const { handles } = createFilterInputs({ host: readProviderHost(p) });
    handles.cpu.gte.edit("4");
    expect(p.state.get().slice.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
    ]);
    expect(p.state.get().result.status).toBe("pending");
    expect(handles.cpu.gte.state.get().feedback).toEqual({
      status: "applied",
    });
  });

  it("refuses an edit the source cannot execute and moves nothing", () => {
    const location = createMemoryLocation({ href: "/machines" });
    const p = createDataViewsProvider({
      collection: machines,
      source: createManualSource({
        capabilities: declare({ filter: { status: ["isAny"] } }),
      }).source,
      location,
    });
    const release = p.observe();
    const before = p.state.get();
    const { handles } = createFilterInputs({ host: readProviderHost(p) });
    handles.cpu.gte.edit("4");
    expect(handles.cpu.gte.state.get().feedback).toMatchObject({
      status: "refused",
      refusals: [{ part: "filter", code: "undeclared-field", field: "cpu" }],
    });
    expect(p.state.get()).toBe(before);
    expect(location.read().has("cpu__gte")).toBe(false);
    release();
  });

  it("keeps the records apart per set: two sets share the query, not the input", () => {
    const p = provider();
    const host = readProviderHost(p);
    const one = createFilterInputs({ host });
    const two = createFilterInputs({ host });
    const stopOne = one.observe();
    const stopTwo = two.observe();
    // Typing `1e` in one window shows the broken input in that window only.
    one.handles.cpu.gte.edit("1e");
    expect(one.handles.cpu.gte.state.get().feedback.status).toBe("invalid");
    expect(two.handles.cpu.gte.state.get().feedback.status).toBe("none");
    expect(two.handles.cpu.gte.state.get().input).toBe("");
    // A valid edit in one reaches the query, and the other's mirror.
    one.handles.cpu.gte.edit("4");
    expect(two.handles.cpu.gte.applied.get()).toEqual({
      kind: "value",
      value: 4,
    });
    expect(two.handles.cpu.gte.state.get().input).toBe("4");
    // The editor keeps its own feedback; the mirror shows none.
    expect(one.handles.cpu.gte.state.get().feedback).toEqual({
      status: "applied",
    });
    expect(two.handles.cpu.gte.state.get().feedback).toEqual({
      status: "none",
    });
    stopOne();
    stopTwo();
  });

  it("follows the query while observing, and catches up when it starts", () => {
    const p = provider();
    const host = readProviderHost(p);
    const inputs = createFilterInputs({ host });
    // Moved before anything followed it: seen on observe.
    host.adopt(
      {
        slice: {
          filter: [
            { field: "status", operator: "isAny", operands: ["failed"] },
          ],
          search: null,
          sort: [],
          group: [],
        },
        window: p.state.get().window,
      },
      "adopt",
      null,
    );
    expect(inputs.handles.status.isAny.applied.get()).toEqual({
      kind: "empty",
    });
    const stop = inputs.observe();
    expect(inputs.handles.status.isAny.applied.get()).toEqual({
      kind: "value",
      value: new Set(["failed"]),
    });
    // Moved while following: adopted at once, stale input discarded.
    inputs.handles.cpu.gte.edit("nope");
    host.adopt(
      {
        slice: {
          filter: [{ field: "cpu", operator: "gte", operands: [8] }],
          search: null,
          sort: [],
          group: [],
        },
        window: p.state.get().window,
      },
      "adopt",
      null,
    );
    expect(inputs.handles.status.isAny.applied.get()).toEqual({
      kind: "empty",
    });
    expect(inputs.handles.cpu.gte.state.get()).toEqual({
      input: "8",
      feedback: { status: "none" },
    });
    expect(inputs.handles.cpu.gte.applied.get()).toEqual({
      kind: "value",
      value: 8,
    });
    // Released: the query moves on without the records.
    stop();
    p.reset();
    expect(inputs.handles.cpu.gte.applied.get()).toEqual({
      kind: "value",
      value: 8,
    });
  });

  it("ends every input session on a move of the location, the predicate kept or not", () => {
    const location = createMemoryLocation({
      href: "/machines?cpu__gte=4&page=1&size=50",
    });
    const p = provider(location);
    const release = p.observe();
    const inputs = createFilterInputs({ host: readProviderHost(p) });
    const stop = inputs.observe();
    inputs.handles.cpu.gte.edit("4e");
    expect(inputs.handles.cpu.gte.state.get().input).toBe("4e");
    // Back to the same bound on another page: the half-typed value goes.
    location.write(new URLSearchParams("cpu__gte=4&page=2&size=50"));
    expect(inputs.handles.cpu.gte.state.get()).toEqual({
      input: "4",
      feedback: { status: "none" },
    });
    // A move the reader makes through the records ends nothing.
    inputs.handles.cpu.gte.edit("4e");
    p.navigateWindow({ page: 3 });
    expect(inputs.handles.cpu.gte.state.get().input).toBe("4e");
    stop();
    // Released: a later move leaves the records alone.
    location.write(new URLSearchParams("cpu__gte=4&page=1&size=50"));
    expect(inputs.handles.cpu.gte.state.get().input).toBe("4e");
    release();
  });

  it("adopts nothing for a publication that moved no predicate", () => {
    const p = provider();
    const host = readProviderHost(p);
    const inputs = createFilterInputs({ host });
    inputs.observe();
    inputs.handles.cpu.gte.edit("4");
    const seen = vi.fn();
    inputs.handles.cpu.gte.state.subscribe(seen);
    // Rows arriving, a sort, a page: the filter records stay as they are.
    p.setSort([{ field: "cpu", direction: "desc" }]);
    p.navigateWindow({ page: 2 });
    expect(seen).not.toHaveBeenCalled();
    expect(inputs.handles.cpu.gte.state.get().feedback).toEqual({
      status: "applied",
    });
  });

  it("clears a predicate on the query and answers with no refusal", () => {
    const p = provider();
    const inputs = createFilterInputs({ host: readProviderHost(p) });
    inputs.handles.owner.isSet.set([]);
    expect(p.state.get().slice.filter).toHaveLength(1);
    expect(inputs.handles.owner.isSet.clear()).toEqual([]);
    expect(p.state.get().slice.filter).toEqual([]);
    expect(inputs.handles.owner.isSet.applied.get()).toEqual({ kind: "empty" });
  });
});
