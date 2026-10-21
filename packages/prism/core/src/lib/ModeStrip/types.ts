import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The lens's context region, west slot: typically the breadcrumb trail
   * to the current page (`LensBreadcrumbs`). A ReactNode rather than a bare
   * string, because the socket holds navigation markup that carries the page
   * title, not a label. Empty until a layout claims it. */
  readonly context?: ReactNode;
  /** The lens's controls region content: its filters and toggles. */
  readonly controls?: ReactNode;
  /** The lens's status region content: its readouts. */
  readonly status?: ReactNode;
};

/**
 * Props accepted by `ModeStrip`: its three sockets, and the native props of
 * its `<header>` root.
 *
 * `children` is excluded: the strip's content is its three sockets, so a
 * free child would have no socket to land in.
 */
export type ModeStripProps = OwnProps &
  Omit<ComponentProps<"header">, keyof OwnProps | "children">;
