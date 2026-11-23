import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import withRtl from "./withRtl.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("withRtl", () => {
  it("wraps the story in dir=rtl", () => {
    render(withRtl()(Story));
    expect(screen.getByTestId("story").closest("[dir]")).toHaveAttribute(
      "dir",
      "rtl",
    );
  });
});
