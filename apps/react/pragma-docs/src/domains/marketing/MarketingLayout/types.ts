import type { WrapperComponentProps } from "@canonical/router-core";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = WrapperComponentProps<ReactNode>;

/**
 * Props accepted by `MarketingLayout`: the routed page the router hands its
 * wrapper, and the native props of the layout's root `<div>`.
 */
export type MarketingLayoutProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
