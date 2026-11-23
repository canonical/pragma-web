import type { Args, Decorator } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

/** The story a decorator wraps unless the caller gives one. */
const OneLineStory = (): ReactElement => <p>Story</p>;

/**
 * Render a story through the decorator, a one-line story by default, with
 * the story's args, none by default, answering the element that holds the
 * text "Story".
 *
 * @note Impure: renders into the document.
 */
export default function renderDecorated(
  decorator: Decorator,
  Story: () => ReactElement = OneLineStory,
  args: Args = {},
): HTMLElement | null {
  // A decorator reads no more of its context than the story's args.
  render(decorator(Story, { args } as Parameters<Decorator>[1]));
  return screen.queryByText("Story")?.parentElement ?? null;
}
