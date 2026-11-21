// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ReactElement } from "react";
import { useMessages } from "../../i18n/index.js";
import { RouterLink } from "../RouterLink/index.js";
import type { TypeFacetBarProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds type-facet-bar";

/** The fixed id of the bar's label, which names its list of values. */
const LABEL_ID = "type-facet-bar-label";

/**
 * The Type facet of an index of mixed types, open as the band under the
 * strip: its name, then each type with its count. A type with results is
 * a link applying it, the applied one marked current; a type with none is
 * greyed and is not a link.
 *
 * `import { TypeFacetBar } from "@canonical/prism-core";`
 *
 * @implements prism.component.type_facet_bar
 */
export default function TypeFacetBar({
  facets,
  label,
  className,
  ...props
}: TypeFacetBarProps): ReactElement {
  const t = useMessages();
  return (
    <nav
      aria-labelledby={LABEL_ID}
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span className="label" id={LABEL_ID}>
        {label ?? t("facet.type")}
      </span>
      <ul className="values">
        {facets.map((facet) =>
          facet.count === 0 ? (
            <li className="value zero" key={facet.id}>
              <span className="name">{facet.label}</span>{" "}
              <span className="count">{facet.count}</span>
            </li>
          ) : (
            <li className="value" key={facet.id}>
              <RouterLink
                aria-current={facet.selected ? "true" : undefined}
                href={facet.href}
              >
                <span className="name">{facet.label}</span>{" "}
                <span className="count">{facet.count}</span>
              </RouterLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
