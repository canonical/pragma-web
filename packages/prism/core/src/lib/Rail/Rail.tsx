import type { RouteMap } from "@canonical/router-core";
import { Link } from "@canonical/router-react";
import type React from "react";
import type { RailProps } from "./types.js";
import { useLensShortcuts } from "./useLensShortcuts.js";
import "./styles.css";

const componentCssClassName = "ds rail";

/**
 * The primary rail — the west column a lens layout renders. Top to bottom:
 * the brand (dot + wordmark, linking to `brand.to`) · the lens entries (icon
 * + label + displayed keyboard hint) · spacer · `children`, the site's
 * utility cluster (the destinations that are not lenses, kept out of the
 * switcher).
 *
 * The entries are whatever the caller passes, in the order given — a site
 * collects them off its route table with `collectLenses`, so a lens appears
 * here because its index route declares it. Each entry links to its route
 * by name. Active state is the router's own `aria-current="page"` (exact
 * pathname match), styled from the attribute.
 *
 * The digit hints are wired for real (`useLensShortcuts`, an ephemeral
 * document listener) and displayed as `kbd` + `aria-keyshortcuts`. The digit
 * itself is read from the route's own allocation: the rail DISPLAYS it, it
 * does not own it — so a lens that allocates no key simply renders no
 * `kbd`, and the shown digit is the wired digit by construction.
 *
 * The utility cluster is the site's markup; the stylesheet styles this
 * contract: a `p.rail-util-label` heading with an id, a
 * `ul.rail-utilities` labelled by it, `li > a.rail-item.rail-util` links
 * holding an icon and a `span.rail-label`, and an `li.rail-theme` for a
 * control such as `ThemeSelector`. In the collapsed rail the heading and
 * the labels hide visually and stay in the accessibility tree.
 *
 * The links are typed `Link<RouteMap, string>`: an entry's route name is a
 * plain string, and every entry is a parameterless index route because
 * `collectLenses` throws on one that takes params.
 *
 * `import { Rail } from "@canonical/prism-core";`
 */
const Rail = ({
  entries,
  brand,
  children,
  className,
  ...props
}: RailProps): React.ReactElement => {
  // Widened to `string` keys: an entry names its route with a plain string.
  const byRoute: ReadonlyMap<string, string> = useLensShortcuts().byRoute;

  return (
    <nav
      {...props}
      aria-label="Primary"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-region="primary-nav"
    >
      <Link<RouteMap, string> className="rail-brand" to={brand.to}>
        <span aria-hidden="true" className="rail-brand-dot" />
        <span className="rail-brand-word">
          {brand.label}
          {brand.caption === undefined ? null : <small>{brand.caption}</small>}
        </span>
      </Link>

      <ul className="rail-lenses">
        {entries.map(({ name, label, icon: Icon }) => {
          const hint = byRoute.get(name);
          return (
            <li key={name}>
              {/* aria-label pins the accessible name to the lens name alone:
                  the displayed kbd digit stays out of it (the shortcut
                  reaches AT through aria-keyshortcuts instead). title gives
                  the collapsed icon-only entry a pointer-hover affordance. */}
              <Link<RouteMap, string>
                aria-keyshortcuts={hint}
                aria-label={label}
                className="rail-item"
                title={label}
                to={name}
              >
                <Icon />
                <span className="rail-label">{label}</span>
                {hint === undefined ? null : (
                  <kbd className="rail-kbd">{hint}</kbd>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div aria-hidden="true" className="rail-spacer" />

      {children}
    </nav>
  );
};

export default Rail;
