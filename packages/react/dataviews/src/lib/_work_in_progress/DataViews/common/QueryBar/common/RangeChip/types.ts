import type { KeyboardEvent } from "react";
import type {
  QueryBarDraft,
  QueryBarPart,
  QueryGroupStandIn,
  QueryRangeClause,
} from "../../types.js";
import type { QueryBarChipEdit } from "../QueryBarChip/index.js";

/** Props of a field's two bounds shown as one chip. */
export type RangeChipProps = {
  /** Where the range stands: its id and its two conjuncts. */
  readonly clause: QueryRangeClause;
  /** The query group the chip reads its bounds from. */
  readonly group: QueryGroupStandIn;
  /** The edit of one bound standing in the chip, or null. */
  readonly edit: QueryBarChipEdit | null;
  /** Called with a bound as it applies, and the part activated. */
  readonly onActivate: (draft: QueryBarDraft, part: QueryBarPart) => void;
  /** Called with the range by the remove control. */
  readonly onRemove: (clause: QueryRangeClause) => void;
  /** Called with the Entry's text after each input. */
  readonly onTypedChange: (text: string) => void;
  /** The Entry's keys, which the bar handles. */
  readonly onEntryKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};
