import type { ModifierFamily } from "@canonical/ds-types";
import type { ComponentProps, ReactNode } from "react";

export type * from "./common/Entry/types.js";
export type * from "./common/Segment/types.js";
export type { Condition, QueryChipFault } from "./common/types.js";

/** How a query chip's parts hold together. */
export type QueryChipUnity = "separated" | "joined";

/** The remove control: absent, or named by `removeLabel` on either route. */
type RemoveProps =
  | {
      /** Called by the remove control. */
      onRemove?: undefined;
      /** Makes the remove control a link to this address. */
      removeHref?: undefined;
      /** The remove control's accessible name. */
      removeLabel?: undefined;
    }
  | {
      /** Called by the remove control. Passing it shows the control. */
      onRemove: () => void;
      /**
       * Makes the remove control a link to this address, so that removal
       * works before scripts run; a click still calls `onRemove`.
       */
      removeHref?: string;
      /** The remove control's accessible name, such as "Remove status is deployed". */
      removeLabel: string;
    }
  | {
      /** Called by the remove control's click, when given. */
      onRemove?: () => void;
      /**
       * Makes the remove control a link to this address, so that removal
       * works before scripts run. Passing it shows the control.
       */
      removeHref: string;
      /** The remove control's accessible name, such as "Remove status is deployed". */
      removeLabel: string;
    };

/** QueryChip's own props. */
type OwnProps = {
  /** The chip's segments and at most one entry, in order. */
  children: ReactNode;
  /**
   * The chip's id, which also prefixes its parts' roving ids. Required
   * inside a roving toolbar.
   */
  id?: string;
  /** The whole clause, spoken as the name of the chip's parts. */
  label?: string;
  /**
   * The chip's Criticality value, read by every segment through the
   * modifier channels. Only `error` carries behaviour: the clause is refused,
   * and the first segment shows Error's glyph and gives the reason in its
   * `description`.
   */
  criticality?: ModifierFamily<"criticality">;
  /**
   * How the parts hold together: `separated` makes each segment its own
   * target, `joined` makes the chip one target.
   *
   * @default "separated"
   */
  unity?: QueryChipUnity;
  /** Disables the chip's parts and its remove control. */
  disabled?: boolean;
} & RemoveProps;

/**
 * QueryChip's props. The root is a `<span>` and takes its native props.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type QueryChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
