import {
  type Channel,
  createChannel,
  protectChannel,
} from "../observable/index.js";
import {
  addressPredicate,
  areListsEqual,
  canonicalizeSlice,
  listConjuncts,
  type Predicate,
  type PredicateOperand,
  type PredicateOperator,
  type Slice,
} from "../query/index.js";
import type { RowRecord } from "../rows/index.js";
import type { SchemaFieldDefinition } from "../schema/index.js";
import createFilterInput from "./createFilterInput.js";
import isSamePredicate from "./isSamePredicate.js";
import type {
  FilterHandle,
  FilterInput,
  FilterInputs,
  FilterInputsConfig,
  FurtherConjunct,
} from "./types.js";

/**
 * One record with the address its conjunct is found at, the further
 * conjuncts there it does not edit, and the place of its own.
 */
type AddressedInput = {
  readonly address: string;
  readonly input: FilterInput;
  readonly others: Channel<readonly FurtherConjunct[]>;
  readonly nth: Channel<number>;
};

/** Where one record stands: its conjunct and place, and the rest beside it. */
type Placement = {
  readonly own: Predicate | null;
  readonly nth: number;
  readonly others: readonly FurtherConjunct[];
};

const NO_CONJUNCTS: readonly FurtherConjunct[] = Object.freeze([]);

const areOperandsSame = (a: PredicateOperand, b: PredicateOperand): boolean =>
  Object.is(a, b);

/**
 * Two lists of further conjuncts alike place by place. Both are read from
 * canonical copies, so a set's members are in one order and compared as
 * they stand.
 */
const areOthersEqual = (
  a: readonly FurtherConjunct[],
  b: readonly FurtherConjunct[],
): boolean =>
  areListsEqual(
    a,
    b,
    (left, right) =>
      left.nth === right.nth &&
      areListsEqual(left.operands, right.operands, areOperandsSame),
  );

