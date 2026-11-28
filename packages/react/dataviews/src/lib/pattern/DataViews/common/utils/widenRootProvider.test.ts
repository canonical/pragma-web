import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../testing/index.js";
import widenRootProvider from "./widenRootProvider.js";

describe("widenRootProvider", () => {
  it("hands back the same provider", () => {
    const { provider } = createMachineProvider();
    expect(widenRootProvider(provider)).toBe(provider);
  });
});
