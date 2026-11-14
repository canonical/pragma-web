import type React from "react";
import { Children, isValidElement } from "react";
import type { QueryChipsProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chips";

/**
 * QueryChips is the set of clauses that narrow a collection, each shown as
 * one query chip. It lays the chips out in a wrapping row and gives the set
 * one accessible name. It serves the filters and search of a query bar, the
 * conditions of a saved view and the matchers of a rule. It holds query
 * chips and nothing else.
 *
 * `import { QueryChips } from "@canonical/react-ds-global";`
 *
 * @implements ds:global_dataviews.group.query_chips
 */
const QueryChips = ({
  label,
  children,
  className,
  ...props
}: QueryChipsProps): React.ReactElement => (
  <ul
    {...props}
    // biome-ignore lint/a11y/noRedundantRoles: some browsers drop a list's semantics once its bullets are removed; the explicit role keeps them
    role="list"
    aria-label={label}
    className={[componentCssClassName, className].filter(Boolean).join(" ")}
  >
    {Children.toArray(children).map((child, index) => (
      // Children.toArray keys every element; text children keep their place.
      <li key={isValidElement(child) ? String(child.key) : index}>{child}</li>
    ))}
  </ul>
);

export default QueryChips;
