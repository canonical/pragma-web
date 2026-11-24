import type { ReactElement } from "react";
import type { FilterOptionsGridProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds filter-options-grid";

/**
 * A grid of filters, one per line: each filter's name in a fixed column on
 * the left, its words beside it, so the words of every filter start on one
 * edge. In a narrow container each name stacks above its words. It is
 * reached as **FilterOptions.Grid**.
 *
 * `import { FilterOptions } from "@canonical/dataviews-react";`
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function FilterOptionsGrid({
  children,
  className,
  ...props
}: FilterOptionsGridProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
