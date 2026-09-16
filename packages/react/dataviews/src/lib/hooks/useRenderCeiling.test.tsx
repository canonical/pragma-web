/**
 * The development warning past the render ceiling: once per mount, naming
 * the renderer and the count, pointing to virtualization where there is one,
 * and silent in production, under the ceiling, and where rows are already
 * virtualized. It is a prompt: nothing about what renders changes.
 */
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RENDER_CEILING } from "./constants.js";
import type { UseRenderCeilingProps } from "./types.js";
import useRenderCeiling from "./useRenderCeiling.js";

const Renderer = (props: UseRenderCeilingProps) => {
  useRenderCeiling(props);
  return null;
};

const warn = () => vi.spyOn(console, "warn").mockImplementation(() => {});

describe("useRenderCeiling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("warns once, past the ceiling, naming the renderer, the count and the entry point", () => {
    const warned = warn();
    const { rerender } = render(
      <Renderer
        renderer="DataTable"
        unit="rows"
        count={RENDER_CEILING + 1}
        virtualization="available"
      />,
    );
    expect(warned).toHaveBeenCalledTimes(1);
    expect(warned.mock.calls.at(0)?.at(0)).toBe(
      "DataTable renders 501 rows at once, past the 500 the package warns at. Measure it, and consider `virtualizeRows` from `@canonical/dataviews-react/virtualization`, which mounts only the rows in view. Every one is still rendered.",
    );
    rerender(
      <Renderer
        renderer="DataTable"
        unit="rows"
        count={RENDER_CEILING + 700}
        virtualization="available"
      />,
    );
    expect(warned).toHaveBeenCalledTimes(1);
  });

  it("says a renderer without virtualization has none to opt into, grouping the count", () => {
    const warned = warn();
    render(
      <Renderer
        renderer="Cards"
        unit="cards"
        count={1200}
        virtualization="none"
      />,
    );
    expect(warned.mock.calls.at(0)?.at(0)).toBe(
      "Cards renders 1,200 cards at once, past the 500 the package warns at. Measure it: this renderer has no virtualization to opt into. Every one is still rendered.",
    );
  });

  it("says nothing at the ceiling, nor where rows are virtualized", () => {
    const warned = warn();
    render(
      <Renderer
        renderer="DataTable"
        unit="rows"
        count={RENDER_CEILING}
        virtualization="available"
      />,
    );
    render(
      <Renderer
        renderer="DataTable"
        unit="rows"
        count={10_000}
        virtualization="in-use"
      />,
    );
    expect(warned).not.toHaveBeenCalled();
  });

  it("says nothing in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warned = warn();
    render(
      <Renderer
        renderer="Cards"
        unit="cards"
        count={10_000}
        virtualization="none"
      />,
    );
    expect(warned).not.toHaveBeenCalled();
  });
});
