import {
  applyQueryCommand,
  spellWireKey,
  spellWireValues,
} from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import {
  useHydrationFocusHandoff,
  useIsHydrated,
} from "../../../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../../../hooks/index.js";
import type { FurtherConjunctProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-filters-further-conjunct";

/**
 * One further conjunct, read-only, with a Clear removing it alone: a link
 * and hidden inputs under its own ordinal before scripts, a button after.
 *
 * @implements ds:apps.subcomponent.data_views_filters-further_conjunct
 */
export default function FurtherConjunct({
  field,
  operator,
  nth,
  ordinal,
  operands,
  phrase,
  host,
  onLeave,
  className,
  ...rest
}: FurtherConjunctProps): ReactElement {
  const { messages } = useDataViewsRoot("Filters");
  const hydrated = useIsHydrated();
  const { link, button } = useHydrationFocusHandoff({ hydrated });
  const values = spellWireValues({ field, operator, operands });
  const name = messages.filterAlso(phrase, values);
  /**
   * Where the Clear leads without scripts: the query the core's own removal
   * makes of the applied one, so the link and the button arrive at the
   * same place.
   */
  const spellClear = (): string | null => {
    // Read once, as rendered: the link is drawn only before hydration, when
    // nothing moves the query under it.
    const { slice, window } = host.state.get();
    const cleared = applyQueryCommand(slice, window, {
      kind: "removePredicate",
      field,
      operator,
      nth,
    });
    const params = host.spellQuery({
      slice: cleared.slice,
      window: cleared.window,
    });
    return params === null ? null : `?${params}`;
  };
  const renderClear = (): ReactElement | null => {
    if (hydrated) {
      return (
        <Button
          ref={button}
          type="button"
          importance="tertiary"
          className="clear"
          onClick={() => {
            host.removePredicate(field, operator, nth);
            // The row leaves with the conjunct it showed.
            onLeave();
          }}
        >
          {messages.clearFilter(name)}
        </Button>
      );
    }
    const destination = spellClear();
    return destination === null ? null : (
      <a ref={link} className="clear" href={destination}>
        {messages.clearFilter(name)}
      </a>
    );
  };
  return (
    <li
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span className="conjunct">{name}</span>
      {values.map((value) => (
        <input
          key={value}
          type="hidden"
          name={spellWireKey(field, operator, ordinal)}
          value={value}
        />
      ))}
      {renderClear()}
    </li>
  );
}
