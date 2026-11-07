import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import rtl from "./rtl.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("rtl", () => {
  it("wraps the story in dir=rtl", () => {
    render(rtl()(Story));
    expect(screen.getByTestId("story").closest("[dir]")).toHaveAttribute(
      "dir",
      "rtl",
    );
  });
});
