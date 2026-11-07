import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import grid from "./grid.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("grid", () => {
  it("wraps the story in the bare grid preset", () => {
    render(grid()(Story));
    expect(screen.getByTestId("story").closest(".grid")).toBeInTheDocument();
  });
});
