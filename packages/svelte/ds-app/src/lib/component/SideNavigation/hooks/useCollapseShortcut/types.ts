// Ported from @canonical/react-ds-app SideNavigation useCollapseShortcut

export interface UseCollapseShortcutProps {
  /**
   * The condition that activates the shortcut's listener — named for the
   * state it represents, not a bare on/off switch. Defaults to `false`;
   * `SideNavigation` passes its own `keyboardShortcut` prop (default
   * `true`). Read through a getter, so the listener follows the prop.
   */
  readonly condition?: boolean;
  /** Called when the shortcut is triggered. */
  ontrigger: () => void;
}

/** The hook attaches a window listener as a side effect; it returns nothing. */
export type UseCollapseShortcutResult = undefined;
