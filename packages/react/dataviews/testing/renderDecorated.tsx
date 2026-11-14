import type { Decorator } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";

/** The story a decorator wraps. */
const Story = () => <p>Story</p>;

/** What a decorator receives beside the story; none of them reads it. */
const CONTEXT = {} as Parameters<Decorator>[1];

/**
 * Render a one-line story through the decorator, answering its wrapper.
 *
 * @note Impure: renders into the document.
 */
export default function renderDecorated(
  decorator: Decorator,
): HTMLElement | null {
  render(decorator(Story, CONTEXT));
  return screen.getByText("Story").parentElement;
}
