import type { ComponentProps } from "react";

/**
 * Props accepted by `WellLegend`: the native props of its root `<dl>`. The
 * legend's entries are fixed, so it owns no props of its own.
 */
export type WellLegendProps = ComponentProps<"dl">;
