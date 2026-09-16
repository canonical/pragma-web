/**
 * The render ceiling's warning is shared by every renderer that draws its
 * whole window, and it counted what it drew as rows whatever the renderer:
 * the cards warned of rows they do not have.
 *
 * Each renderer names what it draws.
 */
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";

describe("the cards past the render ceiling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warn of cards", () => {
    const warned = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = Array.from({ length: 501 }, (_, index) =>
      machine(`m-${index}`, `host-${index}`),
    );
    const { provider } = createMachineProvider({ rows });
    render(
      <Cards
        provider={provider}
        fields={[{ id: "name", header: "Name" }]}
        title="name"
        label="Machines"
      />,
    );
    expect(warned.mock.calls.at(0)?.at(0)).toMatch(
      /^Cards renders 501 cards at once/,
    );
  });
});
