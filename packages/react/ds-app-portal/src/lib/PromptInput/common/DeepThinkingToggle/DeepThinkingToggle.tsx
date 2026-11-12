import { SwitchInput } from "@canonical/react-ds-global-form";
import type React from "react";
import { useId } from "react";
import { DEFAULT_MESSAGES } from "./constants.js";
import type { DeepThinkingToggleProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds deep-thinking-toggle";

/**
 * A labelled switch for turning deep thinking mode on. Pass it to the
 * `controls` prop of a `PromptInput`.
 *
 * `<PromptInput controls={<PromptInput.DeepThinkingToggle />} />`
 */
const DeepThinkingToggle = ({
  className,
  messages: messagesProp,
  ...props
}: DeepThinkingToggleProps): React.ReactElement => {
  const messages = { ...DEFAULT_MESSAGES, ...messagesProp };
  const switchId = useId();

  return (
    <div
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      {...props}
    >
      <SwitchInput id={switchId} name="deepThinking" />
      <label htmlFor={switchId}>{messages.label}</label>
    </div>
  );
};

export default DeepThinkingToggle;
