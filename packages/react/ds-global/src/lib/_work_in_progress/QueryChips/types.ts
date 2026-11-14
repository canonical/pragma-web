import type { ComponentProps, ReactNode } from "react";

/** Exactly one of `label` and `aria-labelledby` names the list. */
type Name =
  | {
      /** The accessible name of the set. */
      label: string;
      /** The id of an element whose text names the set. */
      "aria-labelledby"?: never;
    }
  | {
      /** The accessible name of the set. */
      label?: never;
      /** The id of an element whose text names the set. */
      "aria-labelledby": string;
    };

/** QueryChips's own props. */
type OwnProps = {
  /** The query chips, one list item each. */
  children: ReactNode;
} & Name;

/**
 * QueryChips's props. The root is a `<ul>` and takes its native props, apart
 * from `role`, which the group fixes to `list`.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type QueryChipsProps = OwnProps &
  Omit<ComponentProps<"ul">, keyof OwnProps | "role">;
