import type { Decorator } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

/** The story a decorator wraps unless the caller gives one. */
const OneLineStory = (): ReactElement => <p>Story</p>;

/** What a decorator receives beside the story; none of them reads it. */
const CONTEXT = {} as Parameters<Decorator>[1];

/**
 * Render a story through the decorator, a one-line story by default,
 * answering the element that holds the text "Story".
 *
 * @note Impure: renders into the document.
 */
export default function renderDecorated(
  decorator: Decorator,
  Story: () => ReactElement = OneLineStory,
): HTMLElement | null {
  render(decorator(Story, CONTEXT));
  return screen.queryByText("Story")?.parentElement ?? null;
}
