import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { Announcer } from "../../common/index.js";
import Context from "./Context.js";
import {
  ActionBar,
  DataTable,
  Filters,
  Pagination,
  SavedViews,
  Search,
  Settings,
  SortPanel,
} from "./common/index.js";
import { useProviderState } from "./hooks/index.js";
import type { DataViewsProps } from "./types.js";

/**
 * The DataViews root: mounts the collection provider's context for the
 * hooks and connected parts of the composition, observes the provider for
 * as long as it is mounted, owns the filter records its parts edit
 * through, and speaks for them.
 *
 * Every word its parts render or announce comes from `messages`, over
 * English. What a part's command did that has no place on screen — a new
 * ordering, a column moved, a refusal no control shows — is said through
 * the root's one polite live region, rendered after its children; a second
 * root over the same provider has its own and says nothing of this one's
 * commands.
 *
 * No single root element: the root is a context mount and its announcer's
 * region, not a DOM node wrapping its children.
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.pattern.data_views
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
const Provider = Object.assign(
  function DataViews<
    TFields extends readonly SchemaFieldDefinition[],
    TRow extends object = RowRecord,
  >({
    provider,
    messages,
    children,
  }: DataViewsProps<TFields, TRow>): ReactElement {
    const value = useProviderState(
      messages === undefined ? { provider } : { provider, messages },
    );
    return (
      <Context value={value}>
        {children}
        <Announcer ref={value.announcer} />
      </Context>
    );
  },
  {
    Actions: ActionBar,
    DataTable,
    Filters,
    Pagination,
    SavedViews,
    Search,
    Settings,
    SortPanel,
  },
);

export default Provider;
