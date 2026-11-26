import type { PlatformLocation } from "@canonical/dataviews-core";
import type { DataTableColumn } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

/** The bar machines' columns. */
export const BAR_COLUMNS: readonly DataTableColumn[] = [
  { id: "hostname", header: "Host" },
  { id: "status", header: "Status" },
  { id: "memory", header: "Memory (MiB)" },
  { id: "tags", header: "Tags" },
  { id: "owner", header: "Owner" },
  { id: "deployed", header: "Deployed" },
];

/** The frame's own parameters, which a story's query never replaces. */
export const FRAME_KEYS: readonly string[] = [
  "id",
  "viewMode",
  "args",
  "globals",
];

/** The query the narrow stories start on: two filter chips, a range once. */
export const NARROW_QUERY =
  "status=deployed&memory__gte=8192&memory__lte=65536";

/** A phone's width, or the frame's where it is narrower still. */
export const PHONE_SIZE = "min(22.5rem, 100%)";

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
