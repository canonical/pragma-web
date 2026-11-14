/**
 * The findings of the file rules this package still owes, one
 * `"<path> <rule>"` line each. The guard fails on a finding not listed and
 * on a listed one no longer found, so a row leaves with the fix.
 */
export const FILE_RULE_ALLOWLIST: readonly string[] = Object.freeze([
  "src/lib/indexeddb/constants.ts test",
  "src/lib/indexeddb/isStoredPreference.ts test",
  "src/lib/indexeddb/readSavedView.ts test",
  "src/lib/wire/readWireField.ts test",
  "src/lib/wire/rejectWireName.ts test",
]);
