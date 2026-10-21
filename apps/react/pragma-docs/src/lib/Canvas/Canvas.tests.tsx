import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Canvas from "./Canvas.js";
import { CANVAS_ELEMENT_ID } from "./constants.js";

describe("Canvas", () => {
  it("renders the routed page inside the page's one main region", () => {
    render(
      <Canvas>
        <p>Canvas content</p>
      </Canvas>,
    );
    const canvas = screen.getByRole("main");
    expect(canvas.dataset.region).toBe("canvas");
    expect(canvas.contains(screen.getByText("Canvas content"))).toBe(true);
  });

  it("is the skip link's target, focusable only by script", () => {
    render(<Canvas />);
    const canvas = screen.getByRole("main");
    expect(canvas.id).toBe(CANVAS_ELEMENT_ID);
    expect(canvas).toHaveAttribute("tabindex", "-1");
  });

  it("passes native props through and merges a consumer className after its own", () => {
    render(<Canvas aria-label="Page" className="is-wide" />);
    const canvas = screen.getByRole("main", { name: "Page" });
    expect(canvas.className).toBe("ds canvas is-wide");
  });
});
