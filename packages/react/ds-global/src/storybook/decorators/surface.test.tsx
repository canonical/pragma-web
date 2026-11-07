import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import surface from "./surface.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("surface", () => {
  it("paints the story on one padded surface", () => {
    const { container } = render(surface()(Story));
    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInstanceOf(HTMLElement);
    if (!(wrapper instanceof HTMLElement)) return;
    expect(wrapper).toHaveClass("surface");
    expect(wrapper.style.background).toBe("var(--surface-color-background)");
    expect(wrapper.style.color).toBe("var(--surface-color-text)");
    expect(wrapper.style.padding).toBe("var(--dimension-300, 24px)");
    expect(screen.getByTestId("story").closest(".surface")).toBe(wrapper);
  });
});
