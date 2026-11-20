import type {
  Facet,
  Predicate,
  PredicateOperand,
  RowRecord,
  SchemaFieldDefinition,
  Slice,
  SortTerm,
} from "@canonical/dataviews-core";
import {
  areListsEqual,
  readProviderHost,
  resolveEffectiveOrdering,
} from "@canonical/dataviews-core/bindings";
import { useState } from "react";
import { ORDERING_TOPIC, SORT_REFUSAL_TOPIC } from "../../../common/index.js";
import {
  useDataViewsValue,
  useFacets,
  useIsHydrated,
} from "../../../hooks/index.js";
import { areSortTermsEqual } from "../../../utils/index.js";
import type {
  HeaderFilter,
  HeaderOrder,
  HeaderReset,
} from "../common/Header/index.js";
import leadSortTerm from "../utils/leadSortTerm.js";
import type {
  UseTimelineHeaderProps,
  UseTimelineHeaderResult,
} from "./types.js";

type Refusal = {
  /** The field refused, or the empty string for the ordering. */
  readonly control: string;
  readonly text: string;
  readonly filter: readonly Predicate[];
  readonly sort: readonly SortTerm[];
};

const arePredicatesEqual = (a: Predicate, b: Predicate): boolean =>
  a.field === b.field &&
  a.operator === b.operator &&
  areListsEqual(a.operands, b.operands, Object.is);

const readValues = (facet: Facet | undefined) =>
  facet?.kind === "values" ? facet.values : null;

const isOwnPredicate = (fields: ReadonlySet<string>, predicate: Predicate) =>
  fields.has(predicate.field) && predicate.operator === "isAny";

/**
 * The timeline's controls, wired to the collection's query: a filter menu
 * for the actor and the event type wherever the source restricts the field
 * and facets it, a reset while either holds a restriction, and the order
 * control wherever the source orders by the date. Each change edits the
 * query through the provider; each also has the destination it leads to
 * before scripts run. A refusal is said once and stands beside its control
 * while the query it was refused over stands.
 */
