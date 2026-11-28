import type { ComponentProps } from "react";

/** Props of the dash: the native props of its `span`. */
export type NotApplicableProps = Omit<ComponentProps<"span">, "children">;
