import type { ReactNode } from "react";

/**
 * The limits every graph view keeps: what it draws, fetches and ships.
 *
 * @note The atlas, a later surface that declares `data-task="explore"`, is
 *   the one view exempt from these budgets; nothing here builds it.
 */
export interface GraphBudget {
  /** Nodes one graph view draws, every one labelled. */
  readonly drawnNodesMax: number;
  /** Members a band shows before it groups the rest under a count. */
  readonly bandMembersMax: number;
  /** Nodes one query fetches. */
  readonly fetchedNodesMax: number;
  /** Bytes of one page's graph SVG. */
  readonly svgBytesMax: number;
  /** Elements of one page's graph SVG. */
  readonly svgElementsMax: number;
  /** The smallest label a drawn node may carry at Fit, in CSS pixels. */
  readonly labelPxMin: number;
}

/** A budget raised past its default, with the reason the site gives. */
export interface GraphBudgetRaise {
  readonly value: number;
  /** Why the site needs more than the default; never empty. */
  readonly reason: string;
}

/**
 * A site's changes to the budgets: a bare number moves a budget towards the
 * stricter side of its default; going past it takes a `GraphBudgetRaise`.
 */
export type GraphBudgetOverrides = {
  readonly [Key in keyof GraphBudget]?: number | GraphBudgetRaise;
};

/** Props accepted by `GraphBudgetProvider`. */
export interface GraphBudgetProviderProps {
  /** The site's budget, from `createGraphBudget`; the defaults when omitted. */
  readonly budget?: GraphBudget;
  /** The content whose graphs read the budget. */
  readonly children: ReactNode;
}