export default function useTimelineHeader<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  mapping,
  showActorFilter,
  showEventFilter,
  showSorting,
  actorFilterLabel,
  eventFilterLabel,
  dateTimeLabel,
  items,
  messages,
  announce,
}: UseTimelineHeaderProps<TFields, TRow>): UseTimelineHeaderResult {
  const { capabilities } = provider;
  const host = readProviderHost(provider);
  const slice = useDataViewsValue(provider.state, (state) => state.slice);
  const { latest } = useFacets({ provider });
  const hydrated = useIsHydrated();
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const standing =
    refusal !== null &&
    areListsEqual(refusal.filter, slice.filter, arePredicatesEqual) &&
    areListsEqual(refusal.sort, slice.sort, areSortTermsEqual)
      ? refusal
      : null;
  if (refusal !== null && standing === null) {
    setRefusal(null);
  }
  const readRefusal = (control: string): string | null =>
    standing?.control === control ? standing.text : null;
  const refuse = (control: string, text: string): void => {
    const { filter, sort } = provider.state.get().slice;
    setRefusal({ control, text, filter, sort });
  };
  // A changed query is read from its first page.
  const spell = (next: Slice): string | null => {
    const params = host.spellQuery({
      slice: next,
      window: { ...provider.state.get().window, page: 1, cursor: null },
    });
    return params === null ? null : `?${params}`;
  };

  const filters: HeaderFilter[] = [];
  const own = new Set<string>();
  const filtered = [
    {
      part: "actorId",
      labelPart: "actorName",
      label: actorFilterLabel,
      shown: showActorFilter,
    },
    {
      part: "eventType",
      labelPart: "eventLabel",
      label: eventFilterLabel,
      shown: showEventFilter,
    },
  ] as const;
  for (const { part, labelPart, label, shown } of filtered) {
    const field = mapping[part];
    if (
      !shown ||
      field === undefined ||
      capabilities.filter[field]?.includes("isAny") !== true ||
      !capabilities.facets.includes(field)
    ) {
      continue;
    }
    own.add(field);
    const values = readValues(latest?.[field]);
    if (values === null || values.length === 0) {
      continue;
    }
    const names = new Map<string, string>();
    for (const item of items) {
      const value = item[part];
      const name = item[labelPart];
      if (value !== undefined && name !== undefined) {
        names.set(value, name);
      }
    }
    const operands = new Map<string, PredicateOperand>(
      values.map(({ value }) => [String(value), value]),
    );
    const applied = (
      slice.filter.find(
        (predicate) =>
          predicate.field === field && predicate.operator === "isAny",
      )?.operands ?? []
    ).map(String);
    // Choosing the one value in force lifts the restriction; any other restricts the field to it.
    const restrictionAfter = (
      value: string,
      operand: PredicateOperand,
    ): Predicate | null =>
      applied.length === 1 && applied[0] === value
        ? null
        : { field, operator: "isAny", operands: [operand] };
    const sliceAfter = (value: string, operand: PredicateOperand): Slice => {
      const restriction = restrictionAfter(value, operand);
      const others = slice.filter.filter(
        (predicate) =>
          !(predicate.field === field && predicate.operator === "isAny"),
      );
      return {
        ...slice,
        filter: restriction === null ? others : [...others, restriction],
      };
    };
    filters.push({
      field,
      label,
      refusal: readRefusal(field),
      options: [...operands].map(([value, operand]) => ({
        value,
        label: names.get(value) ?? value,
        applied: applied.includes(value),
        href: spell(sliceAfter(value, operand)),
      })),
      onSelect: (value) => {
        const operand = operands.get(value);
        if (operand === undefined) {
          return;
        }
        const restriction = restrictionAfter(value, operand);
        const refusals =
          restriction === null
            ? host.removePredicate(field, "isAny")
            : host.setPredicate(restriction);
        if (refusals.length === 0) {
          setRefusal(null);
          return;
        }
        const text = messages.filterRefused(
          refusals.map(({ reason }) => reason),
          applied.length > 0,
        );
        refuse(field, text);
        announce(text);
      },
    });
  }

  const restricted = slice.filter.some((predicate) =>
    isOwnPredicate(own, predicate),
  );
  const reset: HeaderReset | null = restricted
    ? {
        href: spell({
          ...slice,
          filter: slice.filter.filter(
            (predicate) => !isOwnPredicate(own, predicate),
          ),
        }),
        onReset: () => {
          for (const field of own) {
            host.removePredicate(field, "isAny");
          }
          setRefusal(null);
        },
      }
    : null;

  const dateField = mapping.dateTime;
  let order: HeaderOrder | null = null;
  if (
    showSorting &&
    capabilities.sort.fields.includes(dateField) &&
    capabilities.sort.terms !== 0
  ) {
    const { terms } = resolveEffectiveOrdering(slice, capabilities.sort);
    const lead = terms.at(0);
    const direction = lead?.field === dateField ? lead.direction : null;
    const sort = leadSortTerm(
      terms,
      dateField,
      direction === "desc" ? "asc" : "desc",
      capabilities.sort.terms,
    );
    order = {
      direction,
      refusal: readRefusal(""),
      href: spell({ ...slice, sort }),
      onToggle: () => {
        const refusals = provider.setSort(sort);
        if (refusals.length === 0) {
          setRefusal(null);
          announce(
            messages.sortApplied(
              sort.map((term) => ({
                name: term.field === dateField ? dateTimeLabel : term.field,
                direction: term.direction,
              })),
            ),
            ORDERING_TOPIC,
          );
          return;
        }
        const text = messages.sortRefused(refusals.map(({ reason }) => reason));
        refuse("", text);
        announce(text, SORT_REFUSAL_TOPIC);
      },
    };
  }
  return { filters, reset, order, hydrated };
}
