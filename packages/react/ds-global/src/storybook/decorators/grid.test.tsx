import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("grid", () => {
  // Fails until grid moves to its own module.
  it.fails("wraps the story in the bare grid preset", async () => {
    // A computed path, so the bundler does not resolve the missing module.
    const modulePath = "./grid.js";
    const { default: grid } = await import(/* @vite-ignore */ modulePath);
    render(grid()(Story));
    expect(screen.getByTestId("story").closest(".grid")).toBeInTheDocument();
  });
});
