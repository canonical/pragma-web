import {
  addressPredicate,
  canonicalizeSlice,
  OPERATOR_ARITY,
  type PredicateOperator,
  type Slice,
} from "../query/index.js";
import type { Schema, SchemaFieldDefinition } from "../schema/index.js";
import {
  OPERATOR_DELIMITER,
  QUERY_KEYS,
  SUFFIXED_OPERATORS,
} from "./constants.js";
import isOwnedKey from "./isOwnedKey.js";
import readKeyPredicate from "./readKeyPredicate.js";
import readWireKey from "./readWireKey.js";
import recordConjunct from "./recordConjunct.js";
import spellOperand from "./spellOperand.js";
import spellWireKey from "./spellWireKey.js";
import spellWireValues from "./spellWireValues.js";
import type { CarryingEncodeConfig, ReadPredicate } from "./types.js";

/**
 * One entry of a link under a filter key: its value as spelled and as the
 * field parses it, and whether the conjunct read from the slot takes it.
 */
type SlotEntry = {
  readonly position: number;
  readonly key: string;
  readonly value: string;
  readonly read: string;
  readonly taken: boolean;
};

/**
 * The keys a link spells one conjunct with, in link order, whether any of
 * them is carried, and the conjunct they read as, spelled, or null.
 */
type Slot = {
  readonly entries: readonly SlotEntry[];
  readonly carried: boolean;
  readonly reading: readonly string[] | null;
};

/** Slots by address, then by the ordinal their keys read as. */
type Slots = ReadonlyMap<string, ReadonlyMap<number, Slot>>;

/** A filter key as the grammar spells it: its field, operator and ordinal. */
type FilterKey = {
  readonly definition: SchemaFieldDefinition;
  readonly operator: PredicateOperator;
  readonly ordinal: number;
};

/** One parameter of the link as spelled, at its place in the link. */
type LinkEntry = {
  readonly position: number;
  readonly key: string;
  readonly value: string;
};

/** A link's slots, and the slot and entry at each place a slot holds. */
type SlotReading = {
  readonly slots: Slots;
  readonly placed: ReadonlyMap<
    number,
    { readonly slot: Slot; readonly entry: SlotEntry }
  >;
};

/** The conjuncts at one address, spelled as the wire spells them. */
type SpelledAddress = {
  readonly field: string;
  readonly operator: PredicateOperator;
  readonly conjuncts: readonly (readonly string[])[];
};

/**
 * What a carried slot was read as: the applied conjunct, or null when none
 * applied, and whether the destination still holds it.
 */
type Claim = {
  readonly applied: readonly string[] | null;
  readonly kept: boolean;
};

/**
 * The field, operator and ordinal a filter key spells, or null: a bare name
 * is any-of, a suffix is one of the grammar's operators, and anything else
 * — a field the schema does not declare, or no ordinal — spells none.
 */
const readFilterKey = (
  key: string,
  schema: Schema<readonly SchemaFieldDefinition[]>,
): FilterKey | null => {
  const { field, operator, ordinal } = readWireKey(key);
  const spelled: PredicateOperator | undefined =
    operator === null
      ? "isAny"
      : SUFFIXED_OPERATORS.find((candidate) => candidate === operator);
  const definition = schema.findField(field);
  if (spelled === undefined || ordinal === null || definition === undefined) {
    return null;
  }
  return { definition, operator: spelled, ordinal };
};

/**
 * One carried value as the grammar reads it at its address, so `5.0` reads
 * as the `5` a bound holds; a value the field refuses stays as spelled.
 */
const spellReadValue = (
  schema: Schema<readonly SchemaFieldDefinition[]>,
  field: string,
  operator: PredicateOperator,
  value: string,
): string => {
  const parsed = schema.validateInput(field, value);
  const [operand] = parsed.status === "valid" ? parsed.operands : [];
  if (operand === undefined) {
    return value;
  }
  return OPERATOR_ARITY[operator] === "many"
    ? String(operand)
    : spellOperand(operand);
};

/**
 * One slot's entries read as the decoder reads them, key by key in link
 * order: the conjunct they spell, and which entries it takes. Pure.
 */
const readSlot = (
  raw: readonly LinkEntry[],
  carried: boolean,
  schema: Schema<readonly SchemaFieldDefinition[]>,
  { definition, operator }: FilterKey,
): Slot => {
  const byKey = new Map<string, LinkEntry[]>();
  for (const entry of raw) {
    byKey.set(entry.key, [...(byKey.get(entry.key) ?? []), entry]);
  }
  let filter: readonly ReadPredicate[] = [];
  const taken = new Set<LinkEntry>();
  for (const [key, entries] of byKey) {
    const { conjunct } = readKeyPredicate(
      key,
      entries.map(({ value }) => value),
      schema,
      definition,
    );
    if (conjunct === null) {
      continue;
    }
    const recorded = recordConjunct(filter, key, conjunct);
    filter = recorded.filter;
    if (recorded.record !== "repeated") {
      for (const [at, entry] of entries.entries()) {
        if (conjunct.taken.includes(at)) {
          taken.add(entry);
        }
      }
    }
  }
  const [read] = filter;
  return {
    entries: raw.map((entry) => ({
      position: entry.position,
      key: entry.key,
      value: entry.value,
      read: spellReadValue(schema, definition.field, operator, entry.value),
      taken: taken.has(entry),
    })),
    carried,
    // Read as canonical form reads it: a set's repeats are one option.
    reading:
      read === undefined ? null : [...new Set(spellWireValues(read.predicate))],
  };
};

