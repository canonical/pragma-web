// @vitest-environment node

/**
 * The CSS-import hook the native Express chain preloads: under a runtime
 * with `registerHooks` it stubs `.css` loads to an empty module and passes
 * every other load through; under one without (Bun) it registers nothing.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

type LoadHook = (
  url: string,
  context: unknown,
  nextLoad: (url: string, context: unknown) => unknown,
) => unknown;

afterEach(() => {
  vi.doUnmock("node:module");
  vi.resetModules();
});

/** Import the hook module over a stubbed `node:module`. */
const importWith = async (nodeModule: Record<string, unknown>) => {
  vi.resetModules();
  vi.doMock("node:module", () => nodeModule);
  await import("./nodeCssNoop.js");
};

describe("nodeCssNoop", () => {
  it("stubs CSS loads and passes every other load through", async () => {
    const registerHooks = vi.fn();
    await importWith({ registerHooks });
    expect(registerHooks).toHaveBeenCalledOnce();
    const hooks = registerHooks.mock.calls.at(0)?.at(0) as
      | { load: LoadHook }
      | undefined;
    if (hooks === undefined) throw new Error("no hooks registered");
    const { load } = hooks;

    const nextLoad = vi.fn(() => "next");
    expect(load("file:///app/styles.css", {}, nextLoad)).toEqual({
      format: "module",
      shortCircuit: true,
      source: expect.stringContaining("stubbed"),
    });
    expect(nextLoad).not.toHaveBeenCalled();

    const context = { format: "module" };
    expect(load("file:///app/entry.ts", context, nextLoad)).toBe("next");
    expect(nextLoad).toHaveBeenCalledWith("file:///app/entry.ts", context);
  });

  it("loads without registering where the runtime has no registerHooks", async () => {
    // Bun's `node:module` carries no `registerHooks`: the guard must skip the
    // call rather than throw at load.
    await expect(
      importWith({ registerHooks: undefined }),
    ).resolves.toBeUndefined();
  });
});
