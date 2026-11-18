import type { QueryChipCondition } from "../../lib/_work_in_progress/QueryChip/index.js";

/** A part of a clause the person chooses. */
export type Part = "field" | "operator" | "value";

/** One clause, complete or still being built. */
export type Clause = {
  id: string;
  field: string;
  operator?: string;
  value?: string;
};

/** An operator, its words and its Condition value. */
export type Operator = {
  id: string;
  label: string;
  condition: QueryChipCondition;
};

/** The part being typed in a chip's Entry. */
export type Edit = {
  /** The chip's id. */
  id: string;
  /** The part the Entry takes. */
  part: Part;
  /** What is typed in the Entry. */
  text: string;
  /** Whether the clause is being built, rather than edited. */
  isDraft: boolean;
  /** The clause as it was before the edit, restored when it is cancelled. */
  original: Clause | undefined;
};

/** The whole state of a query being built. */
export type QueryState = {
  clauses: Clause[];
  /** What is typed in the free-text entry. */
  text: string;
  /** The chip Entry that is open, if any. */
  edit: Edit | undefined;
  /** The roving item that holds the stop. */
  activeItem: string;
  /** The Segment to focus once the stop is on its chip, after an edit. */
  focusPart: { id: string; part: Part } | undefined;
  /** The number the next clause's id takes. */
  nextId: number;
};

/** Everything that changes a query being built. */
export type QueryAction =
  | { type: "typeText"; text: string }
  | { type: "typePart"; text: string }
  | { type: "choose"; optionId: string }
  | { type: "editPart"; id: string; part: Part }
  | { type: "movePart"; backward: boolean; optionId?: string | undefined }
  | { type: "moveStop"; item: string }
  | { type: "cancelEdit" }
  | { type: "leave"; optionId?: string | undefined }
  | { type: "remove"; id: string }
  | { type: "clear" };

/** Props of the builder. */
export type QueryBuilderProps = {
  /** The clauses to start with. */
  initial?: Clause[] | undefined;
  /** The field's width, so a story can make chips overflow. */
  inlineSize?: string | undefined;
  /** Disables the field and every chip in it. */
  disabled?: boolean | undefined;
};
