import type { IconName } from "@canonical/ds-assets";
import type { ReactNode } from "react";
import type { ButtonProps } from "../../component/Button/index.js";

/**
 * An icon-only button has no visible text, so it must be named explicitly:
 * at least one of `aria-label` or `aria-labelledby` is required.
 */
type AccessibleName =
  | {
      /** The accessible name, announced in place of the missing label. */
      "aria-label": string;
      /** The id of an element whose text names the button. */
      "aria-labelledby"?: string;
    }
  | {
      /** The accessible name, announced in place of the missing label. */
      "aria-label"?: string;
      /** The id of an element whose text names the button. */
      "aria-labelledby": string;
    };

/**
 * The IconButton's DS-owned props. Everything else — importance, anticipation,
 * loading, disabled and every native `<button>` attribute — is Button's, and
 * reaches the Button this component renders.
 */
type OwnProps = {
  /**
   * Name of the design-system icon the button shows, rendered by Button's
   * icon slot (an `@canonical/ds-assets` sprite). Required: it is the button's
   * only visible content.
   */
  icon: IconName;
  /**
   * An icon button has no visible children; name it with `aria-label` or
   * `aria-labelledby` instead.
   */
  children?: never;
  /**
   * The Tooltip that states the action. Button's guideline reads "Always pair
   * an icon-only button with a Tooltip", so one is shown by default, with the
   * `aria-label` as its message and the Tooltip's own show and hide delay.
   * - `undefined`: a Tooltip whose message is the `aria-label`.
   * - a node: a Tooltip with that message. It is visual only: the Tooltip
   *   engine does not yet describe the button with it.
   * - `false`: no Tooltip, for a button whose action is already shown nearby.
   *
   * A button named only by `aria-labelledby` has no default message, so it
   * shows no Tooltip unless one is given here.
   */
  tooltip?: ReactNode | false;
} & AccessibleName;

/**
 * Button's props with a required `icon`, no children and a required accessible
 * name. The root element is Button's `<button>`, so the native half is
 * `ComponentProps<"button">`, reached through `ButtonProps`: `type`, `form`,
 * `popoverTarget`, `ref`, `style` and every handler reach the `<button>`.
 * `variant` is left out: the `link` variant strips the button's chrome and
 * inline padding, which an icon-only button cannot do without losing its
 * square box and its target size.
 */
export type IconButtonProps = OwnProps &
  Omit<ButtonProps, keyof OwnProps | "variant">;
