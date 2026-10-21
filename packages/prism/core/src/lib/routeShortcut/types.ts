/** A route table's shortcut allocation, read both ways. */
export interface ShortcutAllocation<TName extends string = string> {
  /** key → route name: what a keystroke resolves against. */
  readonly byKey: ReadonlyMap<string, TName>;
  /** route name → key: what a display reads. */
  readonly byRoute: ReadonlyMap<TName, string>;
}
