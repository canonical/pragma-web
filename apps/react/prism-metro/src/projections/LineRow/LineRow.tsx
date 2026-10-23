import { NodeRow } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import type { LineRowProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds line-row";

/**
 * The row of a line: the `Node` projection's row, marked as a line so the
 * site's stylesheet sets each line apart from the next.
 *
 * It is a site arm: the row map renders it for lines, over the `Node`
 * projection's key, and hands it the node's typename. It renders no root of
 * its own: `NodeRow` renders the `<li>`, and every prop but the class names
 * reaches it unchanged.
 *
 * `import { LineRow } from "./LineRow/index.js";`
 */
export default function LineRow({
  className,
  typename: _typename,
  ...props
}: LineRowProps): ReactElement {
  return (
    <NodeRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
