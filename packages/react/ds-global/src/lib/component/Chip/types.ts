import type { IconName } from "@canonical/ds-assets";
import type { ModifierFamily } from "@canonical/ds-types";
import type {
  ComponentProps,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";

/**
 * The Chip's design-system props, shared by both of its possible roots.
 * Private: `ChipProps` below is the public type, so the name a consumer
 * imports is the one that describes what `<Chip>` accepts.
 */
type OwnProps = {
  /** The attribute or entity the chip represents. */
  value: string;

  /** Optional key shown before the value, followed by a colon. */
  lead?: string;

  /** Name of the design-system icon shown before the lead and value. */
  icon?: IconName;

  /** Badge shown after the value. Use the `Badge` component. */
  badge?: ReactNode;

  /**
   * Criticality modifier for status indication.
   */
  criticality?: ModifierFamily<"criticality">;
};

/**
 * Action chip — the whole chip is the action. Rendered as a `<button>`, so it
 * extends native `<button>` props.
 */
type ActionChipProps = OwnProps & {
  /** Called when the chip is activated. Its presence makes the chip a button. */
  onClick: MouseEventHandler<HTMLButtonElement>;

  /** An action chip has no dismiss control. */
  children?: never;
} & Omit<ComponentProps<"button">, keyof OwnProps | "onClick" | "children">;

/**
 * Dismissible chip — only its dismiss control is an action. Rendered as a
 * `<span>`, so it extends native `<span>` props.
 */
type DismissibleChipProps = OwnProps & {
  /** A dismissible chip is not itself clickable. */
  onClick?: never;

  /** The dismiss control: a single `Chip.Dismiss`. */
  children: ReactElement;
} & Omit<ComponentProps<"span">, keyof OwnProps | "onClick" | "children">;

/**
 * Chip props: a discriminated union on the chip's one action. A chip with an
 * `onClick` renders a `<button>` and extends button props; a chip with a
 * `Chip.Dismiss` child renders a `<span>` and extends span props. A chip
 * always has exactly one of the two — use a tag for read-only metadata.
 */
export type ChipProps = ActionChipProps | DismissibleChipProps;
