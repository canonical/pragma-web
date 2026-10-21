import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The primary navigation, rendered in the west columns. */
  readonly rail: ReactNode;
  /** The mode strip, rendered atop the viewport, above the canvas. */
  readonly strip: ReactNode;
  /** The colophon, rendered in the footer band below the canvas. */
  readonly footer: ReactNode;
  /** The routed page, rendered into the canvas. */
  readonly children: ReactNode;
};

export type LensLayoutProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
