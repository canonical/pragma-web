import { defaultProjectionMaps } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import type { LineRowProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds line-row";

const NodeRow = defaultProjectionMaps.row.Node;

/**
 * The row of a line: the `Node` arm's row, its title and its compact
 * address, marked as a line so the site's stylesheet sets each line apart
 * from the next.
 *
 * It renders no root of its own: the `Node` arm renders the `<li>`, and
 * every prop but the class names reaches it unchanged.
 *
 * `import { LineRow } from "./LineRow/index.js";`
 */
export default function LineRow({
  className,
  ...props
}: LineRowProps): ReactElement {
  return (
    <NodeRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
