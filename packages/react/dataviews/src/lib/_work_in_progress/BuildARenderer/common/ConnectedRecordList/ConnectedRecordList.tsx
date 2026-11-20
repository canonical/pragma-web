import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { useDataViews } from "../../../DataViews/index.js";
import { ScopedRecordList } from "../ScopedRecordList/index.js";
import type { ConnectedRecordListProps } from "./types.js";

/**
 * The connected twin: the same list, reading the enclosing DataViews root
 * instead of taking a provider. The root observes the provider, so the twin
 * does not. Outside a root, `useDataViews` throws.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 */
export default function ConnectedRecordList<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  collection,
  ...props
}: ConnectedRecordListProps<TFields, TRow>): ReactElement {
  const scope = useDataViews(collection);
  return <ScopedRecordList {...props} scope={scope} />;
}
