import {
  addressPredicate,
  canonicalizeSlice,
  type Predicate,
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
} from "./types.js";

/** One record with the address its predicate is found at. */
type AddressedInput = {
  readonly address: string;
  readonly input: FilterInput;
};

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
  for (const definition of schema.fields) {
    const byOperator: Record<string, FilterHandle<unknown>> = {};
    // Every kind accepts at least one operator, so every field has a handle.
    for (const operator of schema.listOperators(definition.field)) {
      const input = createFilterInput({
        schema,
        field: definition.field,
        operator,
        host,
      });
      records.push({
        address: addressPredicate(definition.field, operator),
        input,
      });
      // The handle alone: the predicate, its adoption and the session's end
      // stay with the records.
      const {
        setApplied: _adopt,
        predicate: _predicate,
        endSession: _end,
        ...handle
      } = input;
      byOperator[operator] = handle;
    }
    handles[definition.field] = byOperator;
  }

  /** Each applied predicate of a slice, by the address a record edits. */
  const readApplied = (slice: Slice): Map<string, Predicate> => {
    const applied = new Map<string, Predicate>();
    for (const predicate of canonicalizeSlice(slice).filter) {
      applied.set(
        addressPredicate(predicate.field, predicate.operator),
        predicate,
      );
    }
    return applied;
  };

  /**
   * Re-sync every record's applied mirror from the provider's slice. Built
   * once per sync: the slice is the same one for every record, and
   * canonicalizing it per record would rebuild it once per address.
   */
  let synced: Slice | null = null;
  const sync = (): void => {
    const { slice } = host.state.get();
    // The coordinator keeps the slice's identity while the slice stands, so
    // rows arriving, a refresh or a page move cost the records nothing.
    if (slice === synced) {
      return;
    }
    synced = slice;
    const applied = readApplied(slice);
    for (const { address, input } of records) {
      const predicate = applied.get(address) ?? null;
      // Only a predicate that moved is adopted: the record's own edit comes
      // back as the provider's copy, and adopting that would discard the
      // input and feedback the edit just produced.
      if (!isSamePredicate(predicate, input.predicate)) {
        input.setApplied(predicate);
      }
    }
  };
  sync();

  /**
   * Show what is applied in every input, dropping what was typed: Back,
   * Forward or a pasted URL is the reader's move to another query, so what
   * was being typed for the one they left — an invalid or half-typed value
   * — goes, even where the predicate did not move.
   */
  const dropTypedInput = (): void => {
    const applied = readApplied(host.state.get().slice);
    for (const { address, input } of records) {
      input.setApplied(applied.get(address) ?? null);
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
