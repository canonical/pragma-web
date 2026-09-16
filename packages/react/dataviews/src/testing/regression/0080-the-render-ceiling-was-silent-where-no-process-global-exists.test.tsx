/**
 * The render ceiling's warning began by asking whether a `process` global
 * exists and said nothing where none does. Bundlers replace the token
 * `process.env.NODE_ENV` with a literal and define no `process`, so in the
 * browser — the one place the warning is for — the guard returned early on
 * every render. The test passed because Vitest runs in Node.
 *
 * The read is the token bundlers replace, and a read that throws, because
 * nothing replaced it and no `process` exists, is development.
 */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RENDER_CEILING } from "../../lib/hooks/constants.js";
import useRenderCeiling from "../../lib/hooks/useRenderCeiling.js";

const Renderer = () => {
  useRenderCeiling({
    renderer: "DataTable",
    count: RENDER_CEILING + 1,
    unit: "rows",
    virtualization: "available",
  });
  return null;
};

describe("the render ceiling where no process global exists", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("warns as it does in development", () => {
    vi.stubGlobal("process", undefined);
    const warned = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Renderer />);
    expect(warned).toHaveBeenCalledTimes(1);
  });
});
