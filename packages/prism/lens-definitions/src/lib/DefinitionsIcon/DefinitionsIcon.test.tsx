import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DefinitionsIcon from "./DefinitionsIcon.js";

describe("DefinitionsIcon", () => {
  it("draws a decorative 16-unit glyph, 16 pixels square by default", () => {
    const { container } = render(<DefinitionsIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("renders at the size it is given", () => {
    const { container } = render(<DefinitionsIcon size={24} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("passes native props through, and stays hidden from assistive tech", () => {
    const { container } = render(
      <DefinitionsIcon aria-hidden={false} className="glyph" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("glyph");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
