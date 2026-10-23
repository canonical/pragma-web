import type { ComponentProps } from "react";

type OwnProps = {
  /** The selected term (prefixed URI, percent-decoded by the router), or
   * undefined on `/definitions` (the no-default-term explorer). */
  readonly term: string | undefined;
};

/**
 * Props accepted by `DefinitionsExplorer`: the selected term, and the native
 * props of its root `<div>`.
 */
export type DefinitionsExplorerProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
