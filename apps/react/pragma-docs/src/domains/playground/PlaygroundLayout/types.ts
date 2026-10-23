import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactNode } from "react";

/**
 * Props accepted by `PlaygroundLayout`, which renders no element of its own: the
 * routed page the router hands its wrapper.
 */
export type PlaygroundLayoutProps = WrapperComponentProps<ReactNode>;
