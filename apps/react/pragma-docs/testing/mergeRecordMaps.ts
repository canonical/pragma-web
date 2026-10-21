import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

/**
 * Merge several captured Relay record maps into one, so a single store can
 * serve every page a test navigates between.
 *
 * A shallow per-record merge is exact for Relay's flat record maps: the
 * only record two captures share is `client:root`, whose fields union
 * cleanly. A later map's fields win on a clash.
 *
 * @param maps - The record maps to merge, in order.
 * @returns A new record map holding every record of every map.
 */
export default function mergeRecordMaps(
  ...maps: readonly RecordMap[]
): RecordMap {
  const merged: Record<string, Record<string, unknown>> = {};
  for (const map of maps) {
    for (const [dataId, record] of Object.entries(map)) {
      merged[dataId] = {
        ...merged[dataId],
        ...(record as Record<string, unknown>),
      };
    }
  }
  return merged as unknown as RecordMap;
}
