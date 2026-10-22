import type { ComponentProps } from "react";

/**
 * Props accepted by `ThemeSelector`: the native props of its `<select>` root.
 *
 * The native `value`, `onChange` and `children` are excluded because the
 * control fixes all three: it shows the stored preference, stores the
 * reader's choice, and renders its own three options.
 */
export type ThemeSelectorProps = Omit<
  ComponentProps<"select">,
  "value" | "onChange" | "children"
>;
