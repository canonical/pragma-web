import type { ComponentProps } from "react";

/** One message the line shows: an error or a warning, and its action. */
export type MessageLineEntry = {
  /** Stable while the message stands. */
  readonly id: string;
  /** What is wrong, in the root's words. */
  readonly text: string;
  /** How serious it is: an error, or a warning that changes nothing. */
  readonly criticality: "error" | "warning";
  /**
   * The one action that resolves it, where there is one: a button once
   * scripts run, or, before they do, a link to the address it leads to.
   */
  readonly action?:
    | { readonly label: string; readonly onAction: () => void }
    | { readonly label: string; readonly href: string };
};

/** MessageLine's own props. */
type OwnProps = {
  /** The messages, in order; the line renders nothing without one. */
  readonly entries: readonly MessageLineEntry[];
};

/**
 * Props of the query bar's message line. The rest reach its root `div`,
 * apart from `children`, which the line renders itself.
 */
export type MessageLineProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