/**
 * Create the filter records of one mounted root: one per field and legal
 * operator of the provider's schema, editing the provider's query through
 * its host. The records are the root's, not the provider's — two roots on
 * one provider share the applied query and never each other's half-typed
 * input — and `observe()` keeps every applied mirror in step with the
 * query as the location, a saved view or a reset moves it. A move of the
 * location — Back, Forward, a pasted URL — also ends every input session:
 * what was being typed goes, and each input shows what is applied.
 *
 * Construction reads the query once and subscribes to nothing.
 *
 * @note Impure by design: the records hold what a person is typing, and
 * observing subscribes to the provider's state and its transitions.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createFilterInputs<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>(config: FilterInputsConfig<TFields, TRow>): FilterInputs<TFields> {
  const { host } = config;
  const { schema } = host.collection;
  const records: AddressedInput[] = [];
  const handles: Record<string, Record<string, FilterHandle<unknown>>> = {};
  const createRecord = (
    field: string,
    operator: PredicateOperator,
  ): FilterHandle<unknown> => {
    const input = createFilterInput({
      schema,
      field,
      operator,
      host,
      readConjuncts: () =>
        listConjuncts(host.state.get().slice, field, operator),
    });
    const others = createChannel<readonly FurtherConjunct[]>(NO_CONJUNCTS, {
      equals: areOthersEqual,
    });
    const nth = createChannel(0);
    records.push({
      address: addressPredicate(field, operator),
      input,
      others,
      nth,
    });
    // The handle alone: the predicate, its adoption and the session's end
    // stay with the records.
    const {
      setApplied: _adopt,
      predicate: _predicate,
      endSession: _end,
      ...handle
    } = input;
    return {
      ...handle,
      others: protectChannel(others),
      nth: protectChannel(nth),
    };
  };
  for (const definition of schema.fields) {
    const byOperator: Record<string, FilterHandle<unknown>> = {};
    // Every kind accepts at least one operator, so every field has a handle.
    for (const operator of schema.listOperators(definition.field)) {
      byOperator[operator] = createRecord(definition.field, operator);
    }
    handles[definition.field] = byOperator;
  }

  /**
   * The conjuncts a slice holds, by their address, in canonical order.
   * Built once per read: the slice is the same one for every record, and
   * canonicalizing it per record would rebuild it once per address.
   */
  const groupConjuncts = (slice: Slice): Map<string, Predicate[]> => {
    const grouped = new Map<string, Predicate[]>();
    for (const predicate of canonicalizeSlice(slice).filter) {
      const address = addressPredicate(predicate.field, predicate.operator);
      const conjuncts = grouped.get(address);
      if (conjuncts === undefined) {
        grouped.set(address, [predicate]);
      } else {
        conjuncts.push(predicate);
      }
    }
    return grouped;
  };

  /**
   * Where a record stands among the conjuncts at its address. Following,
   * it keeps the conjunct it edits while that conjunct stands — an edit
   * canonical order moves past another conjunct stays under the cursor —
   * and otherwise takes the first; not following, it takes the first.
   */
  const place = (
    conjuncts: readonly Predicate[],
    record: FilterInput,
    follow: boolean,
  ): Placement => {
    const kept = follow
      ? conjuncts.findIndex((predicate) =>
          isSamePredicate(predicate, record.predicate),
        )
      : -1;
    const at = kept === -1 ? 0 : kept;
    return {
      own: conjuncts.at(at) ?? null,
      nth: at,
      others: conjuncts.flatMap((predicate, nth) =>
        nth === at ? [] : [{ nth, operands: predicate.operands }],
      ),
    };
  };

  /** Re-sync every record's applied mirror from the provider's slice. */
  let synced: Slice | null = null;
  const sync = (): void => {
    const { slice } = host.state.get();
    // The coordinator keeps the slice's identity while the slice stands, so
    // rows arriving, a refresh or a page move cost the records nothing.
    if (slice === synced) {
      return;
    }
    synced = slice;
    const grouped = groupConjuncts(slice);
    for (const { address, input, others, nth } of records) {
      const placed = place(grouped.get(address) ?? [], input, true);
      // Only a predicate that moved is adopted: the record's own edit comes
      // back as the provider's copy, and adopting that would discard the
      // input and feedback the edit just produced.
      if (!isSamePredicate(placed.own, input.predicate)) {
        input.setApplied(placed.own);
      }
      others.set(placed.others);
      nth.set(placed.nth);
    }
  };
  sync();

  /**
   * Show what is applied in every input, dropping what was typed: Back,
   * Forward or a pasted URL is the reader's move to another query, so what
   * was being typed for the one they left — an invalid or half-typed value
   * — goes, even where the predicate did not move. Each record takes the
   * first conjunct at its address, as a fresh reading of the link would.
   */
  const dropTypedInput = (): void => {
    const grouped = groupConjuncts(host.state.get().slice);
    for (const { address, input, others, nth } of records) {
      const placed = place(grouped.get(address) ?? [], input, false);
      input.setApplied(placed.own);
      others.set(placed.others);
      nth.set(placed.nth);
    }
  };

  return {
    // Built by walking `schema.fields`, so it holds exactly the schema's
    // own literal keys and their operators; the map type is what the walk
    // can say, and this is what the walk in fact produced.
    handles: handles as FilterInputs<TFields>["handles"],
    endSessions(): void {
      for (const { input } of records) {
        input.endSession();
      }
    },
    observe(): () => void {
      // The query may have moved while nothing was following it.
      sync();
      // Their own closures, never the shared functions: a channel holds its
      // listeners in a set, so two observations subscribing one reference
      // would register once and the first release deafen the second.
      const stopState = host.state.subscribe(() => {
        sync();
      });
      const stopTransitions = host.transitions.subscribe(() => {
        if (host.transitions.get()?.cause === "adopt") {
          dropTypedInput();
        }
      });
      return () => {
        stopState();
        stopTransitions();
      };
    },
  };
}
