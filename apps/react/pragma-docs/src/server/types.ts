import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

/** The serialised store snapshot for `initialData.relay`. */
export interface PreparedRelayData {
  readonly records: RecordMap;
}
