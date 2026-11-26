import type { QueryIssue } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** Every refused parameter of the location, as the provider reports it. */
  readonly issues: readonly QueryIssue[];
  /** A field's visible name, from Filters' labels or the field itself. */
  readonly nameField: (field: string) => string;
  /**
   * The location's parameters, for the links that clear a clause before
   * scripts run; null without a location, when there is nowhere to lead.
   */
  readonly params: URLSearchParams | null;
  /** Remove one refused clause: the parameter it was refused under. */
  readonly onClear: (issue: QueryIssue) => void;
  /** Move focus to the filters' group, where it goes once the list empties. */
  readonly focusGroup: () => void;
};

/**
 * Props of the list of a followed link's refused clauses: its own, and the
 * native props of the `div` it renders as its root.
 */
export type LinkRefusalsProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
