import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import declare from "../../../testing/declare.js";
import { createQueryCoordinator } from "../coordinator/index.js";
import { createChannel } from "../observable/index.js";
import { DEFAULT_WINDOW, type Query, type Slice } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import type { SourceCapabilities } from "../source/index.js";
import createQueryCommands from "./createQueryCommands.js";
import resolveHistoryPolicy from "./resolveHistoryPolicy.js";
import type { Transition } from "./types.js";

/** Filters on status alone: a filter on cpu is refused at the boundary. */
const statusOnly: SourceCapabilities = declare({
  filter: { status: ["isAny"] },
});

const query = (slice: Partial<Slice> = {}): Query => ({
  slice: { filter: [], search: null, sort: [], group: [], ...slice },
  window: DEFAULT_WINDOW,
});

const failedOnly = {
  field: "status",
  operator: "isAny",
  operands: ["failed"],
} as const;

const setup = (
  options: {
    readonly capabilities?: SourceCapabilities;
    readonly refusals?: (query: Query) => readonly SourceRefusal[];
    readonly initial?: Query;
  } = {},
) => {
  const coordinator = createQueryCoordinator({ initial: options.initial });
  const source = createManualSource({
    capabilities: options.capabilities ?? statusOnly,
    refusals: options.refusals,
  });
  const publish = vi.fn();
  const transitions = createChannel<Transition | null>(null);
  const view = createChannel<string | null>(null);
  const commands = createQueryCommands({
    coordinator,
    capabilities: source.source.capabilities,
    source: source.source,
    publish,
    transitions,
    history: resolveHistoryPolicy(undefined),
    view,
  });
  return { coordinator, commands, publish, transitions, view };
};

describe("createQueryCommands", () => {
  describe("refusals", () => {
    it("answers with the declared refusals before asking the source", () => {
      const own = vi.fn(() => []);
      const { commands } = setup({ refusals: own });
      const refused = commands.refusals(
        query({
          filter: [{ field: "cpu", operator: "gte", operands: [4] }],
        }),
      );
      expect(refused).toHaveLength(1);
      expect(refused[0]).toMatchObject({ part: "filter", field: "cpu" });
      expect(own).not.toHaveBeenCalled();
    });

    it("hands over a frozen copy of the source's own refusals", () => {
      const own: SourceRefusal[] = [
        {
          part: "filter",
          field: "status",
          operator: null,
          code: "unsupported-combination",
          reason: "not with a search",
        },
      ];
      const { commands } = setup({ refusals: () => own });
      const refused = commands.refusals(query());
      expect(refused).toEqual(own);
      expect(refused).not.toBe(own);
      expect(Object.isFrozen(refused)).toBe(true);
    });

    it("answers one frozen empty list when nothing is refused", () => {
      const { commands } = setup();
      const none = commands.refusals(query());
      expect(none).toEqual([]);
      expect(Object.isFrozen(none)).toBe(true);
      expect(commands.refusals(query())).toBe(none);
    });
  });

  describe("command", () => {
    it("applies an accepted command, publishes it, then announces the move", () => {
      const { coordinator, commands, publish, transitions } = setup();
      const order: string[] = [];
      publish.mockImplementation(() => order.push("publish"));
      transitions.subscribe(() => order.push("transition"));
      expect(
        commands.command({ kind: "setPredicate", predicate: failedOnly }),
      ).toEqual([]);
      expect(coordinator.state.slice.filter).toEqual([failedOnly]);
      expect(coordinator.state.pendingRequestId).not.toBeNull();
      expect(order).toEqual(["publish", "transition"]);
      expect(transitions.get()).toEqual({
        query: { slice: coordinator.state.slice, window: DEFAULT_WINDOW },
        cause: "filter",
        history: "push",
      });
    });

    it("refuses a command that incurs a refusal, and moves nothing", () => {
      const { coordinator, commands, publish, transitions } = setup();
      const before = coordinator.state;
      const refused = commands.command({
        kind: "setPredicate",
        predicate: { field: "cpu", operator: "gte", operands: [4] },
      });
      expect(refused).toHaveLength(1);
      expect(coordinator.state).toBe(before);
      expect(publish).not.toHaveBeenCalled();
      expect(transitions.get()).toBeNull();
    });

    it("takes a command over a query already carrying a refused clause", () => {
      const cpu = { field: "cpu", operator: "gte", operands: [4] } as const;
      const { coordinator, commands } = setup({
        initial: query({ filter: [cpu] }),
      });
      expect(
        commands.command({ kind: "setPredicate", predicate: failedOnly }),
      ).toEqual([]);
      expect(coordinator.state.slice.filter).toEqual([cpu, failedOnly]);
    });

    it("answers a command that moves nothing with no refusal and no move", () => {
      const { commands, publish } = setup();
      expect(commands.command({ kind: "setSort", sort: [] })).toEqual([]);
      expect(publish).not.toHaveBeenCalled();
    });

    it("throws on a command the grammar rejects", () => {
      const { commands } = setup();
      expect(() =>
        commands.command({ kind: "navigateWindow", page: 0 }),
      ).toThrow();
    });
  });

  describe("adopt", () => {
    it("adopts a query that moves, publishing it before the transition", () => {
      const { coordinator, commands, publish, transitions } = setup();
      const requestId = commands.adopt(
        query({ filter: [failedOnly] }),
        "adopt",
        null,
      );
      expect(requestId).toBe(coordinator.state.pendingRequestId);
      expect(publish).toHaveBeenCalledTimes(1);
      // The location's own adoption is never written back.
      expect(transitions.get()).toMatchObject({
        cause: "adopt",
        history: null,
      });
    });

    it("answers nothing for the query already in force under the same view", () => {
      const { commands, publish, transitions } = setup();
      expect(commands.adopt(query(), "adopt", null)).toBeNull();
      expect(publish).not.toHaveBeenCalled();
      expect(transitions.get()).toBeNull();
    });

    it("moves the view before the transition, over the query already in force", () => {
      const { commands, publish, transitions, view } = setup();
      const seen: (string | null)[] = [];
      transitions.subscribe(() => seen.push(view.get()));
      expect(commands.adopt(query(), "view", "failing")).toBeNull();
      expect(publish).toHaveBeenCalledTimes(1);
      expect(view.get()).toBe("failing");
      expect(seen).toEqual(["failing"]);
    });
  });

  describe("refresh", () => {
    it("issues a request for the query in force and publishes it", () => {
      const { coordinator, commands, publish } = setup();
      const requestId = commands.refresh();
      expect(requestId).toBe(coordinator.state.pendingRequestId);
      expect(publish).toHaveBeenCalledTimes(1);
    });
  });
});
