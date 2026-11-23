/**
 * Almost all configurable aspects of the table are available through the
 * table settings menu. This menu provides a centralized interface accessed
 * through a settings wheel (gear) icon button in the table header for
 * column reordering, column pinning, column visibility, and resetting user
 * customizations. It also links to a keyboard shortcuts reference modal.
 *
 * Covers column visibility, order and reset; give it to a DataTable as
 * `settings`, and it throws anywhere else.
 *
 * `import { DataTable } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_table-settings_menu
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function SettingsMenu(): never {
  throw new Error(
    "DataTable.SettingsMenu must be given to a DataTable as its settings",
  );
}
