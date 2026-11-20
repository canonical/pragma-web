import type { ComponentProps, MouseEventHandler } from "react";

type OwnProps = {
  /** Called when the chip is dismissed. */
  onClick: MouseEventHandler<HTMLButtonElement>;
};

/**
 * Props for the chip's dismiss control: native `<button>` props. The control
 * always shows the close icon.
 */
export type DismissProps = OwnProps &
  Omit<ComponentProps<"button">, keyof OwnProps | "children">;
