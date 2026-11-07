import type { ReactElement } from "react";
import { DataCards as Standalone } from "../../../DataCards/index.js";
import { useDataViewsRoot } from "../../hooks/index.js";
import type { DataViewsDataCardsProps } from "./types.js";

/**
 * The collection's records as cards, bound to the enclosing root's provider.
 *
 * It renders exactly what `DataCards` renders for that provider. The difference is
 * where the provider and the words come from: this part reads the root it is
 * placed in, and throws outside one, rather than taking a provider or messages
 * of its own. So a table and cards placed in one root share one query, one set
 * of rows, one selection and one set of words.
 *
 * Not exported from the package root, nor placed on `DataViews`: a
 * work-in-progress spike, imported from its own module until it is admitted.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export default function DataCards(
  props: DataViewsDataCardsProps,
): ReactElement {
  const { provider, messages } = useDataViewsRoot("DataCards");
  return <Standalone {...props} provider={provider} messages={messages} />;
}
