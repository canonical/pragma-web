import { Icon } from "@canonical/react-ds-global";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../../../common/index.js";
import { Control } from "../Control/index.js";
import type { ResetProps } from "./types.js";

/** The control lifting every restriction the header's filters hold. */
export default function Reset({
  reset,
  hydrated,
}: ResetProps): ReactElement | null {
  const messages = useContext(MessagesContext);
  return (
    <Control
      href={reset.href}
      hydrated={hydrated}
      label={messages.resetFilters}
      onActivate={reset.onReset}
    >
      <Icon icon="restart" />
      <span className="label">{messages.reset}</span>
    </Control>
  );
}
