/**
 * The shared test constants: how a test waits on a delivery, the fields
 * whose facets the chart tests ask for, where the mock API is addressed, and
 * the file-rule findings the package still owes.
 */

/**
 * How a test waits on a delivery: often, since one arrives within a round
 * trip, and long enough for a busy machine, within the test's own timeout.
 */
export const DELIVERY_WAIT = { interval: 5, timeout: 4000 } as const;

/** The fields whose facets the chart tests ask for. */
export const CHART_FACETS = ["status", "cores"] as const;

/** Where a test's mock API requests are addressed; the handlers match any origin. */
export const MOCK_API_ORIGIN = "http://localhost";

/**
 * The file-rule findings this package still owes, one `"<path> <rule>"`
 * line each. The guard fails on a finding not listed and on a listed one no
 * longer found, so a row leaves with the fix.
 */
export const FILE_RULE_ALLOWLIST: readonly string[] = Object.freeze([
  "src/lib/_work_in_progress/DataTable/common/HeaderMenu/HeaderMenu.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/SettingsMenu/LabelsContext.ts test",
  "src/lib/_work_in_progress/DataTable/common/SettingsMenu/SettingsMenu.tsx export:memo-over-function",
  "src/lib/_work_in_progress/DataTable/common/SettingsMenu/common/ItemLabel/ItemLabel.tsx test",
  "src/lib/_work_in_progress/DataTable/common/hooks/useMenuPhase.ts test",
  "src/lib/_work_in_progress/PaginationBar/common/PageControl/PageControl.tsx test",
  "src/lib/common/SettingsMenuContext/SettingsMenuContext.tsx test",
  "testing/keyboard/DataTable.keyboard.ts export:none",
  "testing/keyboard/DataTable.keyboard.ts test",
]);
