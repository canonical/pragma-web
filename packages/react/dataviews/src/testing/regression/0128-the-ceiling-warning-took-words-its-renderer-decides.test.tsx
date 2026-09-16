/**
 * The render ceiling's warning took the renderer's name, the unit it counts
 * and which of three virtualization states it was in, though the name alone
 * decides the unit and whether there is an entry point to point to: a
 * caller could pair the table with cards, or the cards with an entry point
 * they do not have.
 *
 * It takes the renderer, the count and whether it virtualizes, and words
 * the rest from the renderer.
 */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { RENDER_CEILING } from "../../lib/hooks/constants.js";
import type { UseRenderCeilingProps } from "../../lib/hooks/types.js";
import useRenderCeiling from "../../lib/hooks/useRenderCeiling.js";

const Renderer = (props: UseRenderCeilingProps) => {
  useRenderCeiling(props);
  return null;
};

describe("the render ceiling's warning", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("words the unit and the remedy from the renderer alone", () => {
    expectTypeOf<UseRenderCeilingProps>().not.toHaveProperty("unit");
    expectTypeOf<UseRenderCeilingProps>().not.toHaveProperty("virtualization");
    const warned = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Renderer
          renderer="DataTable"
          count={RENDER_CEILING + 1}
          virtualized={false}
        />
        <Renderer
          renderer="Cards"
          count={RENDER_CEILING + 1}
          virtualized={false}
        />
      </>,
    );
    const [table, cards] = warned.mock.calls.map((call) => String(call.at(0)));
    expect(table).toMatch(
      /^DataTable renders 501 rows at once.*virtualizeRows/,
    );
    expect(cards).toMatch(
      /^Cards renders 501 cards at once.*no virtualization to opt into/,
    );
  });
});
