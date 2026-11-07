import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("rtl", () => {
  // Fails until rtl moves to its own module.
  it.fails("wraps the story in dir=rtl", async () => {
    // A computed path, so the bundler does not resolve the missing module.
    const modulePath = "./rtl.js";
    const { default: rtl } = await import(/* @vite-ignore */ modulePath);
    render(rtl()(Story));
    expect(screen.getByTestId("story").closest("[dir]")).toHaveAttribute(
      "dir",
      "rtl",
    );
  });
});
