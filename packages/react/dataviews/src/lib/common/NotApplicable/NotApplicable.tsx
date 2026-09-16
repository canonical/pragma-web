import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../MessagesContext/index.js";
import type { NotApplicableProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-not-applicable";

/**
 * What a table's cell or a card's field shows for a field that does not
 * apply to its record: a dash, with the word for it read and not drawn.
 *
 * The dash alone would be indistinguishable from an empty field, which is a
 * different fact — the record has no value there, rather than the field not
 * being one of its own — so the two are told apart by what is read, not by
 * what is seen. The word is clipped rather than hidden, by its own
 * stylesheet: nothing references it, and a hidden node leaves the
 * accessibility tree, so a reader would meet the same silence as an empty
 * field.
 */
export default function NotApplicable(
  _props: NotApplicableProps,
): ReactElement {
  const messages = useContext(MessagesContext);
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className={componentCssClassName}>
        {messages.cellNotApplicable}
      </span>
    </>
  );
}
