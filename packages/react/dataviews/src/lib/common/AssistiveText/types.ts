import type { ComponentProps, ReactNode } from "react";

/** AssistiveText's own props. */
type OwnProps = {
  /** The words assistive technology reads. */
  readonly children: ReactNode;
};

/** Props of text for assistive technology only. The root is a `<span>`. */
export type AssistiveTextProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
