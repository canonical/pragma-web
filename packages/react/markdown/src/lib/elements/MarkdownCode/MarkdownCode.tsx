import { InlineCode } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import type { MarkdownElementProps } from "../../types.js";

/**
 * Render Markdown code as the design-system inline code. A fenced block's
 * `language-*` class is merged into the element's classes.
 */
export default function MarkdownCode({
  node: _node,
  ...props
}: MarkdownElementProps<"code">): ReactElement {
  return <InlineCode {...props} />;
}
