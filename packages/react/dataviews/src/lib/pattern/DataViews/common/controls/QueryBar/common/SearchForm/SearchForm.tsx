import type { DataViewsState, Query } from "@canonical/dataviews-core";
import { QUERY_KEYS } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import { useDataViewsRoot } from "../../../../../../../_work_in_progress/DataViews/hooks/index.js";
import { interceptSubmit } from "../../../../../../../utils/index.js";
import { HiddenQueryFields } from "../../../HiddenQueryFields/index.js";
import type { SearchFormProps } from "./types.js";

/** The form submits its own text as `q`; every other parameter rides hidden. */
const OWN_KEYS: readonly string[] = Object.freeze([QUERY_KEYS.search]);

/** Where a submission leads: page one, the search in `q`. */
const destinationOf = ({ slice, window }: DataViewsState<object>): Query => ({
  slice: { ...slice, search: null },
  window: { ...window, page: 1, cursor: null },
});

/**
 * The bar's field in a GET search form, where the location spells
 * addresses: its plain input submits the search as `q`, and every other
 * parameter, a refused clause the address carries among them, rides in
 * hidden fields, so a search keeps them. Once scripts run, the submission
 * is held. Without an address, the field stands alone.
 */
export default function SearchForm({
  hasHref,
  children,
}: SearchFormProps): ReactElement {
  const { provider } = useDataViewsRoot("QueryBar");
  if (!hasHref) return <>{children}</>;
  return (
    // The `search` element would say this natively, but jsdom and browsers
    // before 2023 do not know it.
    // biome-ignore lint/a11y/useSemanticElements: `<search>` is unknown to jsdom and to browsers before 2023
    <form
      method="get"
      role="search"
      className="search"
      onSubmit={interceptSubmit}
    >
      {children}
      <HiddenQueryFields
        provider={provider}
        readDestination={destinationOf}
        omit={OWN_KEYS}
      />
    </form>
  );
}
