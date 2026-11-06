import { describe, expect, it, vi } from "vitest";
import byId from "../../../testing/byId.js";
import pageOf from "../../../testing/pageOf.js";
import { createQueryCoordinator } from "../coordinator/index.js";
import { createChannel } from "../observable/index.js";
import type { Completion } from "../result/index.js";
import {
  createRowModel,
  EMPTY_ROW_MODEL,
  type RowModel,
  type RowRecord,
} from "../rows/index.js";
import createRequestCompleter from "./createRequestCompleter.js";
import type { RecordTyping } from "./types.js";

const alpha = { id: "a", name: "Alpha" };
const rows = [alpha, { id: "b", name: "Beta" }];

const succeeded = (page: readonly RowRecord[]): Completion => ({
  status: "succeeded",
  page: pageOf(page),
});

/** A typing that rejects every model with the given reason, or none. */
const typing = (rejection: string | null): RecordTyping => ({
  rejectionOf: () => rejection,
  applicability: () => "applies",
  recordType: () => null,
  remember: vi.fn(),
  forget: vi.fn(),
});

const setup = (recordTyping: RecordTyping | null = null) => {
  const coordinator = createQueryCoordinator();
  const model = createChannel<RowModel>(EMPTY_ROW_MODEL);
  const publish = vi.fn();
  const complete = createRequestCompleter({
    coordinator,
    rows: model,
    identify: byId,
    recordTyping,
    publish,
  });
  const requestId = coordinator.refresh();
  return { coordinator, model, publish, complete, requestId };
};

describe("createRequestCompleter", () => {
  it("displays the rows of the pending request's success", () => {
    const { coordinator, model, publish, complete, requestId } = setup();
    expect(complete(requestId, succeeded(rows))).toBe(true);
    expect(model.get().ids).toEqual(["a", "b"]);
    expect(coordinator.state.result.status).toBe("ready");
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("builds nothing and publishes nothing for any other request", () => {
    const { model, publish, complete } = setup();
    expect(complete("elsewhere", succeeded(rows))).toBe(false);
    expect(model.get()).toBe(EMPTY_ROW_MODEL);
    expect(publish).not.toHaveBeenCalled();
  });

  it("fails the request on rows with an ambiguous identity, keeping the rows shown", () => {
    const { coordinator, model, complete, requestId } = setup();
    complete(requestId, succeeded([alpha, alpha]));
    expect(model.get()).toBe(EMPTY_ROW_MODEL);
    expect(coordinator.state.result.problem).toMatchObject({
      status: "failed",
      failure: { transient: false, cause: null },
    });
  });

  it("fails the request on rows the record typing rejects", () => {
    const rejecting = typing("row b has no type");
    const { coordinator, model, complete, requestId } = setup(rejecting);
    complete(requestId, succeeded(rows));
    expect(model.get()).toBe(EMPTY_ROW_MODEL);
    expect(coordinator.state.result.problem).toEqual({
      status: "failed",
      failure: { reason: "row b has no type", transient: false, cause: null },
    });
    expect(rejecting.remember).not.toHaveBeenCalled();
  });

  it("remembers the outgoing model's types before replacing it", () => {
    const accepting = typing(null);
    const { model, complete, requestId } = setup(accepting);
    complete(requestId, succeeded(rows));
    expect(accepting.remember).toHaveBeenCalledWith(EMPTY_ROW_MODEL);
    expect(model.get().ids).toEqual(["a", "b"]);
  });

  it("keeps a model handed back whole, without reading its records again", () => {
    const accepting = typing(null);
    const { coordinator, model, complete } = setup(accepting);
    const built = createRowModel({ rows, identify: byId });
    if (built.status !== "built") {
      throw new Error("the fixture rows build a model");
    }
    const shown = built.model;
    model.set(shown);
    const requestId = coordinator.refresh();
    complete(requestId, succeeded(rows));
    expect(model.get()).toBe(shown);
    expect(accepting.remember).not.toHaveBeenCalled();
  });

  it("keeps the rows shown when the request fails", () => {
    const { coordinator, model, complete, requestId } = setup();
    complete(requestId, succeeded(rows));
    const shown = model.get();
    const retry = coordinator.refresh();
    complete(retry, {
      status: "failed",
      failure: { reason: "offline", cause: null, transient: true },
    });
    expect(model.get()).toBe(shown);
  });
});
