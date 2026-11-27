import type { MenuItem } from "@canonical/react-ds-global";
import type { ComponentProps, ReactNode } from "react";
import type { ContextSwitcherItem } from "../../types.js";

/** A menu entry with a context's description, badge and current mark. */
export type ContextMenuItem = MenuItem & {
  /** The context the entry chooses; absent on "create context". */
  context?: ContextSwitcherItem;
  /** Supporting text under the name. */
  description?: ContextSwitcherItem["description"];
  /** A badge beside the name. */
  badge?: ContextSwitcherItem["badge"];
  /** Whether the entry is the current context. */
  isCurrent?: boolean;
  /** "Create context" only: the visible label; `label` stays plain text. */
  renderLabel?: ReactNode;
};

type OwnProps = {
  /** The entry, a {@link ContextMenuItem}. */
  item: MenuItem;
};

/** The renderer's props: the menu entry it draws, and its span's props. */
export type ItemContentProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps | "children">;
