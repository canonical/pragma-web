import type { ComponentProps } from "react";

type OwnProps = {
  /** The glyph's width and height, in pixels; 16 when omitted. */
  readonly size?: number;
};

/** Props accepted by `EntityIcon`: its size, and the native props of its
 * root `<svg>`. */
export type EntityIconProps = OwnProps &
  Omit<ComponentProps<"svg">, keyof OwnProps>;
