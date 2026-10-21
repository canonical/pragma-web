import type { ReactElement } from "react";
import type { SiteColophonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds site-colophon";

/**
 * The docs site's colophon: the footer band a lens layout renders below its
 * canvas, carrying the site's one-line statement.
 *
 * `import { SiteColophon } from "#lib/SiteColophon";`
 */
export default function SiteColophon({
  className,
  ...props
}: SiteColophonProps): ReactElement {
  return (
    <footer
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-region="footer"
    >
      <p className="statement">
        Pragma — the design system, documented from its knowledge graph.
      </p>
    </footer>
  );
}
