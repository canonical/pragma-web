import Provider from "./Provider.js";
import type { DataViewsComponent } from "./types.js";

export type { DataViewsActionBarProps } from "./common/controls/ActionBar/index.js";
export type { DataViewsFiltersProps } from "./common/controls/Filters/index.js";
export type { DataViewsPaginationProps } from "./common/controls/Pagination/index.js";
export type {
  DataViewsQueryBarPreset,
  DataViewsQueryBarProps,
  DataViewsQueryBarQuickFilter,
  DataViewsQueryBarQuickFilterArrangement,
} from "./common/controls/QueryBar/index.js";
export type { DataViewsSavedViewsProps } from "./common/controls/SavedViews/index.js";
export type { DataViewsSearchProps } from "./common/controls/Search/index.js";
export type { DataViewsSortPanelProps } from "./common/controls/SortPanel/index.js";
export type { DataViewsDataTableProps } from "./common/renderers/DataTable/index.js";
export type {
  UseDataViewsFilterResult,
  UseDataViewsResult,
} from "./hooks/index.js";
export { useDataViews, useDataViewsFilter } from "./hooks/index.js";
export type { DataViewsComponent, DataViewsProps } from "./types.js";

/**
 * The DataViews root, with its connected parts as members.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export const DataViews = Provider as DataViewsComponent;

export default DataViews;
