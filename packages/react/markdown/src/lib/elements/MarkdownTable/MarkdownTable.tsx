import type { ReactElement } from "react";
import type { MarkdownElementProps } from "../../types.js";
import "./styles.css";

const componentCssClassName = "ds markdown-table";

/**
 * Render a GitHub-flavoured Markdown table with the design system's cell
 * spacing and row dividers.
 */
export default function MarkdownTable({
  node: _node,
  className,
  ...props
}: MarkdownElementProps<"table">): ReactElement {
  return (
    <table
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
