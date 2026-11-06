import type { ComponentProps } from "react";

/**
 * Props for `TopBar`. The bar owns its content — the application's name and
 * the demo navigation — so it takes only the native props of its root
 * `<header>`, which reach the element unchanged.
 */
export type TopBarProps = Omit<ComponentProps<"header">, "children">;
