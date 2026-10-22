import type { ComponentProps } from "react";

/**
 * Props accepted by `Canvas`: the native props of its `<main>` root.
 *
 * The native `id` and `tabIndex` are excluded because the canvas fixes both:
 * the id is `CANVAS_ELEMENT_ID`, the skip link's target, and `tabIndex` is
 * `-1`, so the skip link can move focus to the canvas while the canvas stays
 * out of the tab order.
 */
export type CanvasProps = Omit<ComponentProps<"main">, "id" | "tabIndex">;
