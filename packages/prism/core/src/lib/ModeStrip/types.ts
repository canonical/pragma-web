import type { HTMLAttributes, ReactNode } from "react";

/** Props accepted by `ModeStrip`: its three sockets, and the native props of
 * its `<header>` root. */
export interface ModeStripProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The lens's context region, west slot: typically the breadcrumb trail
   * to the current page (`LensBreadcrumbs`). A ReactNode rather than a bare
   * string, because the socket holds navigation markup that carries the page
   * title, not a label. Empty until a layout claims it. */
  context?: ReactNode;
  /** The lens's controls region content: its filters and toggles. */
  controls?: ReactNode;
  /** The lens's status region content: its readouts. */
  status?: ReactNode;
}
