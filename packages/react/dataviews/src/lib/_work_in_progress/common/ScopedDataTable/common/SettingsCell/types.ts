import type { ComponentProps } from "react";
import type { SettingsMenuProps } from "../SettingsMenu/index.js";

type OwnProps = {
  /** The menu's facts and commands. */
  readonly menu: SettingsMenuProps;
  /**
   * Attaches this cell to the table's geometry. The stylesheet sizes the
   * settings track, and the columns share whatever width it leaves.
   */
  readonly reserve: (cell: HTMLTableCellElement) => () => void;
};

/**
 * Props of the settings header cell: its own, and the native props of the
 * `div` it renders as its root. The cell owns its role, and its ref is the
 * table's geometry, so neither is taken.
 */
export type SettingsCellProps = OwnProps &
  Omit<ComponentProps<"th">, keyof OwnProps | "children" | "role" | "ref">;
