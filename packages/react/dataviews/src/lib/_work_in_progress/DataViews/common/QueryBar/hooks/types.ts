/** The query bar's hook types: each hook's props and result. */
import type {
  Count,
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { Dispatch, RefCallback, RefObject } from "react";
import type { AnnouncerHandle } from "../../../../../common/index.js";
import type { UseFacetsResult } from "../../../../../hooks/index.js";
import type { FilterButtonPanelHandle } from "../../../../FilterButton/index.js";
import type { ContextOptions } from "../../../types.js";
import type {
  QueryBarSession,
  QueryBarSessionAction,
  QueryClause,
  QueryGroupStandIn,
} from "../types.js";

/** What the query group's stand-in reads: the root's provider. */
export type UseQueryGroupProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
};

/** The query group over the provider, at one identity per provider. */
export type UseQueryGroupResult = QueryGroupStandIn;

/** What the edit session reads: the root's provider and the bar's root. */
export type UseQueryBarSessionProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  /** The bar's root, inside which the session moves focus. */
  readonly rootRef: RefObject<HTMLElement | null>;
};

/** The edit session and how it moves. */
export type UseQueryBarSessionResult = {
  readonly session: QueryBarSession;
  readonly dispatch: Dispatch<QueryBarSessionAction>;
};

/** What the bar's read of its chips takes: the query group. */
export type UseClauseIdsProps = {
  readonly group: QueryGroupStandIn;
};

/** The chips' clauses, at one identity while their ids stay. */
export type UseClauseIdsResult = readonly QueryClause[];

/** What says an outcome once its result lands: the provider and the root's announcer. */
export type UseAnnounceOutcomeProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  readonly announce: ContextOptions["announce"];
};

/** Say an outcome, worded from the result count once the result lands. */
export type UseAnnounceOutcomeResult = (
  words: (count: Count) => string,
) => void;

/** What the suggested values' facets are read for: a field, or none. */
export type UseSuggestedFacetsProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  /** The field whose values are suggested, or null while none are. */
  readonly field: string | null;
};

/** The facets the values are suggested from; none while no field is. */
export type UseSuggestedFacetsResult = UseFacetsResult;

/** What the field's overflow reads: the bar's root. */
export type UseFieldOverflowProps = {
  readonly rootRef: RefObject<HTMLElement | null>;
};

/** What the focus handoff reads: the bar's root, and whether scripts run. */
export type UseLinkFocusHandoffProps = {
  readonly rootRef: RefObject<HTMLElement | null>;
  readonly hydrated: boolean;
};

/** What the live count reads: the root's provider. */
export type UseAnswerCountStandInProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
};

/** The count answering the applied query; unknown while none does. */
export type UseAnswerCountStandInResult = Count;

/** What narrow mode follows: the bar's root and entry, and the stop's move. */
export type UseNarrowModeProps = {
  /** The bar's root, whose inline size is observed. */
  readonly rootRef: RefObject<HTMLElement | null>;
  /** The free-text entry, which takes focus that was in a hidden chip. */
  readonly entryRef: RefObject<HTMLInputElement | null>;
  /** Called as the bar narrows, to move the stop off the hidden chips. */
  readonly onNarrow: () => void;
  /** Called as the bar widens again, the chips shown once more. */
  readonly onWide: () => void;
};

/** Whether the bar is narrow. */
export type UseNarrowModeResult = boolean;

/** What the sheet's announcer redirects: the root's announcer. */
export type UseSheetAnnouncerProps = {
  readonly announce: ContextOptions["announce"];
};

/** The ref the sheet's status region takes, and the announcer over both. */
export type UseSheetAnnouncerResult = {
  readonly regionRef: RefObject<AnnouncerHandle | null>;
  readonly announce: ContextOptions["announce"];
};

/**
 * The quick filters' panels, as the bar holds them: a ref for each field's
 * filter button, and one call that closes every open panel, for a part
 * that takes the quick filters over.
 */
export type UseQuickFilterPanelsResult = {
  /** The ref one field's filter button hands its panel to; one per field. */
  readonly collectPanel: (
    field: string,
  ) => RefCallback<FilterButtonPanelHandle>;
  /** Close every quick filter's open panel. */
  readonly hidePanels: () => void;
};
