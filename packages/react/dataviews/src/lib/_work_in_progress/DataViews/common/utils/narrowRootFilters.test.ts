/**
 * The crossing between a root's context and its caller's types changes no
 * value: the handles come back as the very object stored.
 */
import {
  createFilterInputs,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../testing/machines.js";
import narrowRootFilters, * as module from "./narrowRootFilters.js";

describe("narrowRootFilters", () => {
  it("answers the handles it is handed", () => {
    const { provider } = createMachineProvider();
    const { handles } = createFilterInputs({
      host: readProviderHost(provider),
    });
    expect(narrowRootFilters(handles)).toBe(handles);
  });

  it("is its module's one export", () => {
    expect(Object.keys(module)).toEqual(["default"]);
  });
});
