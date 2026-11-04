import addressPredicate from "./addressPredicate.js";
import areListsEqual from "./areListsEqual.js";
import arePredicatesEqual from "./arePredicatesEqual.js";
import areSlicesEqual from "./areSlicesEqual.js";
import collapseSortTerms from "./collapseSortTerms.js";
import { OPERATOR_ARITY } from "./constants.js";
import listConjuncts from "./listConjuncts.js";
import rejectOperandArity from "./rejectOperandArity.js";
import rejectWindow from "./rejectWindow.js";
import type {
  GroupPath,
  Predicate,
  PredicateRef,
  QueryCommand,
  QueryCommandResult,
  ResultWindow,
  SetOperator,
  Slice,
} from "./types.js";

/** Commands that address the query rather than the window. */
type SliceCommand = Exclude<
  QueryCommand,
  { kind: "navigateWindow" } | { kind: "setCollapsed" }
>;

/** Validate one predicate against the bounded grammar. */
const predicateRejection = (predicate: Predicate): string | null => {
  if (predicate.field === "") {
    return "predicate field must not be empty";
  }
  if (predicate.field.includes("\u0000")) {
    return "predicate field must not contain NUL characters";
  }
  if (
    predicate.operands.some(
      (operand) => typeof operand === "number" && !Number.isFinite(operand),
    )
  ) {
    return "predicate operands must be finite numbers";
  }
  if (!Object.hasOwn(OPERATOR_ARITY, predicate.operator)) {
    return `unknown predicate operator ${String(predicate.operator)}`;
  }
  return rejectOperandArity(predicate.operator, predicate.operands.length);
};

/**
 * The window a changed result set is read through: the first page, from the
 * start, so a token minted for one page never addresses another. Collapse
 * survives, because a collapsed group is still that group after a filter.
 */
const firstPage = (window: ResultWindow): ResultWindow => ({
  ...window,
  page: 1,
  cursor: null,
});

/** Why a conjunct's place is not one, or null when it is. */
const rejectNth = (nth: number | undefined): string | null =>
  nth === undefined || (Number.isSafeInteger(nth) && nth >= 0)
    ? null
    : `a conjunct's place must be a whole number from 0, not ${nth}`;

/** The slice's filter less every copy of one conjunct. */
const withoutConjunct = (
  filter: readonly Predicate[],
  conjunct: Predicate,
): readonly Predicate[] =>
  filter.filter((predicate) => !arePredicatesEqual(predicate, conjunct));

/**
 * Why a list of refs names no conjuncts of the slice as it stands, or
 * null: a ref repeated, or past the conjuncts at its address, names a slice
 * that has moved since it was read.
 */
const rejectRefs = (
  slice: Slice,
  refs: readonly PredicateRef[],
): string | null => {
  const named = new Set<string>();
  for (const ref of refs) {
    const rejection = rejectNth(ref.nth);
    if (rejection !== null) {
      return rejection;
    }
    const key = `${addressPredicate(ref.field, ref.operator)}\u0000${ref.nth}`;
    if (named.has(key)) {
      return `conjunct ${ref.nth} of ${ref.field} ${ref.operator} is named twice`;
    }
    named.add(key);
    if (listConjuncts(slice, ref.field, ref.operator).length <= ref.nth) {
      return `${ref.field} ${ref.operator} holds no conjunct ${ref.nth}`;
    }
  }
  return null;
};

/** The conjuncts a list of refs names, as the slice stands. */
const resolveRefs = (
  slice: Slice,
  refs: readonly PredicateRef[],
): readonly Predicate[] =>
  refs.flatMap((ref) =>
    listConjuncts(slice, ref.field, ref.operator).filter(
      (_, nth) => nth === ref.nth,
    ),
  );

/**
 * Replace the conjunct at `nth` of the predicate's address, or add it where
 * the address holds none, and drop the set under `replaces`.
 */
const setPredicate = (
  slice: Slice,
  predicate: Predicate,
  nth: number,
  replaces: SetOperator | undefined,
): Slice => {
  const replaced = listConjuncts(slice, predicate.field, predicate.operator).at(
    nth,
  );
  const kept =
    replaced === undefined
      ? slice.filter
      : withoutConjunct(slice.filter, replaced);
  return {
    ...slice,
    filter: [
      ...(replaces === undefined
        ? kept
        : kept.filter(
            (existing) =>
              existing.field !== predicate.field ||
              existing.operator !== replaces,
          )),
      predicate,
    ],
  };
};

const collapsedEquals = (
  a: readonly GroupPath[],
  b: readonly GroupPath[],
): boolean =>
  areListsEqual(a, b, (left, right) => areListsEqual(left, right, Object.is));

