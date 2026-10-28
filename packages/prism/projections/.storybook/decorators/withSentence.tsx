import type { ElementType } from "react";

/**
 * Storybook decorator that puts an inline mention in the running text it
 * belongs to: a paragraph that mentions it mid-sentence, so the story shows
 * the mention on the line of the prose around it.
 *
 * @example
 * ```ts
 * decorators: [withSentence()]
 * ```
 */
const withSentence = () => (Story: ElementType) => (
  <p>
    The page is built on <Story /> and nothing else.
  </p>
);

export default withSentence;
