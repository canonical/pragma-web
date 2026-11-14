import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import withGrid from "./withGrid.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("withGrid", () => {
  it("wraps the story in the bare grid preset", () => {
    render(withGrid()(Story));
    expect(screen.getByTestId("story").closest(".grid")).toBeInTheDocument();
  });
});
