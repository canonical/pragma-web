import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("surface", () => {
  // Fails until surface moves to its own module.
  it.fails("paints the story on one padded surface", async () => {
    // A computed path, so the bundler does not resolve the missing module.
    const modulePath = "./surface.js";
    const { default: surface } = await import(/* @vite-ignore */ modulePath);
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
