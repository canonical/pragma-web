import type { ComponentProps } from "react";

/**
 * Props accepted by `EntityControls`: the native props of its `<div>` root.
 * It reads the shared filter in scope, so it takes no props of its own; the
 * native `children` are excluded, since the root renders the search box.
 */
export type EntityControlsProps = Omit<ComponentProps<"div">, "children">;