/**
 * The slots of a link's filter keys: every spelling of one conjunct folds
 * into one, carried when any of its keys is, and read as the decoder reads
 * it. Pure.
 */
const readSlots = (
  params: URLSearchParams,
  carried: ReadonlySet<string>,
  schema: Schema<readonly SchemaFieldDefinition[]>,
): SlotReading => {
  const raw = new Map<
    string,
    Map<number, { readonly spelled: FilterKey; readonly entries: LinkEntry[] }>
  >();
  for (const [position, [key, value]] of [...params].entries()) {
    const spelled = readFilterKey(key, schema);
    if (spelled === null) {
      continue;
    }
    const address = addressPredicate(
      spelled.definition.field,
      spelled.operator,
    );
    const byOrdinal = raw.get(address) ?? new Map();
    const group = byOrdinal.get(spelled.ordinal) ?? { spelled, entries: [] };
    group.entries.push({ position, key, value });
    byOrdinal.set(spelled.ordinal, group);
    raw.set(address, byOrdinal);
  }
  const slots = new Map<string, Map<number, Slot>>();
  const placed = new Map<number, { slot: Slot; entry: SlotEntry }>();
  for (const [address, byOrdinal] of raw) {
    const read = new Map<number, Slot>();
    for (const [ordinal, { spelled, entries }] of byOrdinal) {
      const slot = readSlot(
        entries,
        entries.some(({ key }) => carried.has(key)),
        schema,
        spelled,
      );
      read.set(ordinal, slot);
      for (const entry of slot.entries) {
        placed.set(entry.position, { slot, entry });
      }
    }
    slots.set(address, read);
  }
  return { slots, placed };
};

/** The conjuncts of a slice spelled as the wire spells them, by address. */
const spellConjuncts = (slice: Slice): ReadonlyMap<string, SpelledAddress> => {
  const byAddress = new Map<string, SpelledAddress>();
  for (const predicate of canonicalizeSlice(slice).filter) {
    const { field, operator } = predicate;
    const address = addressPredicate(field, operator);
    const spelled = byAddress.get(address);
    byAddress.set(address, {
      field,
      operator,
      conjuncts: [...(spelled?.conjuncts ?? []), spellWireValues(predicate)],
    });
  }
  return byAddress;
};

/** Whether two spelled conjuncts hold the same values. */
const isSameConjunct = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value) => b.includes(value));

/**
 * What each carried slot was read as: the unclaimed applied conjunct equal
 * to its reading, else a claimed equal one, since A AND A is A, else none.
 * Pure.
 */
const claimSlots = (
  slots: Slots,
  applied: ReadonlyMap<string, SpelledAddress>,
  destination: ReadonlyMap<string, SpelledAddress>,
): ReadonlyMap<Slot, Claim> => {
  const claims = new Map<Slot, Claim>();
  for (const [address, byOrdinal] of slots) {
    const conjuncts = applied.get(address)?.conjuncts ?? [];
    const kept = destination.get(address)?.conjuncts ?? [];
    const claimed = new Set<number>();
    for (const slot of byOrdinal.values()) {
      const { reading } = slot;
      if (!slot.carried || reading === null) {
        if (slot.carried) {
          claims.set(slot, { applied: null, kept: false });
        }
        continue;
      }
      const equal = [...conjuncts.entries()].filter(([, values]) =>
        isSameConjunct(values, reading),
      );
      const [at, values] = equal.find(([index]) => !claimed.has(index)) ??
        equal.at(0) ?? [-1, null];
      claimed.add(at);
      claims.set(slot, {
        applied: values,
        kept:
          values !== null &&
          kept.some((other) => isSameConjunct(other, values)),
      });
    }
  }
  return claims;
};

/** The claim of a carried slot, which `claimSlots` always sets. */
const readClaim = (claims: ReadonlyMap<Slot, Claim>, slot: Slot): Claim => {
  const claim = claims.get(slot);
  /* v8 ignore next 3 -- unreachable: claimSlots claims every carried slot */
  if (claim === undefined) {
    throw new Error("a carried slot has no claim");
  }
  return claim;
};

