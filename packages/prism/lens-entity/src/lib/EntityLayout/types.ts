import type { EntityBinding } from "@canonical/prism-core";
import type { WrapperComponentProps } from "@canonical/router-core";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = WrapperComponentProps<ReactNode> & {
  /** The binding whose routes the layout wraps: its index route's name is
   * the binding's id. */
  readonly binding: EntityBinding;
  /** The lens's name, in the site's own words: the trail's first crumb. */
  readonly label: string;
  /** The site's rail, rendered in the layout's west columns. */
  readonly rail: ReactNode;
  /** The site's footer band, rendered below the canvas; none when omitted. */
  readonly colophon?: ReactNode;
};

/**
 * Props accepted by `EntityLayout`: the routed page the router hands its
 * wrapper, the binding and the lens's label, the site's rail and colophon,
 * and the native props of the layout's root `<div>`.
 */
export type EntityLayoutProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
