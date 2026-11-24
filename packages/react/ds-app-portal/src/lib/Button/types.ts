// TODO: this is how appearance could work as enum
//
// export enum ButtonAppearance {
//   DEFAULT = "default",
//   BASE = "base",
//   POSITIVE = "positive",
//   NEGATIVE = "negative",
//   LINK = "link",
// }
//

import type { ComponentProps, ReactNode } from "react";

/**
 * The Button's DS-owned props. Native `<button>` attributes (`id`, `className`,
 * `type`, `disabled`, event handlers, …) come from `ComponentProps<"button">`
 * in {@link default | ButtonProps}, so only genuinely design-system-specific
 * members live here.
 */
type OwnProps = {
  /**
   * Button contents.
   * String children are also applied as the button's `aria-label`. For
   * non-string children the accessible name comes from the rendered text
   * content; pass an explicit `aria-label` for icon-only buttons.
   * */
  children: ReactNode;
  /** The visual style of the button */
  appearance?: "neutral" | "base" | "positive" | "negative" | "link";
};

type Props = OwnProps & Omit<ComponentProps<"button">, keyof OwnProps>;

export type { Props as default };
