import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /**
   * The actions that capture the user's decision — normally Buttons, with the
   * affirmative one first.
   */
  children?: ReactNode;
};

/**
 * Props for the Modal.Footer subcomponent
 *
 * @implements ds:global.subcomponent.modal-footer
 */
export type FooterProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
