import type { KeyboardEvent } from "react";
import type { QueryBarDraft, QueryBarPart } from "../../types.js";

/** Props of the chip a clause is built or edited in. */
export type DraftChipProps = {
  /** The chip's id, which prefixes its roving items. */
  readonly id: string;
  /** The clause the chip shows. */
  readonly draft: QueryBarDraft;
  /** The part its Entry takes, or null while it holds none. */
  readonly part: QueryBarPart | null;
  /** What is typed in the Entry. */
  readonly typed: string;
  /** Why the typed value cannot be read, once a commit tried it. */
  readonly invalid: string | null;
  /** Called with the part a Segment stands for when it is activated. */
  readonly onActivate: (part: QueryBarPart) => void;
  /** Called by the remove control. */
  readonly onRemove: () => void;
  /** Called with the Entry's text after each input. */
  readonly onTypedChange: (text: string) => void;
  /** The Entry's keys, which the bar handles. */
  readonly onEntryKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};
