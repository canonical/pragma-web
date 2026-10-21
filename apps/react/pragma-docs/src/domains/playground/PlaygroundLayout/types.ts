import type { WrapperComponentProps } from "@canonical/router-core";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = WrapperComponentProps<ReactNode>;

/**
 * Props accepted by `PlaygroundLayout`: the routed page the router hands its
 * wrapper, and the native props of the layout's root `<div>`.
 */
export type PlaygroundLayoutProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
