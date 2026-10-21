import type { WrapperComponentProps } from "@canonical/router-core";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = WrapperComponentProps<ReactNode> & {
  /** The site's rail, rendered in the layout's west columns. */
  readonly rail: ReactNode;
  /** The site's footer band, rendered below the canvas; none when omitted. */
  readonly colophon?: ReactNode;
};

/**
 * Props accepted by `DefinitionsLayout`: the routed page the router hands its
 * wrapper, the site's rail and colophon, and the native props of the layout's
 * root `<div>`.
 */
export type DefinitionsLayoutProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
