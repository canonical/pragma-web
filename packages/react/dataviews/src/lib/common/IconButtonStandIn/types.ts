import type { ButtonProps } from "@canonical/react-ds-global";

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

/** The stand-in's own props; the rest are Button's. */
type OwnProps = {
  /** The design-system icon, the button's only visible content. */
  icon: NonNullable<ButtonProps["icon"]>;
  /** No visible children: name it with `aria-label` or `aria-labelledby`. */
  children?: never;
} & AccessibleName;

/** IconButton's props: Button's, with a required icon and name, no children and no `variant`. */
export type IconButtonStandInProps = OwnProps &
  Omit<ButtonProps, keyof OwnProps | "variant">;
