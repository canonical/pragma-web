import type { WrapperComponentProps } from "@canonical/router-core";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = WrapperComponentProps<ReactNode> & {
  /** The site's rail, rendered in the document's rail region. */
  readonly rail: ReactNode;
  /** The site's footer band, rendered below the canvas; none when omitted. */
  readonly colophon?: ReactNode;
};

/**
 * Props accepted by `StandardsLayout`, which renders no element of its own:
 * the routed page the router hands its wrapper, the site's rail and
 * colophon, and the native props of the document layout's root `<div>`,
 * which they reach.
 */
export type StandardsLayoutProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
