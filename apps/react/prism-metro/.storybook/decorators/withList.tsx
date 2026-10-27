import type { ElementType, ReactElement } from "react";

/**
 * Storybook decorator that puts a list item in the list it belongs to: an
 * unstyled `<ul>` with no indent, so a row's or a command result's `<li>`
 * root renders valid markup, its text on the canvas's edge as it sits on
 * its list's column line in an index.
 *
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withList(), withProjections(), withRouter()]
 * ```
 */
const withList =
  () =>
  (Story: ElementType): ReactElement => (
    <ul style={{ listStyle: "none", margin: 0, paddingInlineStart: 0 }}>
      <Story />
    </ul>
  );

export default withList;
