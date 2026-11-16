import type { ComponentProps, ReactElement } from "react";
import type { SettingsMenuProps } from "../SettingsMenu/index.js";

type OwnProps = {
  /** What the table was given as its `settings`, drawn in the cell. */
  readonly settings: ReactElement;
  /** The menu's facts and commands, which what is drawn in the cell reads. */
  readonly menu: SettingsMenuProps;
  /**
   * Attaches this cell to the table's geometry. The stylesheet sizes the
   * settings track, and the columns share whatever width it leaves.
   */
  readonly reserve: (cell: HTMLDivElement) => () => void;
};

/**
 * Props of the settings header cell: its own, and the native props of the
 * `div` it renders as its root. The cell owns its role, and its ref is the
 * table's geometry, so neither is taken.
 */
export type SettingsCellProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children" | "role" | "ref">;
