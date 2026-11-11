import type { ComponentProps } from "react";

/**
 * The deep thinking toggle's text, one plain string per message, so an application
 * can supply translations. Each defaults to its English text.
 */
export interface DeepThinkingToggleMessages {
  label: string;
}

type OwnProps = {
  /** The component's text. Any message left out keeps its English default. */
  messages?: Partial<DeepThinkingToggleMessages>;
};

/**
 * Props extend the native props of the `<div>` root. The switch is submitted
 * under the name `deepThinking` when it is placed inside a form.
 */
export type DeepThinkingToggleProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
