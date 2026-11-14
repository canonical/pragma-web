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

/** A part's fault and its accessible description. */
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

/** What a chip shares with its parts. */
export type QueryChipContextValue = {
  /** The chip's id, which prefixes its parts' roving ids. */
  id?: string;
  /** Whether scripts have run. */
  isMounted: boolean;
  /** Whether the chip is disabled. */
  disabled: boolean;
};
