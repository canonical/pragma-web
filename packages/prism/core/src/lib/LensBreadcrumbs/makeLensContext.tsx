import { useRouterState } from "@canonical/router-react";
import type React from "react";
import LensBreadcrumbs from "./LensBreadcrumbs.js";

/**
 * Build a lens's mode-strip `Context` tenant: the breadcrumb trail to the
 * current page, which the lens's layout renders into the strip's `context`
 * socket.
 *
 * One factory serves every lens: one component, parameterised, not one
 * near-identical copy per lens. It reads the CURRENT route param — the
 * entity/term/reading identity — straight off the router match, so the
 * terminal crumb is URL-derived: no Relay query, no fetch, no suspension of
 * the layout, and byte-identical markup on the server and the client (the
 * SSR-determinism the strip's tenants must honour).
 *
 * - `lensLabel` / `lensRouteName`: the constant first crumb (the lens name,
 *   and the index route the back-link points at).
 * - `paramKey`: the route param naming the current entity (`uri`, `term`,
 *   `job`). Absent on the lens index — then the trail is the single lens
 *   crumb, marked current. When present, its raw value (a prefixed URI or
 *   slug, percent-decoded by the router codec) is the terminal crumb text:
 *   the honest identity the URL already carries, not a fetched display name.
 *
 * A lens with one address (a home page) takes no `paramKey`: it has one
 * crumb.
 *
 * @param options - The lens's label, its index route's name, and the route
 *   param naming the current entity.
 * @returns The `Context` component for the lens's strip.
 */
export const makeLensContext = ({
  lensLabel,
  lensRouteName,
  paramKey,
}: {
  readonly lensLabel: string;
  readonly lensRouteName: string;
  readonly paramKey?: string;
}): (() => React.ReactElement) => {
  const LensContext = (): React.ReactElement => {
    const { match } = useRouterState();
    const params: Readonly<Record<string, unknown>> =
      match?.kind === "route" ? match.params : {};
    const raw = paramKey === undefined ? undefined : params[paramKey];
    const current = typeof raw === "string" && raw.length > 0 ? raw : undefined;

    return (
      <LensBreadcrumbs
        current={current}
        lensLabel={lensLabel}
        lensRouteName={lensRouteName}
      />
    );
  };
  return LensContext;
};
