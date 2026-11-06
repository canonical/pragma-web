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
  /** No visible children: name the button with `aria-label` instead. */
  children?: never;
} & AccessibleName;

/**
 * Button's props, with a required `icon` and accessible name, no children
 * and no `variant`. All of them reach the root `<button>`. A Tooltip is
 * composed around it, not passed as a prop.
 *
 * @experimental Its block is a draft (canonical/pragma-core#131), so the
 * props may change when the block is entered.
 */
export type IconButtonProps = OwnProps &
  Omit<ButtonProps, keyof OwnProps | "variant">;
