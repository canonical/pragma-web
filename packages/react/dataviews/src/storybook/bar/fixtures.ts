/** The query bar stories' columns and the frame's own location. */

import type { PlatformLocation } from "@canonical/dataviews-core";
import { createColumns } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";
import {
  barMachineCollection,
  pooledMachineCollection,
} from "../machines/index.js";
import { BAR_COLUMN_DECLARATIONS } from "./constants.js";

/** The bar machines' columns. */
export const BAR_COLUMNS = createColumns({
  collection: barMachineCollection,
  columns: BAR_COLUMN_DECLARATIONS,
});

/** The same columns over the pooled machines, as their table checks. */
export const POOLED_COLUMNS = createColumns({
  collection: pooledMachineCollection,
  columns: BAR_COLUMN_DECLARATIONS,
});

/**
 * The frame's own address and history as a platform the location reads
 * and writes, so a story's query moves with Back and Forward. Story-only.
 */
export const WINDOW_PLATFORM: PlatformLocation = {
  getLocation: () => window.location.href,
  navigate: (url, options) => {
    if (options?.replace === true) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  },
  subscribe: (listener) => {
    const handlePopState = (): void => listener(window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  },
};
