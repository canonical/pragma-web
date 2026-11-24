import { type ReactElement, useContext } from "react";
import { AssistiveText } from "../AssistiveText/index.js";
import { MessagesContext } from "../contexts/index.js";
import type { NotApplicableProps } from "./types.js";

const componentCssClassName = "ds data-views-not-applicable";

/**
 * What a cell or a card's field draws where its field does not apply to the
 * record's type: a dash, with "Not applicable" read and not drawn, so a
 * reader tells it from an empty value.
 *
 * @implements ds:apps.subcomponent.data_views-not_applicable
 */
export default function NotApplicable({
  className,
  ...props
}: NotApplicableProps): ReactElement {
  const messages = useContext(MessagesContext);
  return (
    <span
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span aria-hidden="true">—</span>
      <AssistiveText>{messages.cellNotApplicable}</AssistiveText>
    </span>
  );
}
