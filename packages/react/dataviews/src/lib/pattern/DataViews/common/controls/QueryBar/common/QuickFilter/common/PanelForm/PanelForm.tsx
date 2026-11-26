import type {
  DataViewsState,
  PredicateRef,
  Query,
} from "@canonical/dataviews-core";
import {
  spellWireKey,
  spellWireValues,
} from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { useMemo } from "react";
import { useDataViewsRoot } from "../../../../../../../../../_work_in_progress/DataViews/hooks/index.js";
import { useIsHydrated } from "../../../../../../../../../hooks/index.js";
import { interceptSubmit } from "../../../../../../../../../utils/index.js";
import { HiddenQueryFields } from "../../../../../HiddenQueryFields/index.js";
import type { PanelFormProps } from "./types.js";
import "./styles.css";
import { placeConjuncts } from "../../../../utils/index.js";

const componentCssClassName = "ds data-views-quick-filter-form";

/** The form's controls submit every parameter their own: none rides hidden twice. */
const NO_KEYS: readonly string[] = Object.freeze([]);

/** Two places of one conjunct. */
const isSameRef = (a: PredicateRef, b: PredicateRef): boolean =>
  a.field === b.field && a.operator === b.operator && a.nth === b.nth;

/**
 * A quick filter's panel as a GET form, where the location spells
 * addresses: its controls submit the clauses they stand for, a further
 * clause at a control's address rides hidden at its own place, and every
 * other parameter, the search `q`, each other clause and each clause of the
 * field the panel has no control for among them, rides in hidden fields,
 * so Apply changes only what the panel shows. Before scripts run,
 * Apply submits it; once they run, Apply and the hidden fields go, the
 * submission is held, and each control commits as it changes. Without an
 * address, the controls stand alone.
 */
export default function PanelForm({
  claimed,
  hasHref,
  children,
}: PanelFormProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const hydrated = useIsHydrated();
  // Held by what the claim holds, so a render claiming the same keeps one
  // destination, which the hidden fields follow by identity.
  const claimKey = JSON.stringify(claimed.map(({ ref }) => ref));
  // The query less the clauses the controls stand for, from the first page.
  const destinationOf = useMemo(() => {
    const held = JSON.parse(claimKey) as readonly PredicateRef[];
    return ({ slice, window }: DataViewsState<object>): Query => ({
      slice: {
        ...slice,
        filter: placeConjuncts(slice)
          .filter(({ ref }) => !held.some((place) => isSameRef(place, ref)))
          .map(({ predicate }) => predicate),
      },
      window: { ...window, page: 1, cursor: null },
    });
  }, [claimKey]);
  if (!hasHref) return <>{children}</>;
  return (
    <form
      method="get"
      className={componentCssClassName}
      onSubmit={interceptSubmit}
    >
      {children}
      {!hydrated && (
        <>
          <HiddenQueryFields
            provider={provider}
            readDestination={destinationOf}
            omit={NO_KEYS}
          />
          {/* A further conjunct at a control's address keeps its own place,
              so it never takes the control's name. */}
          {claimed
            .filter(({ ref }) => ref.nth > 0)
            .flatMap(({ predicate, ref }) =>
              spellWireValues(predicate).map((value) => {
                const name = spellWireKey(ref.field, ref.operator, ref.nth);
                return (
                  <input
                    key={`${name}=${value}`}
                    type="hidden"
                    name={name}
                    value={value}
                  />
                );
              }),
            )}
          <Button type="submit" importance="secondary" className="apply">
            {messages.submitQuickFilter}
          </Button>
        </>
      )}
    </form>
  );
}
