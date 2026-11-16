import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { useState } from "react";
import { QueryBar } from "../../lib/_work_in_progress/DataViews/common/QueryBar/index.js";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";
import type { QueryBuilderProps } from "./types.js";

/** One record the builder's clauses filter. */
type PoolMachine = {
  readonly id: string;
  readonly status: string;
  readonly pool: string;
  readonly owner: string;
};

/** Three closed fields, each with a handful of values. */
const collection = createCollection({
  identify: (machine: PoolMachine) => machine.id,
  fields: [
    {
      field: "status",
      kind: "choices",
      options: ["deployed", "ready", "commissioning", "broken"],
    },
    { field: "pool", kind: "choices", options: ["default", "gpu", "storage"] },
    { field: "owner", kind: "choices", options: ["admin", "alice", "bob"] },
  ],
});

/** Six machines across the values. */
const rows: readonly PoolMachine[] = [
  { id: "p1", status: "deployed", pool: "default", owner: "admin" },
  { id: "p2", status: "ready", pool: "gpu", owner: "alice" },
  { id: "p3", status: "commissioning", pool: "storage", owner: "bob" },
  { id: "p4", status: "broken", pool: "default", owner: "alice" },
  { id: "p5", status: "deployed", pool: "gpu", owner: "bob" },
  { id: "p6", status: "ready", pool: "storage", owner: "admin" },
];

/**
 * The query bar over three closed fields, as the QueryInput stories show
 * QueryInput hosted: the bar owns every rule of building, editing and
 * removing chips, and this host only gives it a collection.
 */
export default function QueryBuilder({
  initial,
  inlineSize,
}: QueryBuilderProps): ReactElement {
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection,
      source: createArraySource<PoolMachine>({ rows, collection }),
      ...(initial === undefined
        ? {}
        : { snapshot: { query: initial, presentation: {} } }),
    }),
  );
  return (
    <DataViews provider={provider}>
      <div style={inlineSize === undefined ? undefined : { inlineSize }}>
        <QueryBar label="Filter machines" />
      </div>
    </DataViews>
  );
}
