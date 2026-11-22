// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ReactElement } from "react";
import { useMessages } from "../../i18n/index.js";
import type { SearchResultGroupProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds search-result-group";

/**
 * One type's results on a search page: a heading naming the type and its
 * total (followed by "continued" when the group began on an earlier
 * page), then the rows the site renders for them, in rank order. The
 * section is named by its type.
 *
 * `import { SearchResultGroup } from "@canonical/prism-projections";`
 *
 * @implements prism.component.search_result_group
 */
export default function SearchResultGroup({
  title,
  count,
  continued = false,
  children,
  className,
  ...props
}: SearchResultGroupProps): ReactElement {
  const t = useMessages();
  return (
    <section
      aria-label={title}
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <h2 className="heading">
        <span className="title">{title}</span>{" "}
        <span className="count">
          {t(
            continued
              ? "searchResultGroup.continued"
              : "searchResultGroup.count",
            { count: String(count) },
          )}
        </span>
      </h2>
      <ol className="rows">{children}</ol>
    </section>
  );
}
