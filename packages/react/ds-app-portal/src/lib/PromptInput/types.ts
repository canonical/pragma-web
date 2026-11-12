import type { ComponentProps, ReactElement, ReactNode } from "react";
import type {
  DeepThinkingToggleProps,
  PromptInputSuggestion,
  PromptInputSuggestionGroup,
} from "./common/index.js";

/**
 * The prompt input's text, one plain string per message, so an application can
 * supply translations. Each defaults to its English text.
 */
export interface PromptInputMessages {
  /** The textarea's accessible name. */
  prompt: string;
  /** The submit button's accessible name. */
  submit: string;
  /** The submit button tooltip's line for the send shortcut. */
  sendShortcut: string;
  /** The submit button tooltip's line for the new line shortcut. */
  newLineShortcut: string;
  /** The suggestions list's accessible name. */
  suggestions: string;
}

type OwnProps = {
  /**
   * Hint shown while the textarea is empty. Separate lines with `\n`; each
   * line is rendered on its own row.
   */
  placeholder?: string;
  /**
   * Shorter hint shown instead of `placeholder` when the field is narrow.
   * Assistive technology always reads the full `placeholder`.
   */
  compactPlaceholder?: string;
  /** The component's text. Any message left out keeps its English default. */
  messages?: Partial<PromptInputMessages>;
  /**
   * Optional controls shown beside the submit button, such as a
   * `DeepThinkingToggle` or a model selector. Nothing is rendered when it is
   * left out. A named form control inside it is submitted with the form.
   */
  controls?: ReactNode;
  /**
   * Grouped suggestions shown under the field while it has focus. The
   * component shows them as given: filtering and ranking are left to the
   * application. Nothing is shown when it is empty or left out.
   */
  suggestions?: PromptInputSuggestionGroup[];
  /**
   * Called when a suggestion is clicked, or picked with the arrow keys and
   * Enter. The list then closes until the prompt is edited again.
   */
  onSuggestionSelect?: (
    suggestion: PromptInputSuggestion,
    group: PromptInputSuggestionGroup,
  ) => void;
};

/**
 * Props extend the native props of the `<form>` root. The textarea is
 * submitted under the name `prompt`, so a consumer reads it from the
 * `FormData` of `onSubmit`.
 */
export type PromptInputProps = OwnProps &
  Omit<ComponentProps<"form">, keyof OwnProps>;

export type PromptInputComponent = ((
  props: PromptInputProps,
) => ReactElement) & {
  DeepThinkingToggle: (props: DeepThinkingToggleProps) => ReactElement;
};
