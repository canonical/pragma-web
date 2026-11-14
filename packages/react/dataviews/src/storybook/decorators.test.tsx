import type { Decorator } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { withAppScope, withFrame, withScrollingFrame } from "./decorators.js";

/** The story every decorator wraps. */
const Story = () => <p>Story</p>;

/** What a decorator receives beside the story; none of them reads it. */
const CONTEXT = {} as Parameters<Decorator>[1];

/** Render the story through the decorator, answering its wrapper. */
const renderDecorated = (decorator: Decorator): HTMLElement | null => {
  render(decorator(Story, CONTEXT));
  return screen.getByText("Story").parentElement;
};

describe("withAppScope", () => {
  it("renders the story inside the app scope", () => {
    expect(renderDecorated(withAppScope)).toHaveClass("app");
  });
});

describe("withFrame", () => {
  it("renders the story inside a frame of the given width", () => {
    // The frame is read as declared: a computed style resolves rem.
    expect(renderDecorated(withFrame("40rem"))?.style.maxWidth).toBe("40rem");
  });
});

describe("withScrollingFrame", () => {
  it("renders the story inside a frame of the given height that scrolls", () => {
    const frame = renderDecorated(withScrollingFrame("20rem"));
    expect(frame?.style.maxHeight).toBe("20rem");
    expect(frame?.style.overflow).toBe("auto");
  });
});
