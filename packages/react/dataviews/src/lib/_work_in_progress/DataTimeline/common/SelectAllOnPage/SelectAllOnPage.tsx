import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext, useId } from "react";
import { MessagesContext } from "../../../../common/index.js";
import {
  useDataViewsValue,
  useSelectAllOnPage,
} from "../../../../hooks/index.js";
import type { SelectAllOnPageProps } from "./types.js";

const componentCssClassName = "select-all";

/**
 * The checkbox selecting every event on the page, mixed while some are. It
 * adds and removes exactly the page's identities, leaving a selection made
 * elsewhere in the collection alone.
 */
export default function SelectAllOnPage({
  selection,
  ids: displayed,
}: SelectAllOnPageProps): ReactElement {
  const messages = useContext(MessagesContext);
  const ids = useDataViewsValue(displayed);
  const { checked, mixed, toggle } = useSelectAllOnPage({ selection, ids });
  const inputId = useId();
  // `indeterminate` is a property React never writes; a ref rebuilt with the state sets it each time.
  const mark = (node: HTMLInputElement | null): void => {
    if (node !== null) {
      node.indeterminate = mixed;
    }
  };
  return (
    <div className={componentCssClassName}>
      <CheckboxInput
        id={inputId}
        ref={mark}
        checked={checked}
        onChange={toggle}
      />
      <label htmlFor={inputId}>{messages.selectAllRows}</label>
    </div>
  );
}
