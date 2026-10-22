import type { LinkComponentProps } from "@canonical/react-ds-global";
import type { AnyRoute, RouteMap } from "@canonical/router-core";
import { useRouter } from "@canonical/router-react";
import type { MouseEvent, ReactElement } from "react";

/** Whether a click asks the browser for something other than following. */
const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  event.button !== 0 ||
  event.altKey ||
  event.ctrlKey ||
  event.metaKey ||
  event.shiftKey;

/**
 * The site's router link adapter for components that hand it an `href`
 * (the entity projections, through `ProjectionsProvider`). It renders the
 * anchor its caller asked for, the same markup on the server and the
 * client, and resolves the href against the route table only when the
 * reader acts on it: a plain click on an href a route matches navigates on
 * the client, and hovering it warms the destination, as router-react's
 * `Link` does. Any other href, and any modified click, stays the
 * browser's.
 *
 * The navigation is rebuilt from the match, so it keeps the hash and the
 * query the matched route declares. A site's homes build their hrefs from
 * the same route table, so theirs navigate to exactly where they point.
 *
 * `import { RouterLink } from "#lib/RouterLink";`
 */
export default function RouterLink({
  href,
  className,
  children,
  "aria-current": ariaCurrent,
}: LinkComponentProps): ReactElement {
  const router = useRouter<RouteMap, AnyRoute>();

  /** The intent `href` resolves to, or `null` where no route matches it. */
  const resolveIntent = () => {
    const match = href === undefined ? null : router.match(href);
    if (match?.kind !== "route") {
      return null;
    }
    return {
      name: match.name,
      options: {
        params: match.params,
        search: match.search,
        hash: match.url.hash,
      },
    };
  };

  return (
    <a
      aria-current={ariaCurrent}
      className={className}
      href={href}
      onClick={(event) => {
        if (isModifiedClick(event)) {
          return;
        }
        const intent = resolveIntent();
        if (intent === null) {
          return;
        }
        event.preventDefault();
        router.navigate(intent.name, intent.options);
      }}
      onMouseEnter={() => {
        const intent = resolveIntent();
        if (intent !== null) {
          void router.warm(intent.name, intent.options);
        }
      }}
    >
      {children}
    </a>
  );
}
