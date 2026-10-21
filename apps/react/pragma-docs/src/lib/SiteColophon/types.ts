import type { ComponentProps } from "react";

/**
 * Props accepted by `SiteColophon`: the native props of its `<footer>` root.
 *
 * The native `children` is excluded because the colophon's text is the
 * site's own, the same on every lens.
 */
export type SiteColophonProps = Omit<ComponentProps<"footer">, "children">;
