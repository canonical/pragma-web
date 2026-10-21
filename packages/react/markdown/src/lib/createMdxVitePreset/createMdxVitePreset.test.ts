import { describe, expect, it } from "vitest";
import createMdxVitePreset from "./createMdxVitePreset.js";

describe("createMdxVitePreset", () => {
  it("creates the MDX plugin, ordered before the other plugins", () => {
    const plugin = createMdxVitePreset();

    expect(plugin.name).toBe("@mdx-js/rollup");
    expect(plugin.enforce).toBe("pre");
  });
});
