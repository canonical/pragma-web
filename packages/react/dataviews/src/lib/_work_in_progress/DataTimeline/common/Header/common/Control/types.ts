import type { ReactNode } from "react";

/**
 * Props of one header control: a link before scripts take over, a button
 * after.
 *
 * Exempt from the native-prop extension convention: an internal part whose
 * root changes element as scripts take over, forwarding no caller's native
 * props.
 */
export type ControlProps = {
  /** Where the control leads without scripts, or null where there is no location. */
  readonly href: string | null;
  readonly hydrated: boolean;
  /** The control's accessible name, where its visible label may be hidden. */
  readonly label?: string;
  readonly describedBy?: string | undefined;
  readonly onActivate: () => void;
  readonly children: ReactNode;
};
