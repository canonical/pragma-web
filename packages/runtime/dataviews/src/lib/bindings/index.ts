/** Shared machinery for framework bindings; no application calls it. */

export { assertInvariant } from "../assertion/index.js";
export type {
  DisplayEntriesConfig,
  DisplayEntry,
  DisplayEntryKind,
  DisplayPagination,
} from "../display/index.js";
export {
  areDisplayStatusesEqual,
  DISPLAY_STATUS_PHASES,
  listDisplayEntries,
  resolveDisplayStatus,
  resolvePagination,
} from "../display/index.js";
export type {
  FilterInputs,
  FilterInputsConfig,
} from "../filter/index.js";
export { createFilterInputs } from "../filter/index.js";
export type {
  ColumnLayout,
  ColumnLayoutConfig,
  ColumnLayoutState,
  ColumnSizing,
  ColumnToSize,
  FixedSizing,
  FlexSizing,
  GridInteraction,
  GridInteractionState,
  ResolvedColumn,
  SizingBounds,
} from "../geometry/index.js";
export {
  areSizingsEqual,
  buildColumnTemplate,
  createColumnLayout,
  createGridInteraction,
  readSizingBounds,
  resolveColumns,
} from "../geometry/index.js";
export { resolveMessages } from "../messages/index.js";
export type {
  ArrangedColumn,
  ColumnCommandConfig,
  DeclaredColumn,
  MoveColumnConfig,
  SpellColumnArrangementConfig,
} from "../presentation/index.js";
export {
  hideColumn,
  moveColumn,
  resetColumnArrangement,
  resolveColumnArrangement,
  showColumn,
  spellColumnArrangement,
} from "../presentation/index.js";
export type { ProviderHost } from "../provider/index.js";
export { isDataViewsProvider, readProviderHost } from "../provider/index.js";
export type { QueryCommand, QueryCommandResult } from "../query/index.js";
export {
  applyQueryCommand,
  areListsEqual,
  cycleSortTerm,
  placeSortTerm,
} from "../query/index.js";
export { areFieldFacetsEqual } from "../result/index.js";
export type {
  Applicability,
  RowChannels,
  RowScopes,
  RowScopesConfig,
} from "../rows/index.js";
export { createRowScopes } from "../rows/index.js";
export type { EffectiveOrdering } from "../source/index.js";
export { resolveEffectiveOrdering } from "../source/index.js";
export {
  isNarrowingIssue,
  QUERY_KEYS,
  spellWireKey,
  spellWireValues,
} from "../wire/index.js";
