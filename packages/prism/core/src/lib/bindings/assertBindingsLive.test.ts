import { describe, expect, it, vi } from "vitest";
import { assertBindingsLive } from "./assertBindingsLive.js";
import { BINDING_PROBE_QUERY } from "./constants.js";
import type { GraphQLExecute } from "./types.js";

const station = {
  id: "station",
  classUri: "metro:Station",
  typename: "Station",
} as const;

const line = { id: "line", classUri: "metro:Line", typename: "Line" } as const;

describe("assertBindingsLive", () => {
  it("probes each binding's class with its uri, and resolves when all are known", async () => {
    const execute = vi.fn<GraphQLExecute>((_query, variables) =>
      Promise.resolve({ data: { ontologyClass: { uri: variables.uri } } }),
    );
    await expect(
      assertBindingsLive(execute, [station, line]),
    ).resolves.toBeUndefined();
    expect(execute.mock.calls).toEqual([
      [BINDING_PROBE_QUERY, { uri: "metro:Station" }],
      [BINDING_PROBE_QUERY, { uri: "metro:Line" }],
    ]);
  });

  it("throws, naming the binding, when the graph does not know the class", async () => {
    const execute: GraphQLExecute = () =>
      Promise.resolve({ data: { ontologyClass: null } });
    await expect(assertBindingsLive(execute, [station])).rejects.toThrow(
      'assertBindingsLive: binding "station" names class "metro:Station", which the graph does not know',
    );
  });

  it("throws when the answer carries no data", async () => {
    const execute: GraphQLExecute = () => Promise.resolve({});
    await expect(assertBindingsLive(execute, [station])).rejects.toThrow(
      "which the graph does not know",
    );
  });

  it("throws with the graph's messages when the probe errors", async () => {
    const execute: GraphQLExecute = () =>
      Promise.resolve({
        errors: [{ message: "unknown field" }, { message: "try again" }],
      });
    await expect(assertBindingsLive(execute, [station])).rejects.toThrow(
      'assertBindingsLive: binding "station" probe failed: unknown field; try again',
    );
  });

  it("stops at the first binding that fails", async () => {
    const execute = vi.fn<GraphQLExecute>(() =>
      Promise.resolve({ data: { ontologyClass: null } }),
    );
    await expect(assertBindingsLive(execute, [station, line])).rejects.toThrow(
      'binding "station"',
    );
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
