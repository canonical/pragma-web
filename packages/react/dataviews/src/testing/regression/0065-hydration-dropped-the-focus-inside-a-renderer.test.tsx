/**
 * Without scripting the renderer switch once drew every renderer, so a
 * reader could be inside the second when scripts took over. Hydration kept
 * the first and removed the rest, taking the focused control with them and
 * leaving focus on the document. The switch now draws the first renderer
 * alone before scripts (regression 0127), so a reader can only be inside
 * the renderer hydration keeps, and the focus stays where it was.
 */

import { act, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import type { RendererChoice } from "../../lib/common/RendererSwitch/index.js";
import { RendererSwitch } from "../../lib/common/RendererSwitch/index.js";

const renderers: readonly RendererChoice[] = [
  {
    id: "table",
    label: "Table",
    content: <button type="button">in the table</button>,
  },
  {
    id: "cards",
    label: "Cards",
    content: <button type="button">in the cards</button>,
  },
];

const tree = <RendererSwitch label="Show machines as" renderers={renderers} />;

describe("hydrating a renderer switch a reader is inside", () => {
  it("keeps the renderer holding the focus, and the focus with it", async () => {
    const errors = vi.spyOn(console, "error");
    onTestFinished(() => {
      errors.mockRestore();
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    // What a reader without scripting can do: the drawn renderer's control
    // takes the focus before hydration. The other is not drawn to reach.
    expect(screen.queryByText("in the cards")).toBeNull();
    const inTheTable = screen.getByText("in the table");
    inTheTable.focus();
    expect(document.activeElement).toBe(inTheTable);

    await act(async () => {
      const root = hydrateRoot(container, tree);
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(errors).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Table", pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("in the table")).toBe(document.activeElement);
    expect(screen.queryByText("in the cards")).toBeNull();
  });
});
