import { Icon } from "@canonical/react-ds-global";
import { type ReactElement, useContext, useId } from "react";
import { MessagesContext } from "../../../../../../common/index.js";
import { Control } from "../Control/index.js";
import { Refusal } from "../Refusal/index.js";
import type { OrderProps } from "./types.js";

/** The order control: states the date's direction in force, and toggles it. */
export default function Order({ order, hydrated }: OrderProps): ReactElement {
  const messages = useContext(MessagesContext);
  const refusalId = useId();
  const { direction } = order;
  const text =
    direction === null
      ? messages.orderByDate
      : direction === "desc"
        ? messages.sortLatest
        : messages.sortEarliest;
  return (
    <div className="order">
      <Control
        href={order.href}
        hydrated={hydrated}
        label={text}
        describedBy={order.refusal === null ? undefined : refusalId}
        onActivate={order.onToggle}
      >
        {direction === null ? null : (
          <Icon icon={direction === "desc" ? "arrow-down" : "arrow-up"} />
        )}
        <span className={direction === null ? "label kept" : "label"}>
          {text}
        </span>
      </Control>
      <Refusal id={refusalId} refusal={order.refusal} />
    </div>
  );
}
