/**
 * The crossing between a root's context and its caller's types changes no
 * value: the provider comes back as the very object stored.
 */
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../testing/machines.js";
import widenRootProvider, * as module from "./widenRootProvider.js";

describe("widenRootProvider", () => {
  it("answers the provider it is handed", () => {
    const { provider } = createMachineProvider();
    expect(widenRootProvider(provider)).toBe(provider);
  });

  it("is its module's one export", () => {
    expect(Object.keys(module)).toEqual(["default"]);
  });
});
