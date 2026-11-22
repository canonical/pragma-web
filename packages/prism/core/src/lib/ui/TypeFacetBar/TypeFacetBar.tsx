// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ReactElement } from "react";
import { useMessages } from "../../i18n/index.js";
import { RouterLink } from "../RouterLink/index.js";
import type { TypeFacetBarProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds type-facet-bar";

/**
 * The Type facet of an index of mixed types, the content of the facet bar
 * under the strip and of the filter sheet: its name, then each type with
 * its count. A type with results is a link applying it; the applied one is
 * marked current, drawn bold, and its link releases it. A type with none
 * is greyed and is not a link. An applied type closes the facet with its
 * chip, a link that releases it. The facet is named by `aria-label`, not
 * an id, so the bar and the sheet can both hold it.
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
  const name = label ?? t("facet.type");
  const applied = facets.find((facet) => facet.selected);
  return (
    <nav
      aria-label={name}
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span aria-hidden="true" className="label">
        {name}
      </span>
      <ul className="values">
        {facets.map((facet) =>
          facet.count === 0 ? (
            <li className="value zero" key={facet.id}>
              <span className="name">{facet.label}</span>{" "}
              <span className="count">{facet.count}</span>
            </li>
          ) : (
            <li
              className={facet.selected ? "value current" : "value"}
              key={facet.id}
            >
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
      {applied === undefined ? null : (
        <RouterLink
          aria-label={t("facet.release", {
            facet: name,
            value: applied.label,
          })}
          className="chip"
          href={applied.href}
        >
          {t("facet.chip", { facet: name, value: applied.label })}
        </RouterLink>
      )}
    </nav>
  );
}
