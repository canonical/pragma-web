import type { ReactElement } from "react";
import { SettingsMenu } from "../SettingsMenu/index.js";
import type { SettingsCellProps } from "./types.js";

const componentCssClassName = "ds data-table-settings-cell";

/**
 * The header's settings cell, ending the header row: it draws the table's
 * settings menu where the settings are `DataTable.SettingsMenu`, and any
 * other settings as given.
 *
 * @implements ds:apps.subcomponent.data_table-settings_cell
 */
export default function SettingsCell({
  settings,
  settingsMenu,
  menu,
  reserve,
  className,
  ...rest
}: SettingsCellProps): ReactElement {
  return (
    <th
      {...rest}
      scope="col"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      ref={reserve}
    >
      {settings.type === settingsMenu ? <SettingsMenu {...menu} /> : settings}
    </th>
  );
}
