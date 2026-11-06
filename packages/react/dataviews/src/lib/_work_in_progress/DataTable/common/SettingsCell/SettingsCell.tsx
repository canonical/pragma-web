import { type ReactElement, useMemo } from "react";
import { SettingsMenuContext } from "../../../../common/index.js";
import { SettingsMenu } from "../SettingsMenu/index.js";
import type { SettingsCellProps } from "./types.js";

const componentCssClassName = "ds data-table-settings-cell";

/**
 * The header's settings cell, ending the header row: it draws what the table
 * was given as its settings, and hands that the table's settings menu,
 * rendered, one element while the menu's facts and commands hold.
 *
 * `import { DataTable } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_table-settings_cell
 */
export default function SettingsCell({
  settings,
  menu,
  reserve,
  className,
  ...rest
}: SettingsCellProps): ReactElement {
  const rendered = useMemo(() => <SettingsMenu {...menu} />, [menu]);
  return (
    // biome-ignore lint/a11y/useSemanticElements: <th> is only valid inside a <table>, and this grid is deliberately not one
    // biome-ignore lint/a11y/useFocusableInteractive: the header is structure, not a widget — its menu's button carries the focus
    <div
      {...rest}
      role="columnheader"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      ref={reserve}
    >
      <SettingsMenuContext value={rendered}>{settings}</SettingsMenuContext>
    </div>
  );
}
