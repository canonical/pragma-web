import type { ReactElement } from "react";
import type { PreviewHeadingProps } from "./types.js";

/**
 * A heading in the editor's preview, rendered as the `as` tag without the id
 * `Markdown` gives it. A page can show several previews at once, so their
 * headings carry no ids that could collide.
 */
export default function PreviewHeading({
  as: Tag,
  node: _node,
  id: _id,
  ...props
}: PreviewHeadingProps): ReactElement {
  return <Tag {...props} />;
}
