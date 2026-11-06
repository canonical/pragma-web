import type { LinkComponentProps } from "@canonical/react-ds-global";
import { useRouter } from "@canonical/router-react";
import type { MouseEvent, ReactElement } from "react";

function hasModifierKey(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * The link component handed to design-system components that render their
 * own links (`SideNavigation`, `Breadcrumbs`) through a `LinkComponent` prop.
 *
 * Those components pass a plain `href`, while the router navigates by route
 * name, so the URL is matched back to a route on click: a URL this app routes
 * is navigated client-side, and anything else — an external URL, a modified
 * or middle click — is left to the browser. `aria-current` is forwarded as
 * given, because the design-system component owns the active state.
 *
 * `import { RouterLink } from "#lib/index.js";`
 */
export default function RouterLink({
  href,
  className,
  children,
  "aria-current": ariaCurrent,
}: LinkComponentProps): ReactElement {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      href === undefined ||
      event.defaultPrevented ||
      event.button !== 0 ||
      hasModifierKey(event)
    ) {
      return;
    }

    const match = router.match(href);

    if (match?.kind !== "route") {
      return;
    }

    event.preventDefault();
    // The match carries a name and arguments the router produced itself, so
    // they satisfy `navigate` by construction; the registered route map's
    // per-name argument types cannot be recovered from a runtime string.
    router.navigate(
      match.name as never,
      { params: match.params, search: match.search } as never,
    );
  }

  return (
    <a
      aria-current={ariaCurrent}
      className={className}
      href={href}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
