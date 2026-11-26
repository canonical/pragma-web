import type { QuickFilterPanelProps } from "../../types.js";

/** The props of a number's or a date's panel: a lower and an upper bound. */
export type BoundsPanelProps = QuickFilterPanelProps<"number" | "date">;
