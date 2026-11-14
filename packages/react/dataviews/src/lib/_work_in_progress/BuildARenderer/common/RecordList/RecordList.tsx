import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { isDataViewsProvider } from "@canonical/dataviews-core/bindings";
import { type ReactElement, useEffect } from "react";
import { ScopedRecordList } from "../ScopedRecordList/index.js";
import type { RecordListProps } from "./types.js";

/**
 * The standalone list: it takes its provider, observes it for as long as it
 * is mounted, and never reads a DataViews root.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 */
export default function RecordList<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({ provider, ...props }: RecordListProps<TFields, TRow>): ReactElement {
  if (!isDataViewsProvider(provider)) {
    throw new Error(
      "RecordList requires a provider created by createDataViewsProvider",
    );
  }
  useEffect(() => provider.observe(), [provider]);
  return <ScopedRecordList {...props} scope={provider} />;
}
