import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CANVAS_ELEMENT_ID } from "#lib/Canvas";
import CanvasSkipLink from "./CanvasSkipLink.js";

describe("CanvasSkipLink", () => {
  it("links the canvas by its id", () => {
    render(<CanvasSkipLink />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link.getAttribute("href")).toBe(`#${CANVAS_ELEMENT_ID}`);
  });

  it("passes native props through and merges a consumer className after its own", () => {
    render(<CanvasSkipLink className="is-quiet" id="skip" />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link.id).toBe("skip");
    expect(link.className).toBe("ds canvas-skip-link is-quiet");
  });
});