/**
 * Apply one addressed query command as a coherent transition: a changed
 * query resets the window to its first page, window-only commands leave the
 * query untouched, and a semantically unchanged edit changes nothing.
 * Commands that violate the bounded grammar (empty fields, wrong arities,
 * non-finite numbers, non-positive or fractional window values, an empty
 * cursor token) are rejected with the input state unchanged, and so is one
 * naming a conjunct the slice does not hold: a place that is no whole
 * number, one past the conjuncts at its address, or a conjunct an edit
 * names twice.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function applyQueryCommand(
  slice: Slice,
  window: ResultWindow,
  command: QueryCommand,
): QueryCommandResult {
  if (command.kind === "navigateWindow") {
    const page = command.page ?? window.page;
    const size = command.size ?? window.size;
    const rejection = rejectWindow({
      page,
      size,
      cursor: command.cursor ?? null,
    });
    if (rejection !== null) {
      return rejected(slice, window, rejection);
    }
    // A token addresses one page start, so moving without supplying one
    // leaves no token behind to describe the page that was left.
    const cursor =
      command.cursor !== undefined
        ? command.cursor
        : page === window.page && size === window.size
          ? window.cursor
          : null;
    return {
      status: "accepted",
      slice,
      window: { ...window, page, size, cursor },
      sliceChanged: false,
      windowChanged:
        page !== window.page ||
        size !== window.size ||
        cursor !== window.cursor,
    };
  }

  if (command.kind === "setCollapsed") {
    if (collapsedEquals(window.collapsed, command.collapsed)) {
      return {
        status: "accepted",
        slice,
        window,
        sliceChanged: false,
        windowChanged: false,
      };
    }
    // Collapse changes which rows the pages hold, exactly as a filter does,
    // so the window returns to its first page for the same reason.
    return {
      status: "accepted",
      slice,
      window: {
        ...firstPage(window),
        collapsed: command.collapsed.map((path) => [...path]),
      },
      sliceChanged: false,
      windowChanged: true,
    };
  }

  const rejection = commandRejection(slice, command);
  if (rejection !== null) {
    return rejected(slice, window, rejection);
  }

  const nextSlice = applyToSlice(slice, command);
  if (areSlicesEqual(slice, nextSlice)) {
    // A semantically unchanged edit is not a request and not a history entry.
    return {
      status: "accepted",
      slice,
      window,
      sliceChanged: false,
      windowChanged: false,
    };
  }
  // Grouping decides what a collapsed path names, so changing it leaves no
  // path that still means what it meant.
  const nextWindow =
    command.kind === "setGroup"
      ? { ...firstPage(window), collapsed: [] }
      : firstPage(window);
  return {
    status: "accepted",
    slice: nextSlice,
    window: nextWindow,
    sliceChanged: true,
    windowChanged:
      window.page !== nextWindow.page ||
      window.cursor !== nextWindow.cursor ||
      window.collapsed.length !== nextWindow.collapsed.length,
  };
}

const commandRejection = (
  slice: Slice,
  command: SliceCommand,
): string | null => {
  switch (command.kind) {
    case "setPredicate": {
      // A move replaces the other set operator on the field, nothing else:
      // never itself, and never a restriction of another kind.
      if (
        command.replaces !== undefined &&
        (OPERATOR_ARITY[command.replaces] !== "many" ||
          OPERATOR_ARITY[command.predicate.operator] !== "many" ||
          command.replaces === command.predicate.operator)
      ) {
        return "a set moves only onto the other set operator on its field";
      }
      const nth = command.nth ?? 0;
      const rejection = rejectNth(nth) ?? predicateRejection(command.predicate);
      if (rejection !== null) {
        return rejection;
      }
      // A conjunct is replaced where it stands, or the first added where
      // none does; a place past those is a slice that has moved.
      const { field, operator } = command.predicate;
      const count = listConjuncts(slice, field, operator).length;
      return nth < count || nth === 0
        ? null
        : `${field} ${operator} holds no conjunct ${nth}`;
    }
    case "removePredicate":
      // Removal may address out-of-grammar predicates (for example one
      // installed by an unvalidated adopt): it cleans up by exact address
      // and cannot create a collision. A conjunct already gone is no
      // change.
      return rejectNth(command.nth);
    case "editPredicates": {
      const rejection = rejectRefs(slice, command.remove);
      if (rejection !== null) {
        return rejection;
      }
      for (const predicate of command.add) {
        const rejection = predicateRejection(predicate);
        if (rejection !== null) {
          return rejection;
        }
      }
      return null;
    }
    case "setSort":
      return command.sort.some((term) => term.field === "")
        ? "sort term field must not be empty"
        : null;
    case "setGroup":
      return command.group.some((term) => term.field === "")
        ? "group term field must not be empty"
        : null;
    default:
      return null;
  }
};

const applyToSlice = (slice: Slice, command: SliceCommand): Slice => {
  switch (command.kind) {
    case "setPredicate":
      return setPredicate(
        slice,
        command.predicate,
        command.nth ?? 0,
        command.replaces,
      );
    case "removePredicate": {
      const removed = listConjuncts(slice, command.field, command.operator).at(
        command.nth ?? 0,
      );
      return removed === undefined
        ? slice
        : { ...slice, filter: withoutConjunct(slice.filter, removed) };
    }
    case "editPredicates": {
      // Resolved before anything moves.
      const removed = resolveRefs(slice, command.remove);
      return {
        ...slice,
        filter: [
          ...removed.reduce(withoutConjunct, slice.filter),
          ...command.add,
        ],
      };
    }
    case "setSearch":
      return {
        ...slice,
        search: command.search === "" ? null : command.search,
      };
    case "setSort":
      // Collapsed here as well as in canonicalization, so the query the
      // coordinator holds is the one the user can read back off the URL.
      return { ...slice, sort: collapseSortTerms(command.sort) };
    case "setGroup":
      return {
        ...slice,
        group: command.group.map((term) => ({ field: term.field })),
      };
  }
};

const rejected = (
  slice: Slice,
  window: ResultWindow,
  reason: string,
): QueryCommandResult => ({
  status: "rejected",
  reason,
  slice,
  window,
});
