import type { ComponentProps } from "react";

/**
 * Props for `CanonicalLogo`. The logo owns its link target, its accessible
 * name and its mark, so it takes only the native props of its root `<a>`,
 * which reach the element unchanged.
 */
export type CanonicalLogoProps = Omit<
  ComponentProps<"a">,
  "aria-label" | "children" | "href"
>;
