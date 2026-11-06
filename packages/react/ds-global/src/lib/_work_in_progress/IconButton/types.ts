import type { IconName } from "@canonical/ds-assets";
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
} & AccessibleName;

/**
 * Button's props with a required `icon`, no children and a required accessible
 * name. The root element is Button's `<button>`, so the native half is
 * `ComponentProps<"button">`, reached through `ButtonProps`: `type`, `form`,
 * `popoverTarget`, `ref`, `style` and every handler reach the `<button>`.
 * `variant` is left out: the `link` variant strips the button's chrome and
 * inline padding, which an icon-only button cannot do without losing its
 * square box and its target size.
 *
 * A Tooltip is not part of these props: it is composed around the button,
 * with `withTooltip` or `TooltipEngine`, as it is around a Button.
 *
 * @experimental IconButton sits in `_work_in_progress`: its design-system
 * block, `ds:global.component.icon_button`, is proposed in
 * canonical/pragma-core#131 and is not yet in the ontology, so the props may
 * change when the block is entered.
 */
export type IconButtonProps = OwnProps &
  Omit<ButtonProps, keyof OwnProps | "variant">;
