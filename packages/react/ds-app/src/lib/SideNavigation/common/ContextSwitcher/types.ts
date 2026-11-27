import type { ComponentProps, ReactNode } from "react";

/** A single entry in the context switcher's list — user-generated. */
export interface ContextSwitcherItem {
  /** Stable identity for the context (list key and selection matching). */
  key: string;
  /** Display name — also shown in the dropdown field when current. */
  name: string;
  /** The context's route, passed to onContextChange. */
  url?: string;
  /** Optional supporting text shown under the name in the list. */
  description?: string;
  /** Optional badge for dynamic/actionable information. */
  badge?: ReactNode;
}

type OwnProps = {
  /**
   * A caption rendered above the dropdown field (e.g. "Context") via
   * `SideNavigation.GroupHeader` — intrinsic to the component in the Figma
   * source, not a consumer composition. Omitted renders no caption.
   */
  title?: ReactNode;
  /** The currently selected context, shown in the dropdown field. */
  currentContext: ContextSwitcherItem;
  /** The user-generated list of available contexts. */
  contexts: ContextSwitcherItem[];
  /** Called when the user selects a different context from the list. */
  onContextChange?: (context: ContextSwitcherItem) => void;
  /** Called when the "create context" action is activated. Omit to hide it. */
  onCreateContext?: () => void;
  /** Label for the "create context" action. Defaults to `"Create context"`. */
  createContextLabel?: ReactNode;
};

/**
 * Extends `<div>`; the native `onSelect` is omitted, since
 * `onContextChange` chooses a context.
 */
export type ContextSwitcherProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "onSelect">;
