/**
 * Types shared by QueryChip's parts: the Condition values an operator
 * segment takes, the fault a part may carry, and the context the chip
 * shares with its parts.
 */

/**
 * A Condition value: what a clause's operator asserts about a record.
 *
 * @experimental Local until @canonical/ds-types lists the Condition family.
 */
export type Condition =
  | "inclusion"
  | "exclusion"
  | "match"
  | "range"
  | "presence";

/**
 * A part's fault and its accessible description.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type QueryChipFault =
  | {
      /** Marks the part at fault. */
      invalid?: false;
      /**
       * The part's accessible description; on a refused chip's first
       * segment, the reason, such as "Refused: …".
       */
      description?: string;
    }
  | {
      /** Marks the part at fault. */
      invalid: true;
      /** Why the part is at fault, such as "Invalid: …". */
      description: string;
    };

/** What a chip shares with each of its parts. */
export type QueryChipPartContextValue = {
  /** The chip's id, which names its toolbar item. */
  id?: string | undefined;
  /** Whether scripts have run. */
  isMounted: boolean;
  /** Whether the chip is disabled. */
  disabled: boolean;
  /** Whether this part is the chip's toolbar item. */
  isItem: boolean;
  /** Whether this part is the first Segment of a refused chip, which shows Error's glyph. */
  isRefusedReason: boolean;
  /** The id this part gives its description, stable across server and client. */
  descriptionId?: string | undefined;
  /**
   * The description ids of the chip's other parts at fault, which describe
   * the first Segment too, because focus lands there first.
   */
  faultIds: string[];
};
