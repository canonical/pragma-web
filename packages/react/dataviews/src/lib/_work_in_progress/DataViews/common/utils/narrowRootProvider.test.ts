/**
 * The crossing between a root's context and its caller's types changes no
 * value: the provider comes back as the very object stored.
 */
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../testing/machines.js";
import narrowRootProvider from "./narrowRootProvider.js";
import widenRootProvider from "./widenRootProvider.js";

describe("narrowRootProvider", () => {
  it("answers the stored provider it is handed", () => {
    const { provider } = createMachineProvider();
    expect(narrowRootProvider(widenRootProvider(provider))).toBe(provider);
  });
});
