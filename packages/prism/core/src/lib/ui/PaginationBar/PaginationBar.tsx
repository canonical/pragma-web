// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ReactElement } from "react";
import { useMessages } from "../../i18n/index.js";
import { RouterLink } from "../RouterLink/index.js";
import type { PaginationBarProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds pagination-bar";

/**
 * The pagination bar of an index that pages: a link to the previous page
 * when there is one, the page's position, and a link to the next page when
 * there is one. Plain links through the router, so the bar pages without
 * scripting too.
 *
 * `import { PaginationBar } from "@canonical/prism-core";`
 *
 * @implements prism.component.pagination_bar
 */
export default function PaginationBar({
  previousHref,
  nextHref,
  label,
  className,
  ...props
}: PaginationBarProps): ReactElement {
  const t = useMessages();
  return (
    <nav
      aria-label={t("pagination.label")}
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {previousHref !== undefined && (
        <RouterLink className="previous" href={previousHref} rel="prev">
          {t("pagination.previous")}
        </RouterLink>
      )}
      <span className="position">{label}</span>
      {nextHref !== undefined && (
        <RouterLink className="next" href={nextHref} rel="next">
          {t("pagination.next")}
        </RouterLink>
      )}
    </nav>
  );
}
