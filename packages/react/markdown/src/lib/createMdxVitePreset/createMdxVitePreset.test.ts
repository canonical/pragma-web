import { describe, expect, it } from "vitest";
import createMdxVitePreset from "./createMdxVitePreset.js";

const SOURCE = "# Title\n\nSome *emphasis*.";

/** Run the preset's transform hook on `SOURCE` imported as `id`. */
const transformSource = (id: string): Promise<unknown> => {
  const { transform } = createMdxVitePreset();
  if (typeof transform !== "function") {
    throw new Error("The MDX plugin's transform hook is not a function");
  }
  return Promise.resolve(Reflect.apply(transform, undefined, [SOURCE, id]));
};

describe("createMdxVitePreset", () => {
  it("creates the MDX plugin, ordered before the other plugins", () => {
    const plugin = createMdxVitePreset();

    expect(plugin.name).toBe("@mdx-js/rollup");
    expect(plugin.enforce).toBe("pre");
  });

  it("compiles an .mdx file against the package's components map", async () => {
    const result = await transformSource("/app/page.mdx");

    expect(result).toMatchObject({
      code: expect.stringContaining('from "@canonical/react-markdown/mdx"'),
    });
  });

  it.each(["/app/notes.md", "/app/notes.md?raw"])(
    "leaves %s to the rest of the build",
    async (id) => {
      expect(await transformSource(id)).toBeUndefined();
    },
  );
});
