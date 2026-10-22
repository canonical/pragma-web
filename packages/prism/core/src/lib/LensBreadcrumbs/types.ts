import type { ComponentProps } from "react";

type OwnProps = {
  /** The lens's own name — the trail's first (and, on an index page, only)
   * crumb, matching how the lens's declaration labels it. */
  readonly lensLabel: string;
  /** The name of the lens's index route, the crumb the back-link points
   * at. On an index page the same crumb is the terminal one and renders as
   * text. It must name a route taking no params. */
  readonly lensRouteName: string;
  /** The current entity/term/reading page's crumb text — the URL-derived
   * identity (the route param: a prefixed URI or slug). Absent on the lens
   * index, where the lens crumb IS the current page. */
  readonly current?: string;
};

/**
 * Props accepted by `LensBreadcrumbs`: the lens and the current page the
 * trail runs between, and the native props of its `<nav>` root.
 *
 * The native `children` is excluded because the trail renders its own
 * crumbs.
 */
export type LensBreadcrumbsProps = OwnProps &
  Omit<ComponentProps<"nav">, keyof OwnProps | "children">;

/**
 * Props accepted by the `Context` component `makeLensContext` builds: the
 * lens crumb's text, given at render time so a layout can read it through
 * the catalog in scope for the request.
 */
export type LensContextProps = Pick<OwnProps, "lensLabel">;
