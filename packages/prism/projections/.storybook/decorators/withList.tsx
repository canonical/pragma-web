import type { ElementType } from "react";

/**
 * Storybook decorator that puts a list item in the list it belongs to: an
 * unstyled `<ul>` with no indent, so a row's text sits on the canvas's edge
 * as it sits on its list's column line in an index.
 *
 * @example
 * ```ts
 * decorators: [withList()]
 * ```
 */
const withList = () => (Story: ElementType) => (
  <ul style={{ listStyle: "none", margin: 0, paddingInlineStart: 0 }}>
    <Story />
  </ul>
);

export default withList;
