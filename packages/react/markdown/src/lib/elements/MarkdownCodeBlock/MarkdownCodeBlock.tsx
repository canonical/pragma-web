import type { ReactElement } from "react";
import type { MarkdownElementProps } from "../../types.js";
import "./styles.css";

const componentCssClassName = "ds markdown-code-block";

/**
 * Render a fenced Markdown code block: a scrollable, monospace `<pre>` on the
 * code surface, around the block's `<code>`.
 */
export default function MarkdownCodeBlock({
  node: _node,
  className,
  ...props
}: MarkdownElementProps<"pre">): ReactElement {
  return (
    <pre
      className={[componentCssClassName, "p", "code", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
