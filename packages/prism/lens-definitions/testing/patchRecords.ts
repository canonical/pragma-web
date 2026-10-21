import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

/**
 * Copy a captured store with some of its records' fields replaced, to serve
 * the shape a provider may answer with but no capture holds: an absent
 * label, a root class, a property with no domain.
 *
 * @param records - The captured store.
 * @param patches - The fields to replace, by record id.
 * @returns A new store; `records` is left untouched.
 * @throws When a patch names a record the store does not hold.
 */
export default function patchRecords(
  records: RecordMap,
  patches: Readonly<Record<string, Readonly<Record<string, unknown>>>>,
): RecordMap {
  const patched: Record<string, unknown> = { ...records };
  for (const [id, fields] of Object.entries(patches)) {
    const record = records[id];
    if (record === undefined || record === null) {
      throw new Error(`the store holds no record "${id}" to patch`);
    }
    patched[id] = { ...record, ...fields };
  }
  return patched as RecordMap;
}