/**
 * One slice's filters and search as the grammar spells them: a conjunct a
 * kept slot holds is left to it, and the rest take ordinals no carried slot
 * holds.
 */
const spellClauses = (
  destination: ReadonlyMap<string, SpelledAddress>,
  search: string | null,
  slots: Slots,
  claims: ReadonlyMap<Slot, Claim>,
): URLSearchParams => {
  const spelled = new URLSearchParams();
  for (const [address, { field, operator, conjuncts }] of destination) {
    const carried = [...(slots.get(address) ?? [])].filter(
      ([, slot]) => slot.carried,
    );
    const left = conjuncts.filter(
      (values) =>
        !carried.some(([, slot]) => {
          const { applied, kept } = readClaim(claims, slot);
          return kept && applied !== null && isSameConjunct(values, applied);
        }),
    );
    const reserved = new Set(carried.map(([ordinal]) => ordinal));
    let free = 0;
    for (const values of left) {
      while (reserved.has(free)) {
        free += 1;
      }
      const key = spellWireKey(field, operator, free);
      free += 1;
      for (const value of values) {
        spelled.append(key, value);
      }
    }
  }
  if (search !== null) {
    spelled.set(QUERY_KEYS.search, search);
  }
  return spelled;
};

/** What the preserve step reads: the link and what was claimed of it. */
type PreserveConfig = {
  readonly schema: Schema<readonly SchemaFieldDefinition[]>;
  readonly preserve: URLSearchParams;
  readonly carried: ReadonlySet<string>;
  readonly placed: SlotReading["placed"];
  readonly claims: ReadonlyMap<Slot, Claim>;
  readonly appliedSearch: string | null;
};

/**
 * The link's parameters that stay: the host's, and each carried clause
 * where it stood. A kept slot's applied values stay, a bound or option
 * respelled as read, and leave with it otherwise; the applied search is
 * matched once, so a refused repeat stays.
 */
const keepPreserved = (config: PreserveConfig): URLSearchParams => {
  const { schema, preserve, carried, placed, claims } = config;
  let search = config.appliedSearch;
  const params = new URLSearchParams();
  for (const [position, [key, value]] of [...preserve].entries()) {
    if (!isOwnedKey(key, schema)) {
      params.append(key, value);
      continue;
    }
    const place = placed.get(position);
    if (place === undefined || !place.slot.carried) {
      if (key === QUERY_KEYS.search && value === search) {
        // The search the destination writes, matched once.
        search = null;
      } else if (carried.has(key)) {
        params.append(key, value);
      }
      continue;
    }
    const { applied, kept } = readClaim(claims, place.slot);
    if (place.entry.taken && applied !== null) {
      // The applied conjunct's own values: respelled while the destination
      // holds it, and gone with it otherwise.
      if (kept) {
        params.append(key, place.entry.read);
      }
    } else if (carried.has(key)) {
      params.append(key, value);
    }
  }
  return params;
};

/**
 * Write one query and its window as URL parameters, as `encodeQuery` does,
 * keeping a followed link's refused clauses where they stood: a carried
 * conjunct keeps its keys, and loses the values the destination no longer
 * applies.
 */
export default function encodeCarryingQuery(
  config: CarryingEncodeConfig,
): URLSearchParams {
  const { schema, slice, window } = config;
  const carried = new Set(config.carry);
  const preserve = new URLSearchParams(config.preserve);
  const { slots, placed } = readSlots(preserve, carried, schema);
  const destination = spellConjuncts(slice);
  const claims = claimSlots(slots, spellConjuncts(config.applied), destination);
  const canonical = canonicalizeSlice(slice);
  const written = spellClauses(destination, canonical.search, slots, claims);
  const params = keepPreserved({
    schema,
    preserve,
    carried,
    placed,
    claims,
    appliedSearch: canonicalizeSlice(config.applied).search,
  });
  for (const term of canonical.sort) {
    written.append(
      QUERY_KEYS.sort,
      `${term.field}${OPERATOR_DELIMITER}${term.direction}`,
    );
  }
  for (const term of canonical.group) {
    written.append(QUERY_KEYS.group, term.field);
  }
  // Written whenever given: a window read back is the window that was
  // displayed, never a default the reader has to know. Collapse is left
  // out, so a reload expands every group.
  if (window !== null) {
    written.set(QUERY_KEYS.page, String(window.page));
    written.set(QUERY_KEYS.size, String(window.size));
    if (window.cursor !== null) {
      written.set(QUERY_KEYS.cursor, window.cursor);
    }
  }
  for (const key of new Set(written.keys())) {
    const values = written.getAll(key);
    // A carried key keeps, after what is written, what it carried beyond
    // what was applied: a refused repeat stands beside the written value.
    const kept = carried.has(key) ? params.getAll(key) : [];
    params.delete(key);
    for (const value of [...values, ...kept]) {
      params.append(key, value);
    }
  }
  return params;
}
