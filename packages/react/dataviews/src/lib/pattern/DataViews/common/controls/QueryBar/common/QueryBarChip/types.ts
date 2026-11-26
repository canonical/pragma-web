import type { KeyboardEvent } from "react";
import type {
  QueryBarDraft,
  QueryBarPart,
  QueryGroupStandIn,
  QueryPredicateClause,
  QuerySearchClause,
} from "../../types.js";

/** The session's Entry, while it stands in this chip. */
export type QueryBarChipEdit = {
  readonly draft: QueryBarDraft;
  readonly part: QueryBarPart;
  readonly typed: string;
  readonly invalid: string | null;
};

/** Props of one applied clause's chip. */
export type QueryBarChipProps = {
  /** Where the clause stands: its id and the conjunct it reads. */
  readonly clause: QueryPredicateClause | QuerySearchClause;
  /** The query group the chip reads its clause from. */
  readonly group: QueryGroupStandIn;
  /** The edit standing in the chip, or null while it shows what applies. */
  readonly edit: QueryBarChipEdit | null;
  /** Called with the clause as it applies, and the part activated. */
  readonly onActivate: (draft: QueryBarDraft, part: QueryBarPart) => void;
  /** Called with the clause as it applies, by the remove control. */
  readonly onRemove: (draft: QueryBarDraft) => void;
  /** Called with the Entry's text after each input. */
  readonly onTypedChange: (text: string) => void;
  /** The Entry's keys, which the bar handles. */
  readonly onEntryKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};
