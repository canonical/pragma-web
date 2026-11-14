import { Button } from "@canonical/react-ds-global";
import { type FocusEvent, type ReactElement, useCallback, useRef } from "react";
import { useDataViewsValue, useMergedRef } from "../../../../hooks/index.js";
import { useDataViewsRoot } from "../../hooks/index.js";
import type { DataViewsActionBarProps } from "./types.js";
import "./styles.css";

/**
 * `contrasted` is the design system's contrasted surface: it sets the
 * surface channel the stylesheet reads, so the bar needs no colour of its
 * own.
 */
const componentCssClassName = "ds data-table-action-bar contrasted";

/**
 * When one or more rows are selected in the table, a bulk action bar
 * appears at the bottom of the table, overlaying the footer area. The bar
 * displays the available action buttons and a deselect (X) button on the
 * far right. The bulk actions shown in the bar are defined by the designer
 * for each table instance. If the ActionBar is combined with the
 * DataTable.PersistentSelection it also displays the number of selected
 * items (e.g. "5 Selected").
 *
 * That is the design system's description of the block. What this
 * implementation covers: how much is selected, the actions a caller
 * places, and a button that clears the selection, grouped in a `fieldset`
 * the label names. The bar reads the enclosing root's selection and takes
 * no copy of it. It is absent while nothing is selected. The count is the
 * whole selection, across pages, not the rows on screen.
 *
 * When the bar leaves with the focus inside it — the selection cleared, or
 * every target of an action succeeded — the focus returns to the control it
 * entered the bar from, rather than to the document.
 *
 * @note Impure: hands the focus back as the bar's ref is released.
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_table-action_bar
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function ActionBar({
  label,
  indicator,
  children,
  className,
  onFocus,
  ref,
  ...rest
}: DataViewsActionBarProps): ReactElement | null {
  const { provider, messages } = useDataViewsRoot("ActionBar");
  const { selection } = provider;
  const count = useDataViewsValue(selection.state).ids.size;

  // Where focus entered the bar from. React releases the bar's ref before
  // it removes the bar, so a bar leaving with the focus inside it can still
  // find the focus there and hand it back.
  const origin = useRef<HTMLElement | null>(null);
  const returnFocus = useCallback(
    (bar: HTMLFieldSetElement) => () => {
      if (
        bar.contains(bar.ownerDocument.activeElement) &&
        origin.current?.isConnected
      ) {
        origin.current.focus();
      }
    },
    [],
  );
  // The bar's root is its own, so a caller's ref is merged onto it rather
  // than dropped: the focus goes back first, then the caller's ref is
  // released.
  const attach = useMergedRef(ref, returnFocus);

  const handleFocus = (event: FocusEvent<HTMLFieldSetElement>): void => {
    const from = event.relatedTarget;
    if (!event.currentTarget.contains(from)) {
      origin.current = from instanceof HTMLElement ? from : null;
    }
    onFocus?.(event);
  };

  if (count === 0) {
    return null;
  }
  return (
    <fieldset
      {...rest}
      ref={attach}
      aria-label={label ?? messages.selectionActions}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onFocus={handleFocus}
    >
      {indicator === undefined ? (
        <span role="status" className="indicator">
          {messages.rowsSelected(count)}
        </span>
      ) : (
        indicator
      )}
      {children}
      <Button
        type="button"
        importance="tertiary"
        icon="close"
        className="deselect"
        aria-label={messages.deselectRows(count)}
        onClick={() => {
          selection.clear();
        }}
      />
    </fieldset>
  );
}
