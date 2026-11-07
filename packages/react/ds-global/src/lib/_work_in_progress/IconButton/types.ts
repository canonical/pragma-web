import type { IconName } from "@canonical/ds-assets";
import type { ButtonProps } from "../../component/Button/index.js";

/** An accessible name: `aria-label`, `aria-labelledby`, or both. */
type AccessibleName =
  | {
      /** The accessible name. */
      "aria-label": string;
      /** The id of an element whose text names the button. */
      "aria-labelledby"?: string;
    }
  | {
      /** The accessible name. */
      "aria-label"?: string;
      /** The id of an element whose text names the button. */
      "aria-labelledby": string;
    };

/** IconButton's own props; the rest are Button's. */
type OwnProps = {
  /** The design-system icon, the button's only visible content. */
  icon: IconName;
  /** No visible children: name it with `aria-label` or `aria-labelledby`. */
  children?: never;
} & AccessibleName;

/**
 * Button's props, with a required `icon` and accessible name, no children,
 * and no `variant`, whose link style drops the square box. All reach the
 * root `<button>`.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type IconButtonProps = OwnProps &
  Omit<ButtonProps, keyof OwnProps | "variant">;
