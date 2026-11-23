import Provider from "./Provider.js";
import type { DataViewsComponent } from "./types.js";

export type { DataViewsActionBarProps } from "./common/ActionBar/index.js";
export type { DataViewsDataTableProps } from "./common/DataTable/index.js";
export type { DataViewsFiltersProps } from "./common/Filters/index.js";
export type { DataViewsPaginationProps } from "./common/Pagination/index.js";
export type { DataViewsSavedViewsProps } from "./common/SavedViews/index.js";
export type { DataViewsSearchProps } from "./common/Search/index.js";
export type { DataViewsSortPanelProps } from "./common/SortPanel/index.js";
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
