import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModeStrip } from "#lib/ModeStrip";
import { CANVAS_ELEMENT_ID } from "./constants.js";
import LensLayout from "./LensLayout.js";

/** The layout with a stub rail and colophon around `children`. */
const renderLayout = (children = <p>Canvas content</p>, className?: string) =>
  render(
    <LensLayout
      className={className}
      footer={<p>The colophon</p>}
      rail={<nav aria-label="Primary" data-region="primary-nav" />}
      strip={<ModeStrip context={<span>The context</span>} />}
    >
      {children}
    </LensLayout>,
  );

describe("LensLayout", () => {
  it("renders the regions in order: skip link, rail, strip, canvas, footer", () => {
    const { container } = renderLayout();
    const regions = [
      ...container.querySelectorAll("a.skip, [data-region]"),
    ].map((node) =>
      node instanceof HTMLAnchorElement
        ? "skip"
        : node.getAttribute("data-region"),
    );
    expect(regions).toEqual([
      "skip",
      "primary-nav",
      "mode-strip",
      "canvas",
      "footer",
    ]);
  });

  it("renders the routed page in the canvas, and nowhere else", () => {
    renderLayout();
    const canvas = screen.getByRole("main");
    expect(canvas.id).toBe(CANVAS_ELEMENT_ID);
    expect(canvas.dataset.region).toBe("canvas");
    expect(canvas.contains(screen.getByText("Canvas content"))).toBe(true);
  });

  it("renders each slot what it is given", () => {
    renderLayout();
    expect(document.querySelector('[data-slot="context"]')?.textContent).toBe(
      "The context",
    );
    expect(document.querySelector('[data-region="footer"]')?.textContent).toBe(
      "The colophon",
    );
  });

  it("offers a skip link targeting the canvas", () => {
    renderLayout();
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", `#${CANVAS_ELEMENT_ID}`);
  });

  it("merges a consumer className after its own", () => {
    const { container } = renderLayout(<p>Content</p>, "is-wide");
    expect(container.firstElementChild?.className).toBe(
      "ds lens-layout is-wide",
    );
  });
});
