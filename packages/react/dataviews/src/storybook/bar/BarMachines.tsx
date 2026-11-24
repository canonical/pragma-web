import {
  type ArraySource,
  createArraySource,
  createDataViewsProvider,
  createMemoryLocation,
  createPlatformLocation,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { type ReactElement, useState } from "react";
import { ActionBar } from "../../lib/pattern/DataViews/common/controls/ActionBar/index.js";
import QueryBar from "../../lib/pattern/DataViews/common/controls/QueryBar/QueryBar.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";
import DataViews from "../../lib/pattern/DataViews/Provider.js";
import type { BarMachine } from "../machines/index.js";
import {
  barMachineCollection,
  barMachines,
  pooledMachineCollection,
  pooledMachines,
} from "../machines/index.js";
import pickStoryWords from "../pickStoryWords.js";
import { BAR_COLUMNS, WINDOW_PLATFORM } from "./constants.js";
import startFrameAt from "./startFrameAt.js";
import type { BarConfig, BarProvider, BarStoryArgs } from "./types.js";

/** The query bar over the sixty machines, with their table. Story-only. */
export default function BarMachines({
  query,
  inlineSize,
  withOutsideChange = false,
  withHistory = false,
  href,
  withPools = false,
  messages,
  selected,
  ...args
}: BarStoryArgs & BarConfig): ReactElement {
  const words = pickStoryWords({ messages });
  const [provider] = useState<BarProvider>(() => {
    if (withHistory) startFrameAt(query ?? "");
    // The pooled machines are bar machines with one field more, which the
    // bar's own provider type does not name.
    const data = (withPools
      ? {
          collection: pooledMachineCollection,
          source: createArraySource({
            rows: pooledMachines,
            collection: pooledMachineCollection,
            searchFields: ["hostname"],
          }),
          facets: ["status", "tags", "pool"],
        }
      : {
          collection: barMachineCollection,
          source: createArraySource({
            rows: barMachines,
            collection: barMachineCollection,
            searchFields: ["hostname"],
          }),
          facets: ["status", "tags"],
        }) as unknown as {
      readonly collection: typeof barMachineCollection;
      readonly source: ArraySource<BarMachine>;
      readonly facets: readonly ("status" | "tags")[];
    };
    const built = createDataViewsProvider({
      ...data,
      ...(withHistory
        ? { location: createPlatformLocation(WINDOW_PLATFORM) }
        : {}),
      ...(href === undefined
        ? {}
        : { location: createMemoryLocation({ href }) }),
      ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
    });
    if (selected !== undefined) built.selection.add(selected);
    return built;
  });
  return (
    <DataViews provider={provider} {...words}>
      {selected !== undefined && (
        <ActionBar>
          <button type="button">Tag</button>
        </ActionBar>
      )}
      {withOutsideChange && (
        <button
          type="button"
          // A control elsewhere that, like a toolbar's, takes no focus on a
          // press, so the edit in the bar keeps it.
          onPointerDown={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            readProviderHost(provider).setPredicate({
              field: "tags",
              operator: "isAny",
              operands: ["ex-ssd"],
            })
          }
        >
          Show only machines tagged ex-ssd
        </button>
      )}
      <div style={inlineSize === undefined ? undefined : { inlineSize }}>
        <QueryBar {...args} />
      </div>
      <DataTable
        provider={provider}
        columns={BAR_COLUMNS}
        label="Machines"
        {...words}
        selectable={selected !== undefined}
      />
    </DataViews>
  );
}
