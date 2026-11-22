import type { SortDirection } from "@canonical/dataviews-core";

/** One value a header filter restricts its field to. */
export type HeaderOption = {
  readonly value: string;
  readonly label: string;
  /** Whether the restriction in force holds this value. */
  readonly applied: boolean;
  /** Where choosing it leads without scripts, or null where there is no location. */
  readonly href: string | null;
};

/** One filter of the header: a menu of the values its field may be restricted to. */
export type HeaderFilter = {
  /** The field the filter restricts. */
  readonly field: string;
  readonly label: string;
  readonly options: readonly HeaderOption[];
  /** Restricts the field to the value, or lifts the restriction where it is the one in force. */
  readonly onSelect: (value: string) => void;
  /** Why the last change was refused, while the query it was refused over stands. */
  readonly refusal: string | null;
};

/** The control lifting every restriction the header's filters hold. */
export type HeaderReset = {
  readonly onReset: () => void;
  readonly href: string | null;
};

/** The header's order control: the date's direction in force, and its toggle. */
export type HeaderOrder = {
  /** The direction the date leads the ordering in, or null where it does not lead it. */
  readonly direction: SortDirection | null;
  readonly onToggle: () => void;
  readonly refusal: string | null;
  /** Where the toggle leads without scripts, or null where there is no location. */
  readonly href: string | null;
};

/**
 * Props of the timeline's header.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the controls the source allows, not forwarding a caller's native props.
 */
export type HeaderProps = {
  readonly filters: readonly HeaderFilter[];
  /** The reset control, or null while no filter holds a restriction. */
  readonly reset: HeaderReset | null;
  /** The order control, or null where the source cannot order by the date. */
  readonly order: HeaderOrder | null;
  /** Whether scripts have taken over: menus and buttons, rather than links. */
  readonly hydrated: boolean;
};
